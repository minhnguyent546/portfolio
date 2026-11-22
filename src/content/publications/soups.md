---
title: Leveraging Model Soups to Classify Intangible Cultural Heritage Images from the Mekong Delta
shortTitle: Model Soups for ICH Classification
authors:
  - Quoc-Khang Tran
  - Minh-Thien Nguyen
  - Nguyen-Khang Pham
venue: Journal on Information Technologies and Communications, Vol. 2025 No. 3
date: 2025-10-01
arxivId: "2603.02181"
doi: 10.32913/mic-ict-research.v2025.n3.1395
links:
  - label: Code
    url: https://github.com/minhnguyent546/soups
thumbnail: ./soups-thumbnail.png
abstract:
  Classifying Mekong Delta intangible cultural heritage images is difficult
  under scarce annotations, subtle inter-class visual differences, and varied
  capture conditions. Single models in this low-resource regime often overfit or
  exhibit high variance, while multi-checkpoint ensembles add inference
  overhead. We combine CoAtNet with model soups (greedy and uniform weight
  averaging over checkpoints from one training run) to stabilize predictions at
  single-model inference cost. On ICH-17 (7,406 images, 17 classes), the method
  reaches 72.36% top-1 accuracy and 69.28% macro F1, outperforming ResNet-50,
  DenseNet-121, ViT, and prior work on the dataset. Bias-variance decomposition
  and multidimensional scaling (MDS) over cross-entropy distances show that
  model soups merge geometrically diverse checkpoints to cut variance with
  minimal added bias, whereas soft voting blends redundant ones.
bibtex: |
  @article{tran2025soups,
    title   = {Leveraging Model Soups to Classify Intangible Cultural Heritage Images from the Mekong Delta},
    author  = {Tran, Quoc-Khang and Nguyen, Minh-Thien and Pham, Nguyen-Khang},
    journal = {Journal on Information Technologies and Communications},
    volume  = {2025},
    number  = {3},
    year    = {2025},
    doi     = {10.32913/mic-ict-research.v2025.n3.1395},
    url     = {https://doi.org/10.32913/mic-ict-research.v2025.n3.1395}
  }
order: 2
---
