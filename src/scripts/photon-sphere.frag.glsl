#version 300 es
// Schwarzschild black hole. Every pixel integrates its own null geodesic, so
// the lensing, the shadow, and the Einstein ring are not drawn anywhere in this
// file — they fall out of the integration.
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uCamPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform vec3 uCamFwd;

out vec4 fragColor;

// Units of the Schwarzschild radius: rs = 1. Every constant collapses to a
// small number and the horizon test becomes `u > 1`.
const float R_PHOTON = 1.5;   // photon sphere
const float R_ISCO = 3.0;     // innermost stable circular orbit, disk edge
const float R_OUT = 8.5;      // outer disk edge
const float U_ESCAPE = 1.0 / 60.0;
const float PI = 3.14159265359;
// 520 steps at DPHI = 0.02 sweeps about 596 degrees. The direct image needs only
// ~180, but the n=1 lensing ring is light that made one extra half-loop, so it
// needs ~540 before it can form at all. Stopping short of that is what forces a
// renderer to fake the bright rim at the shadow edge.
const int MAX_STEPS = 520;
const float DPHI = 0.02;
// Angle subtended by one pixel: the vertical view spans 2/fov radians over
// uResolution.y pixels. Only the scale matters, so this stays a constant rather
// than tracking the resolution uniform; it sets which noise octaves survive on
// the disk, and a half-resolution canvas wants that threshold in the same place.
const float PIXEL_ANGLE = 2.0 / (1.5 * 900.0);

// ---------------------------------------------------------------- noise

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic fade, not the cheaper f*f*(3-2f). Both match value and slope across
  // a cell boundary, but only this one matches curvature, and the disk pushes
  // this through a power curve that would otherwise expose the second-derivative
  // break.
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
             f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; ++i) {
    v += a * valueNoise(p);
    // Rotate as well as scale. Without the rotation every octave shares the
    // same axis-aligned lattice, so their cell edges land on top of each other
    // and reinforce instead of averaging away.
    p = mat2(0.80, 0.60, -0.60, 0.80) * p * 2.31;
    a *= 0.5;
  }
  return v;
}

// Bandlimited fbm: octaves finer than the pixel footprint are dropped, and the
// result is renormalized by the surviving weights. Fading them toward the mean
// instead would lower the contrast of the whole texture, which is the same
// operation as deleting the noise.
float fbmLod(vec2 p, float cell) {
  float v = 0.0;
  float a = 0.5;
  float n = 0.0;
  for (int i = 0; i < 6; ++i) {
    // The octave's lattice period in domain units halves each step; keep it
    // while a pixel still spans less than half a cell.
    float w = smoothstep(0.7, 0.25, cell);
    v += a * w * valueNoise(p);
    n += a * w;
    p = mat2(0.80, 0.60, -0.60, 0.80) * p * 2.31;
    a *= 0.5;
    cell *= 2.31;
  }
  return v / max(n, 1e-4) * 0.9375;
}

// ---------------------------------------------------------------- colour

// Tanner Helland's fit to the Planckian locus, in Neil Bartlett's refinement,
// with the 0-255 constants divided by 255. A true Planck integral needs the CIE
// colour matching functions; this is the standard cheap stand-in and is what
// makes the disk read as hot metal rather than as an orange gradient.
vec3 blackbody(float kelvin) {
  float t = clamp(kelvin, 1000.0, 40000.0) / 100.0;
  vec3 c;

  c.r = t <= 66.0 ? 1.0 : 1.29293618606274509 * pow(t - 60.0, -0.1332047592);

  c.g = t <= 66.0
    ? 0.39008157876901960 * log(t) - 0.63184144378862000
    : 1.12989086089529411 * pow(t - 60.0, -0.0755148492);

  c.b = t >= 66.0 ? 1.0
      : t <= 19.0 ? 0.0
      : 0.54320678911019607 * log(t - 10.0) - 1.19625408914447844;

  return clamp(c, 0.0, 1.0);
}

