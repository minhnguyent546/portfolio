---
title: "ViCLIP-OT: A Structure-Aware Vision-Language Model for Vietnamese Image-Text Retrieval"
shortTitle: ViCLIP-OT
authors:
  - Quoc-Khang Tran*
  - Minh-Thien Nguyen*
  - Nguyen-Khang Pham
venue: "Accepted at Machine Vision and Applications (SCIE, Scopus Q2)"
date: 2026-10-31
arxivId: "2602.22678"
links:
  - label: Code
    url: https://github.com/minhnguyent546/ViCLIP-OT
  - label: Hugging Face
    url: https://huggingface.co/collections/minhnguyent546/research-viclip-ot
thumbnail: ./viclip-ot-thumbnail.png
abstract: ViCLIP-OT is a Vietnamese image-text retrieval model trained with a
  Similarity-Graph Regularized Optimal Transport (SIGROT) loss. Within each
  batch, a similarity graph from fixed pretrained embeddings guides
  bidirectional unbalanced optimal transport, reducing the modality gap with at
  most 2.7% extra training time. Across UIT-OpenViIC, KTVIC, and
  Crossmodal-3600, it outperforms CLIP, SigLIP, UOT-logit, and Direct Graph KL
  baselines, reaching 67.34% average Recall@K on UIT-OpenViIC (+5.75 pp over
  CLIP) and +11.72 pp over zero-shot CLIP on Crossmodal-3600. The SigLIP
  variant (ViSigLIP-OT) leads overall at 68.96%, ahead of zero-shot embedding
  models up to 4B parameters.
bibtex: |
  @misc{tran2026viclipot,
    title        = {ViCLIP-OT: A Structure-Aware Vision-Language Model for Vietnamese Image-Text Retrieval},
    author       = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Pham, Nguyen-Khang},
    year         = {2026},
    eprint       = {2602.22678},
    archivePrefix = {arXiv},
    primaryClass = {cs.CV},
    url          = {https://arxiv.org/abs/2602.22678}
  }
order: 0
---
