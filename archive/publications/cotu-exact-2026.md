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
  This work presents Team CoTu's neuro-symbolic Program-of-Thought system for
  transparent educational question answering. A 4B open-weight backbone writes a
  program instead of stating an answer directly: a Z3 encoding whose entailment
  verdict supports the deduction for university regulation queries, and numerical
  Python for multi-step physics problems, both executed in a sandboxed
  self-correction loop. The system earned a perfect physics score in both
  selection rounds of EXACT 2026, took the highest technical score in the final
  (13.44/15 vs. 12.51 runner-up), and placed the team 3rd of 50 teams overall.
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