// ACES filmic approximation. The g^4 beaming term drives the approaching limb
// well past 1.0; without this it clips to a flat white blob and loses all
// structure.
vec3 tonemap(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14),
               0.0, 1.0);
}

// ---------------------------------------------------------------- background

// Sampled by the geodesic's escape direction, not the initial ray direction.
// That substitution is the whole point: the deflection is the visible effect.
vec3 starfield(vec3 dir) {
  vec3 col = vec3(0.0);

  // Two cell scales so the field does not read as a single regular grid.
  for (int scale = 0; scale < 2; ++scale) {
    float cells = scale == 0 ? 90.0 : 165.0;
    vec3 p = dir * cells;
    vec3 cell = floor(p);
    vec3 rnd = hash33(cell);

    // Sparse, but dense enough that the lensing shears a visible field rather
    // than a few isolated points.
    if (rnd.x > 0.72) {
      vec3 centre = cell + 0.15 + 0.7 * hash33(cell + 7.1);
      float d = length(p - centre);
      float mag = pow(hash11(rnd.y * 91.7), 6.0);
      float twinkle = 0.85 + 0.15 * sin(uTime * 1.7 + rnd.z * 43.0);
      // Compact and clamped to zero at the cell edge. A bare exp() never
      // reaches zero, which turns every populated cell into a glow patch and
      // washes the sky out instead of putting a point on it.
      float star = mag * twinkle * smoothstep(0.42, 0.0, d);

      // Real stellar colours, from the same blackbody fit.
      vec3 tint = blackbody(mix(3200.0, 11000.0, rnd.z));
      col += star * tint * 2.2;
    }
  }

  // A faint band so the lensing distorts a continuous field and not only
  // isolated points. A warped point is still a point.
  float lat = asin(clamp(dir.y, -1.0, 1.0));
  float lon = atan(dir.z, dir.x);
  float band = exp(-lat * lat * 22.0);
  float dust = fbm(vec2(lon * 2.4, lat * 5.0) + 11.0);
  dust *= dust;
  col += band * dust * vec3(0.020, 0.019, 0.030);

  return col;
}

// ---------------------------------------------------------------- disk

