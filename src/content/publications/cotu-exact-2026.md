---
title: "CoTu at EXACT 2026: Neuro-Symbolic Reasoning for Transparent Educational QA"
shortTitle: CoTu at EXACT 2026
authors:
  - Quoc-Khang Tran*
  - Minh-Thien Nguyen*
  - Phu-An Thai
  - Xuan-Tung Bui
  - Truong-Thanh Ma
  - Nguyen-Khang Pham
venue: "Accepted at CSoNet 2026, Special Session: EXACT Competition, Springer LNCS"
date: 2026-09-08
arxivId: "2607.14735"
links:
  - label: Code
    url: https://github.com/minhnguyent546/EXACT-2026-CoTu
  - label: Hugging Face
    url: https://huggingface.co/collections/cotulabs/cotu-exact-2026
thumbnail: ../competitions/exact-2026-pipeline.png
abstract: >
  EXACT 2026 requires self-hosted open-weight models capped at 8B parameters to
  produce accurate, explainable answers on two tasks where direct generation
  from small models is unreliable: formal deduction over university regulations
  and multi-step physics. Team CoTu built a neuro-symbolic Program-of-Thought
  system on a 4B backbone that writes executable programs instead of direct
  answers: Z3 constraints whose entailment verdicts ground regulation
  deductions, and numerical Python for physics, both executed inside a sandboxed
  self-correction loop. The system achieved a perfect physics score in both
  selection rounds and earned the highest final-round technical score (13.44/15
  vs. 12.51 runner-up across automated accuracy and expert-judged reasoning
  depth). With the presentation score weighted equally, Team CoTu finished 3rd
  out of 50 teams overall.
bibtex: |
  @misc{tran2026cotu,
    title        = {CoTu at EXACT 2026: Neuro-Symbolic Reasoning for Transparent Educational QA},
    author       = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Thai, Phu-An and Bui, Xuan-Tung and Ma, Truong-Thanh and Pham, Nguyen-Khang},
    year         = {2026},
    eprint       = {2607.14735},
    archivePrefix = {arXiv},
    primaryClass = {cs.CL},
    url          = {https://arxiv.org/abs/2607.14735}
  }
order: 1
---
