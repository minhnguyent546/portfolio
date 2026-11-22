---
title: 2nd International XAI Challenge for Transparent Educational Question-Answering
venue: EXACT 2026, IEEE IJCNN 2026 Competition
date: 2026-06-25
result: Highest technical score, 3rd overall
summary:
  A neuro-symbolic Program-of-Thought system built on a 4B open-weight model for
  transparent educational QA under an 8B parameter cap. Team CoTu earned the
  **highest technical score** in the final (**13.44/15** vs. 12.51 runner-up)
  and, with the presentation score weighted equally, finished 3rd out of 50
  teams overall.
links:
  - label: Code
    url: https://github.com/minhnguyent546/EXACT-2026-CoTu
  - label: Technical report
    url: https://arxiv.org/abs/2607.14735
  - label: Hugging Face
    url: https://huggingface.co/collections/cotulabs/cotu-exact-2026
  - label: Leaderboard
    url: https://exact-ijcnn.vercel.app/leaderboard
  - label: Certificate (IEEE WCCI)
    url: /certificates/ieee-wcci-2026-exact-second-runner-up.pdf
  - label: Certificate (EXACT)
    url: /certificates/exact-2026-third-prize.pdf
figure:
  src: ./exact-2026-pipeline.png
  alt:
    Pipeline of Team CoTu's system. A 4B backbone routes each question by answer
    type, then emits either a Z3 encoding for regulation queries or numerical
    Python for physics, both passing through a shared self-correction loop to a
    unified explained-JSON output.
order: 3
---

EXACT 2026 asks for accurate, transparent answers from self-hosted open-weight
models capped at 8B parameters with a 60 s budget per query, over two tasks:
logical reasoning over university regulations and multi-step physics. Our system
writes a program instead of stating an answer: a Z3 encoding whose entailment
verdict supports the deduction for regulation queries, or numerical Python for
physics, both running in a sandboxed self-correction loop with a shared
explained-JSON format. Answer-type routing, distillation-based task fine-tuning,
and an unquantized BF16 serving stack (SGLang prefix caching, DFLASH speculative
decoding, and a fast non-thinking fallback) kept it inside the latency limit,
averaging 12.1 s on logic and 4.2 s on physics in the second selection round.
The system scored perfectly on physics in both selection rounds. The symbolic
solver produces verifiable deductions even at 4B scale; premise selection
remains the harder problem.