// One sample of the accretion disk, with both relativistic shifts applied.
vec3 diskSample(vec3 hit, float r, vec3 khat) {
  float azim = atan(hit.z, hit.x);

  // Kepler's third law: inner material visibly outruns outer. The shear is a
  // strong realism cue and it is free.
  float orbit = 0.42 * pow(R_ISCO / r, 1.5);

  // Anisotropic, so the noise resolves into long filaments wound around the hole
  // rather than round eddies. Differential rotation shears real disk structure
  // this way.
  vec2 q = vec2(log(r) * 17.0, azim * 6.0 - uTime * orbit * 2.0);

  // How much of the disk one pixel covers. A pixel subtends a fixed angle, so
  // its footprint grows with distance and then divides by the cosine of the
  // grazing angle: seen edge-on, one pixel smears across a long chord of the
  // disk. dFdx would measure this directly but is undefined here, because this
  // function is called from a branch that neighbouring pixels in a quad do not
  // all take.
  float grazing = max(abs(khat.y), 0.02);
  float footprint = length(hit - uCamPos) * PIXEL_ANGLE / grazing;

  // In noise-lattice cells rather than world units: the radial axis of `q` is
  // log(r) * 17, whose derivative is 17/r.
  float cell = footprint * 17.0 / r;
  float turb = fbmLod(q, cell) * 0.65 + fbmLod(q * 2.3 + 4.0, cell * 2.3) * 0.35;

  // Banded hard, so the filaments read as distinct bright threads with dark
  // lanes between them. A plain fbm gives a continuous wash at any amplitude.
  turb = pow(turb, 2.0) * 2.2;

  // Radial falloff, with the inner edge left sharp: material there is about to
  // cross the ISCO, so a soft inner edge would be wrong. The outer taper starts
  // early, which keeps the lit band a narrow ribbon rather than a broad wash.
  float edge = smoothstep(R_OUT, R_OUT * 0.45, r) * smoothstep(R_ISCO, R_ISCO * 1.06, r);
  float density = edge * (0.20 + 0.95 * turb);
  if (density <= 0.001) return vec3(0.0);

  // Keplerian speed in units of c. 0.41c at the ISCO, so the beaming asymmetry
  // is dramatic rather than a subtle tint.
  float v = sqrt(0.5 / r);
  vec3 vdir = normalize(cross(vec3(0.0, 1.0, 0.0), hit));
  float gamma = 1.0 / sqrt(1.0 - v * v);

  // Special-relativistic Doppler, then gravitational redshift. One combined
  // factor drives both the colour and the brightness.
  float doppler = 1.0 / (gamma * (1.0 - v * dot(vdir, khat)));
  float grav = sqrt(max(1.0 - 1.0 / r, 0.0));
  float g = doppler * grav;

  // Standard thin-disk profile. 13000 K at the ISCO puts the inner disk white
  // and lets the r^-3/4 falloff carry the outer edge down through peach, which
  // is the colour range the eye reads as hot plasma rather than as fire.
  float tEmit = 13000.0 * pow(R_ISCO / r, 0.75);

  // Intensity goes as g^4: Lorentz invariance of I/nu^3 plus the one-power
  // frequency shift. g or g^2 is the usual way this gets rendered wrong.
  float g4 = g * g * g * g;

  // The scale is set so the receding limb still has tone after tonemapping.
  // Higher and g^4 drives the whole disk into the flat top of the curve, which
  // loses the beaming asymmetry that the g^4 is there to produce.
  return blackbody(tEmit * g) * g4 * density * 0.30;
}

// ---------------------------------------------------------------- main

