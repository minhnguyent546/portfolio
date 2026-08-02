---
title: "ViCLIP-OT: The First Foundation Vision-Language Model for Vietnamese Image-Text Retrieval with Optimal Transport"
shortTitle: ViCLIP-OT
authors:
  - Quoc-Khang Tran
  - Minh-Thien Nguyen
  - Nguyen-Khang Pham
venue: Preprint, submitted to The Visual Computer
date: 2026-02-26
arxivId: "2602.22678"
links:
  - label: Code
    url: https://github.com/minhnguyent546/ViCLIP-OT
abstract:
  A foundation vision-language model for Vietnamese image-text retrieval. It
  pairs CLIP-style contrastive learning with a Similarity-Graph Regularized
  Optimal Transport (SIGROT) loss to improve cross-modal consistency and reduce
  the modality gap.
bibtex: |
  @misc{tran2026viclipot,
    title        = {ViCLIP-OT: The First Foundation Vision-Language Model for Vietnamese Image-Text Retrieval with Optimal Transport},
    author       = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Pham, Nguyen-Khang},
    year         = {2026},
    eprint       = {2602.22678},
    archivePrefix = {arXiv},
    primaryClass = {cs.CV},
    url          = {https://arxiv.org/abs/2602.22678}
  }
order: 1
---

Most vision-language models are tuned for high-resource languages and do
poorly on Vietnamese. ViCLIP-OT adds a Similarity-Graph Regularized Optimal
Transport (SIGROT) loss to CLIP-style contrastive training, which aligns the
two modalities more tightly and narrows the modality gap.

On three Vietnamese benchmarks — UIT-OpenViIC, KTVIC, and Crossmodal-3600 —
the model beats CLIP and SigLIP baselines in both in-domain and zero-shot
settings. It reaches an average Recall@K of 67.34% on UIT-OpenViIC, 5.75
points above CLIP, and beats CLIP by 11.72 points zero-shot on Crossmodal-3600.
Embedding-space analysis confirms the improved alignment.
