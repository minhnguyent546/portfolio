---
title: Multiple-Choice Question Answering Pipeline for Technical Documents
venue: Viettel AI Race 2025
date: 2025-11-01
datePrecision: month
result: Top 3 on the public leaderboard
summary:
  A multimodal extraction and hybrid dense-sparse RAG pipeline over technical
  PDFs with tables, charts, and images. The system placed top 5 in round 1 and
  **top 3 in rounds 2–3** on the public leaderboard, answering **91.2%** of
  round-3 questions correctly while running 4× faster end to end with vLLM than
  Hugging Face inference.
links:
  - label: Code
    url: https://github.com/minhnguyent546/viettel-ai-race-vbkt
order: 4
---

The pipeline combines DeepSeek-OCR and Qwen3-VL-4B-Thinking for document
extraction (87.05 extraction score), hybrid dense-sparse RAG in Qdrant with
query and neighbor expansion, and Qwen3-4B-Thinking for answering.