void main() {
  // Normalized by the height, so the horizontal extent grows with the aspect.
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

  // Multiplies the forward component, so it works as an inverse zoom: larger
  // narrows the cone and magnifies the subject. 1.5 frames the r = 8.5 disk on
  // a landscape viewport. A portrait one has less width per unit height, so it
  // needs a wider cone, not a tighter one, or the disk runs off the sides.
  float fov = 1.5 * min(uResolution.x / uResolution.y, 1.6) / 1.6;
  vec3 rd = normalize(uCamFwd * fov + uCamRight * uv.x + uCamUp * uv.y);

  // Every null geodesic in Schwarzschild lies in a plane through the origin.
  // Building that plane's basis turns a 3D integration into one 2D ODE in
  // (u, phi), which is what makes this run in real time.
  vec3 e1 = normalize(uCamPos);
  vec3 n = cross(uCamPos, rd);
  // A ray aimed exactly at the centre is coplanar with the camera radius and
  // leaves the normal undefined. One pixel, but a NaN there is visible.
  n = length(n) < 1e-6 ? normalize(cross(e1, uCamRight)) : normalize(n);
  vec3 e2 = normalize(cross(n, e1));

  float u = 1.0 / length(uCamPos);
  // du/dphi from the ray direction projected onto the plane basis.
  float du = -u * dot(rd, e1) / dot(rd, e2);
  float phi = 0.0;

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  bool captured = false;

  vec3 pos = uCamPos;
  float yPrev = uCamPos.y;

  // Leapfrog, not RK4: symplectic and one force evaluation per step, so the
  // same budget buys about four times the steps. Step count is what resolves
  // the repeated disk crossings near the hole.
  du += 0.5 * DPHI * (-u + 1.5 * u * u);

  for (int i = 0; i < MAX_STEPS; ++i) {
    float uPrev = u;
    u += DPHI * du;
    phi += DPHI;
    du += DPHI * (-u + 1.5 * u * u);

    if (u > 1.0) { captured = true; break; }   // crossed the horizon
    if (u < U_ESCAPE && du < 0.0) break;       // escaped outward

    float c = cos(phi);
    float s = sin(phi);
    vec3 dirp = c * e1 + s * e2;
    pos = dirp / u;

    // The disk lies in the equatorial plane, so a crossing is a sign change
    // in y. Not breaking on the first one is what shows the disk bent over the
    // top and under the bottom of the hole.
    if (pos.y * yPrev < 0.0 && alpha < 0.99) {
      // y(phi) = (cos(phi) e1.y + sin(phi) e2.y) / u(phi), so the crossing is
      // where the bracket vanishes and the 1/u factor is irrelevant. That has a
      // closed form: the bracket is a single sinusoid, zero at atan2(-e1.y, e2.y)
      // modulo pi. Interpolating y linearly between two steps instead leaves an
      // error that depends on the step size, which a finer DPHI has to pay for.
      float phiZero = atan(-e1.y, e2.y);
      // Fold that root into this step's bracket. floor() picks the branch, so
      // the result is the crossing inside (phi - DPHI, phi] without a search.
      float phic = phiZero + PI * ceil((phi - DPHI - phiZero) / PI);

      float cc = cos(phic);
      float sc = sin(phic);

      // u at the crossing, from the same leapfrog state. The step is small and
      // u is smooth in phi, so a linear read is accurate here; it is only y
      // that needed the exact treatment, because y passes through zero and its
      // relative error is unbounded there.
      float fc = (phic - (phi - DPHI)) / DPHI;
      float uc = mix(uPrev, u, fc);
      float rc = 1.0 / uc;

      if (rc > R_ISCO && rc < R_OUT) {
        vec3 hit = (cc * e1 + sc * e2) / uc;

        // Photon direction at the hit, from d/dphi of (cos phi e1 + sin phi e2)/u.
        // Differencing two interpolated positions instead loses precision at the
        // small step size and puts a divide near zero in the path.
        float duc = mix(du - DPHI * (-uc + 1.5 * uc * uc), du, fc);
        vec3 khat = normalize((-sc * e1 + cc * e2) / uc
                              - (cc * e1 + sc * e2) * duc / (uc * uc));

        vec3 emit = diskSample(hit, rc, khat);
        // Front to back: the first crossing is nearest the camera. The opacity
        // per crossing has to stay low enough that the second and third ones
        // still come through: those are the n=1 lensing ring, which is the rim
        // that actually reads as bright at the shadow edge (Gralla, Holz & Wald
        // 2019 — the n>=2 photon ring proper diverges only logarithmically and
        // contributes almost nothing to the flux).
        col += (1.0 - alpha) * emit;
        alpha += (1.0 - alpha) * 0.38;
      }
    }
    yPrev = pos.y;
  }

  // A captured ray contributes nothing more: the horizon emits nothing, and the
  // bright rim at the shadow edge is not a feature in its own right. It is the
  // disk seen again through its own lensed higher-order images, so it is already
  // in `col` from the crossings above, with the disk's colour and its Doppler
  // asymmetry. Drawing a rim here instead is the standard way this gets faked.
  if (!captured) {
    // The escape direction, not the entry direction. This substitution is where
    // the deflection becomes visible. Same analytic tangent as the disk hit.
    float c = cos(phi);
    float s = sin(phi);
    vec3 escapeDir = normalize((-s * e1 + c * e2) / u
                               - (c * e1 + s * e2) * du / (u * u));
    col += (1.0 - alpha) * starfield(escapeDir);
  }

  vec3 srgb = pow(tonemap(col), vec3(1.0 / 2.2));

  // Dither before the 8-bit write. The disk is a shallow gradient, so a band of
  // pixels rounds to one code value and the boundaries between codes read as
  // contour lines across the disk. Half a code of noise moves each pixel over
  // the rounding threshold with a probability set by its true value.
  fragColor = vec4(srgb + (hash21(gl_FragCoord.xy) - 0.5) / 255.0, 1.0);
}
