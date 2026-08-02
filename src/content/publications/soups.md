---
title: Leveraging Model Soups to Classify Intangible Cultural Heritage Images from the Mekong Delta
shortTitle: Model Soups for ICH Classification
authors:
  - Quoc-Khang Tran
  - Minh-Thien Nguyen
  - Nguyen-Khang Pham
venue: Journal on Information Technologies and Communications, Vol. 2025 No. 3
date: 2026-03-02
arxivId: "2603.02181"
doi: 10.32913/mic-ict-research.v2025.n3.1395
links:
  - label: Code
    url: https://github.com/minhnguyent546/soups
thumbnail: ./soups-thumbnail.png
abstract:
  A framework that combines the hybrid CoAtNet architecture with model soups,
  a weight-space ensembling technique that averages checkpoints from one
  training run without raising inference cost. The paper analyses the effect
  through bias-variance decomposition.
bibtex: |
  @article{tran2026soups,
    title   = {Leveraging Model Soups to Classify Intangible Cultural Heritage Images from the Mekong Delta},
    author  = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Pham, Nguyen-Khang},
    journal = {Journal on Information Technologies and Communications},
    volume  = {2025},
    number  = {3},
    year    = {2026},
    doi     = {10.32913/mic-ict-research.v2025.n3.1395},
    url     = {https://arxiv.org/abs/2603.02181}
  }
order: 2
---

Classifying Intangible Cultural Heritage images from the Mekong Delta is hard
for the usual low-resource reasons: few annotations, classes that look alike,
and heterogeneous domains. Conventional models either overfit or show high
variance.

This work applies model soups on top of CoAtNet, averaging checkpoints from a
single training trajectory so that inference cost stays flat. Two strategies
are compared, greedy and uniform soup. A bias-variance decomposition shows the
gain comes from reduced variance at almost no cost in bias, and
cross-entropy-based distance metrics with MDS show that model soups picks
geometrically diverse checkpoints where Soft Voting blends redundant ones.

On ICH-17 — 7,406 images across 17 classes — the approach reaches 72.36%
top-1 accuracy and 69.28% macro F1, ahead of ResNet-50, DenseNet-121, and ViT.
