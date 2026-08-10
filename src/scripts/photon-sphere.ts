/**
 * Photon sphere — WebGL2 runtime for the shader on `/photon-sphere`.
 *
 * The shader is the whole feature, so there is no scene graph here: one
 * full-screen triangle, and every uniform the fragment stage needs.
 */
import fragSource from "./photon-sphere.frag.glsl?raw";

// A triangle that covers the clip volume, addressed by gl_VertexID. No vertex
// buffer and no attributes. A quad would make the rasterizer walk its diagonal
// twice for a stage whose cost is entirely per-fragment.
const VERT_SOURCE = `#version 300 es
void main() {
  vec2 v[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  gl_Position = vec4(v[gl_VertexID], 0.0, 1.0);
}`;

// At up to 520 integration steps per pixel the fragment count is the entire
// budget. A 4K retina canvas is over 8M pixels, and the output is a smooth
// gradient field that survives a bilinear upscale invisibly.
const MAX_DPR = 1.5;
const MAX_PIXELS = 1_600_000;

// The camera orbit takes 90 seconds, so nothing on screen moves fast enough to
// need display-rate updates. Half the frames means half the GPU load, and at a
// motion this slow the difference is not visible. The margin stops a display
// whose refresh is not a multiple of the target from landing just past the
// deadline every time and halving the rate again.
const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS - 2;

// Where the still frame is sampled under `prefers-reduced-motion`. Chosen so
// the Doppler asymmetry is side-on and clearly visible. It is a path time: the
// camera path runs backward (see draw), so the reduced-motion calls pass
// ORBIT - STILL_TIME to land on this frame.
const STILL_TIME = 42;
// Camera azimuth rate in radians per second. Incommensurate with the other
// two camera periods, so the path never visibly repeats.
const AZIM_RATE = 0.07;
// One full azimuth orbit. The camera path is reversed around this point, so
// the angles in the orbit's second half — where the lensing reads best —
// lead instead of trailing.
const ORBIT = (2 * Math.PI) / AZIM_RATE;

const canvas = document.querySelector<HTMLCanvasElement>("#photon-sphere");
const failure = document.querySelector<HTMLElement>("#photon-sphere-failure");

// Read once, the idiom used in tty.ts.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas && failure) {
  run(canvas, failure);
}

