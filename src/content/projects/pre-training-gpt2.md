---
title: pre-training-gpt2
summary: Pre-trained GPT-2 (124M) from scratch on FineWeb-Edu 10BT using a
  TPUv3-8 with multi-device DDP via PyTorch/XLA, reaching ~21.02 perplexity
  (lower than OpenAI's original checkpoint). One code path runs on both CUDA
  and TPU.
stack:
  - PyTorch/XLA
  - DDP
  - TPU
  - CUDA
repo: https://github.com/minhnguyent546/pre-training-gpt2
order: 4
---
