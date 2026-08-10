---
title: ViREx-Bench
summary: >
  An evaluation framework for inference-time scaling on Vietnamese reasoning.
  It supports 7 reasoning strategies on any OpenAI-compatible model and was
  benchmarked against 8 models, from chain-of-thought and self-consistency to
  tree-of-thought and the proposed symbolic-reasoning pipeline
  (program-of-thought + Z3). Search-based methods spend up to 32× more tokens
  without beating plain chain-of-thought; the proposed pipeline led them in
  accuracy at 3.3 model calls per item, versus 18–28 for the others.
stack:
  - Python
  - Inference-time scaling
  - Evaluation
repo: https://github.com/minhnguyent546/ViREx-Bench
order: 1
featured: true
---
