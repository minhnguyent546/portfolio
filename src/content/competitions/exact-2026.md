---
title: 2nd International XAI Challenge for Transparent Educational Question-Answering
venue: EXACT 2026, IEEE IJCNN 2026 Competition
date: 2026-06-25
result: Highest technical score, 3rd overall
summary:
  A neuro-symbolic Program-of-Thought pipeline for explainable educational QA
  under an 8B open-weight limit. Team CoTu took the highest final-round
  technical score of any team, 13.44/15, and placed 3rd overall once the
  equally weighted presentation score was included.
links:
  - label: Code
    url: https://github.com/minhnguyent546/EXACT-2026-CoTu
  - label: Technical report
    url: https://arxiv.org/abs/2607.14735
  - label: Leaderboard
    url: https://exact-ijcnn.vercel.app/leaderboard
figure:
  src: ./exact-2026-pipeline.png
  alt: Pipeline of the CoTu system. A 4B backbone routes each question by answer
    type, then emits either a Z3 encoding for regulation queries or numerical
    Python for physics, both passing through a shared self-correction loop to a
    unified explained-JSON output.
order: 1
---

EXACT 2026 asks for answers that are correct and explainable, from self-hosted
open-weight models capped at 8B parameters with a 60-second budget per query,
over two tasks: logical reasoning over university regulations, and multi-step
physics. The CoTu system writes a program instead of stating an answer, so
regulation queries become a Z3 encoding whose entailment verdict grounds the
deduction and physics becomes numerical Python, both sharing a self-correction
loop and the same explained-JSON structure. Answer-type routing,
distillation-based task fine-tuning, and SGLang with speculative decoding keep
it inside the latency limit, and the system scored perfectly on physics in both
automated selection rounds. Grounding answers in a symbolic solver produces
verifiable deductions even at 4B scale; what remains hard is premise selection,
not the deduction itself.
