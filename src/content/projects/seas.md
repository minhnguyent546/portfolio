---
title: seas
summary: >
  A RAG chatbot that answers enrollment questions for Can Tho University, built
  with LangChain and Qdrant on an async FastAPI backend. Comparing retrieval
  strategies showed reranking drove most of the gain: MRR@10 rose from 0.18 to
  0.70, so the final system paired reranking with query expansion.
stack:
  - Python
  - FastAPI
  - SQLAlchemy
  - Qdrant
repo: https://github.com/minhnguyent546/seas
order: 2
---
