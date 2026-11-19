---
title: Agentic QA over Business Data
venue: Zalo AI Challenge 2026
date: 2026-11-01
datePrecision: month
summary:
  A tool-calling agent for Vietnamese questions over business data (CSV, Excel,
  SQLite) that combines typed DuckDB ingestion with SQL and Python execution.
  Fine-tuning MiMo-V2.6-Distill-Qwen-9B with LoRA on 4,145 teacher trajectories
  and quantizing to INT8 (W8A16) reached **0.856 Penalized Accuracy** on the
  1,000-question public leaderboard.
links:
  - label: Model
    url: https://huggingface.co/minhnguyent546/MiMo-V2.6-Distill-Qwen-9B-ciaz26-sft-A-text-W8A16
order: 1
---

LoRA fine-tuning on 4,145 teacher trajectories raised Penalized Accuracy on 173
held-out training questions by +0.150 (95% CI +0.102 to +0.202). Quantizing the
backbone to INT8 weights (W8A16) increased generation throughput by 21% and
expanded the KV cache pool by 2.7×, retaining 97.2% top-1 agreement with BF16
(mean KL divergence 0.0124). Built with DSPy, DuckDB, SGLang, TRL, PEFT (LoRA),
LLM Compressor, and Docker.
