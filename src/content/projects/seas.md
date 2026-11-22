---
title: seas
summary: >
  A RAG admissions chatbot for Can Tho University built on an async FastAPI
  backend with Gemini 2.5 Flash streaming (4.7 s average response time).
  Retrieval ablations showed reranking drove most of the gain (MRR@10 0.184 →
  0.701), so the final pipeline paired reranking with query expansion, reaching
  0.771 Recall@10 and 0.713 NDCG@10.
stack:
  - RAG
  - LangChain
  - Qdrant
  - FastAPI
  - AWS
repo: https://github.com/minhnguyent546/seas
order: 2
---