function run(canvas: HTMLCanvasElement, failure: HTMLElement) {
  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let raf = 0;
  let start = performance.now();
  let hiddenAt = 0;
  let lastDraw = 0;

  // `no-console` is an error repo-wide, and a driver-specific GLSL rejection is
  // a real failure with nowhere else to go. The message element is the report.
  const fail = () => {
    stop();
    failure.hidden = false;
  };

  function compile(type: number, source: string) {
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      failure.dataset.log = gl.getShaderInfoLog(shader) ?? "";
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function init() {
    gl = canvas.getContext("webgl2", {
      // MSAA does nothing for a full-screen fragment shader, and there is no
      // geometry to depth-test or stencil against.
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return fail();

    const vert = compile(gl.VERTEX_SHADER, VERT_SOURCE);
    const frag = compile(gl.FRAGMENT_SHADER, fragSource);
    if (!vert || !frag) return fail();

    program = gl.createProgram();
    if (!program) return fail();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      failure.dataset.log = gl.getProgramInfoLog(program) ?? "";
      return fail();
    }
    gl.deleteShader(vert);
    gl.deleteShader(frag);
    gl.useProgram(program);

    // WebGL2 draws from a bound VAO, and some drivers reject the default one.
    gl.bindVertexArray(gl.createVertexArray());

    uniforms = Object.fromEntries(
      ["uResolution", "uTime", "uCamPos", "uCamRight", "uCamUp", "uCamFwd"].map(
        name => [name, gl!.getUniformLocation(program!, name)]
      )
    );

    resize(true);
    if (reduced) {
      draw(ORBIT - STILL_TIME);
    } else {
      // stop() first: a context restore re-enters init() while the previous
      // loop may still be scheduled, and two loops would double the frame rate.
      stop();
      start = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  // `force` is set by init(): after a context restore the canvas keeps its old
  // dimensions, so the size comparison below would skip the one call that
  // uploads uResolution to the new context and leave every pixel dividing by
  // zero. ResizeObserver still needs the comparison, which fires on every DPR
  // change and would otherwise reallocate the framebuffer for nothing.
  function resize(force = false) {
    if (!gl) return;
    const dpr = Math.min(devicePixelRatio, MAX_DPR);
    let w = Math.round(canvas.clientWidth * dpr);
    let h = Math.round(canvas.clientHeight * dpr);
    if (w < 1 || h < 1) return;

    // Both caps are needed: the DPR cap alone still lets a 5K display through,
    // and the pixel cap alone would render a phone at a wasteful DPR 3.
    const scale = Math.sqrt(MAX_PIXELS / (w * h));
    if (scale < 1) {
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    if (!force && canvas.width === w && canvas.height === h) return;

    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uniforms.uResolution ?? null, w, h);
    if (reduced) draw(ORBIT - STILL_TIME);
  }

  function draw(elapsed: number) {
    if (!gl) return;

    // Three motions on periods that share no factor, so the path never visibly
    // repeats. The orbit already carries the camera through z, but on a circle
    // of fixed radius that reads as flat sideways drift; the distance drift is
    // what gives it depth, moving the hole toward and away from the viewer. The
    // distance rate has to stay clear of the azimuth rate as well as being
    // incommensurate with it: at a near-equal rate the two would beat in and out
    // of phase over several minutes, and while in phase the camera approaches
    // and swings sideways together, which reads as one lopsided move. The
    // inclination base keeps the sweep away from 0, where the disk would
    // degenerate to a line. All three also sweep the Doppler asymmetry around.

    // The camera path runs backward from ORBIT, so the second half's angles
    // lead. uTime still gets `elapsed` below, so the disk keeps its established
    // spin direction — only the camera journey is reversed.
    const t = ORBIT - elapsed;
    const azim = t * AZIM_RATE;
    const incl = 0.4 + 0.3 * Math.sin(t * 0.045);
    const dist = 17.5 + 4.5 * Math.sin(t * 0.083);

    const pos: [number, number, number] = [
      dist * Math.cos(azim) * Math.cos(incl),
      dist * Math.sin(incl),
      dist * Math.sin(azim) * Math.cos(incl),
    ];

    // Camera basis on the CPU: three cross products per frame, against two
    // million identical copies of the same arithmetic per fragment.
    const fwd = normalize([-pos[0], -pos[1], -pos[2]]);
    const right = normalize(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);

    gl.uniform1f(uniforms.uTime ?? null, elapsed);
    gl.uniform3fv(uniforms.uCamPos ?? null, pos);
    gl.uniform3fv(uniforms.uCamRight ?? null, right);
    gl.uniform3fv(uniforms.uCamUp ?? null, up);
    gl.uniform3fv(uniforms.uCamFwd ?? null, fwd);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now: number) {
    // Gate inside the callback rather than scheduling with setTimeout: rAF stays
    // aligned to the display refresh, so the frames that do run are evenly
    // spaced instead of tearing against vsync.
    if (now - lastDraw >= FRAME_MS) {
      lastDraw = now;
      draw((now - start) / 1000);
    }
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // Wrapped, not passed directly: the observer hands its entries to the first
  // argument, which would set `force` on every callback.
  new ResizeObserver(() => resize()).observe(canvas);

  if (!reduced) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        stop();
      } else if (!raf) {
        // Rebase, so the disk resumes where it stopped instead of jumping
        // forward by the time spent in a background tab.
        start += performance.now() - hiddenAt;
        raf = requestAnimationFrame(frame);
      }
    });
  }

  canvas.addEventListener("webglcontextlost", event => {
    // Without preventDefault the browser never fires webglcontextrestored.
    event.preventDefault();
    stop();
  });

  // Every GL object dies with the context, so this rebuilds from scratch.
  canvas.addEventListener("webglcontextrestored", init);

  init();
}

function cross(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
