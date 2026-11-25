---
title: "ViCLIP-OT: A Structure-Aware Vision-Language Model for Vietnamese Image-Text Retrieval"
shortTitle: ViCLIP-OT
authors:
  - Quoc-Khang Tran*
  - Minh-Thien Nguyen*
  - Nguyen-Khang Pham
venue: "Machine Vision and Applications, Vol. 38, Art. 26 (SCIE, Scopus Q2)"
date: 2026-11-25
arxivId: "2602.22678"
doi: 10.1007/s00138-026-01956-0
links:
  - label: Code
    url: https://github.com/minhnguyent546/ViCLIP-OT
  - label: Hugging Face
    url: https://huggingface.co/collections/minhnguyent546/research-viclip-ot
thumbnail: ./viclip-ot-thumbnail.png
abstract: >
  Vietnamese image-text retrieval faces scarce aligned corpora and
  vision-language models skewed toward high-resource languages, while standard
  contrastive objectives enforce only instance-level discrimination, ignoring
  batch neighborhood structure and leaving a persistent modality gap. We propose
  ViCLIP-OT, which pairs contrastive learning with a Similarity-Graph Regularized
  Optimal Transport (SIGROT) loss: within each batch, fixed pretrained embeddings
  define a relational graph that guides bidirectional unbalanced transport
  across modalities at up to 2.7% extra training time. Across UIT-OpenViIC,
  KTVIC, and Crossmodal-3600, ViCLIP-OT outperforms CLIP, SigLIP, UOT-logit, and
  Direct Graph KL baselines, reaching 67.34% average Recall@K on UIT-OpenViIC
  (+5.75 pp over CLIP) and +11.72 pp over CLIP in zero-shot Crossmodal-3600
  retrieval. Its SigLIP variant (ViSigLIP-OT) leads on UIT-OpenViIC at 68.96%,
  ahead of pretrained multimodal baselines up to 4B parameters evaluated
  zero-shot, while embedding-space analysis shows that SIGROT narrows the
  modality gap.
bibtex: |
  @article{tran2026viclipot,
    title   = {{ViCLIP-OT}: A Structure-Aware Vision-Language Model for {Vietnamese} Image-Text Retrieval},
    author  = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Pham, Nguyen-Khang},
    journal = {Machine Vision and Applications},
    volume  = {38},
    number  = {1},
    pages   = {26},
    year    = {2026},
    month   = nov,
    issn    = {1432-1769},
    doi     = {10.1007/s00138-026-01956-0},
    url     = {https://doi.org/10.1007/s00138-026-01956-0}
  }
order: 0
---
