<p align="center">
  <img src="frontend/public/EduAsitant-logo.png" alt="EduAssist Logo" width="200"/>
</p>

<h1 align="center">EduAssist — AI-Powered University Academic Advising System</h1>

<p align="center">
  <em>A Retrieval-Augmented Generation (RAG) platform for intelligent academic advising, built for Vietnamese university curricula</em>
</p>

<p align="center">
  <a href="#architecture">Architecture</a> •
  <a href="#rag-pipelines">RAG Pipelines</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#evaluation">Evaluation</a> •
  <a href="#citation">Citation</a>
</p>

---

## Overview

**EduAssist** is an end-to-end AI-powered academic advising system that transforms institutional documents (curricula, regulations, policies) into an interactive, conversational knowledge service. Students ask free-form questions in Vietnamese and receive precise, cited answers grounded in official university sources.

The system introduces **IA-ARF (Intent-Aware Adaptive Retrieval Framework)**, a novel RAG pipeline that detects user intent before retrieval, then selects an optimized retrieval strategy tailored to each intent class — yielding higher answer accuracy and relevance compared to standard chunk-based RAG baselines.

### Key Contributions

- **Intent-Aware Retrieval** — Five distinct retrieval strategies (`OVERVIEW`, `STRUCTURE`, `ROADMAP`, `FACTUAL`, `COMPARE`) dynamically selected based on automatic intent classification.
- **Major-Aware Filtering** — Domain-level filtering that distinguishes academic programs (e.g., Computer Science, Computer Engineering, AI) at retrieval time.
- **Chunk-to-Section Expansion** — Retrieves fine-grained chunks then expands to full document sections, preserving structural context.
- **Multi-Pipeline Evaluation** — Side-by-side evaluation of Naive, Standard (Chunk-Based Extent), and IA-ARF pipelines using RAGAS-compatible metrics.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client Application                          │
│                    Next.js 15 + React 19 Frontend                  │
│           (Chat UI, Document Management, Streaming SSE)            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST / SSE
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend                              │
│                                                                     │
│   ┌─────────────┐  ┌───────────────────────────────────────────┐   │
│   │  Auth Layer  │  │           RAG Orchestration               │   │
│   │ Email OTP +  │  │                                           │   │
│   │ Google OAuth │  │  ┌───────────┬───────────┬───────────┐   │   │
│   └─────────────┘  │  │   Naive   │ Standard  │  IA-ARF   │   │   │
│                     │  │ Pipeline  │ Pipeline  │ Pipeline  │   │   │
│                     │  │ (Baseline)│ (Chunk-   │ (Intent-  │   │   │
│                     │  │           │  Extent)  │  Based)   │   │   │
│                     │  └─────┬─────┴─────┬─────┴─────┬─────┘   │   │
│                     └────────┼───────────┼───────────┼──────────┘   │
│                              └───────────┼───────────┘              │
│                                          ▼                          │
│               ┌─────────────────────────────────────────┐          │
│               │        Shared Infrastructure            │          │
│               │  Elasticsearch 8.15 │ PostgreSQL 15     │          │
│               │  (vector + BM25)    │ (auth + history)  │          │
│               └──────────┬──────────┴───────────────────┘          │
└──────────────────────────┼──────────────────────────────────────────┘
                           ▼
              ┌─────────────────────────┐
              │     LLM Providers       │
              │  Ollama (Gemma 3:4B)    │
              │  OpenAI (GPT-4o-mini)   │
              │  BGE-M3 (Embeddings)    │
              │  Cohere (Reranking)     │
              └─────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS 4, Radix UI |
| **Backend** | Python 3.9+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| **Search** | Elasticsearch 8.15 (kNN vector + BM25 fulltext + RRF hybrid) |
| **Database** | PostgreSQL 15 (auth, chat history, document metadata) |
| **Embeddings** | BGE-M3 via Ollama (1024-dim) |
| **LLMs** | Gemma 3:4B (Ollama) / GPT-4o-mini (OpenAI) |
| **Reranking** | Cohere `rerank-multilingual-v3.0` |
| **Infrastructure** | Docker Compose, Ollama |

---

## RAG Pipelines

EduAssist implements **three progressively sophisticated RAG pipelines**, enabling controlled ablation studies:

### 1. Naive Pipeline (Baseline)

```
Query → Embedding → Chunk Search → Simple Prompt → LLM Answer
```

Direct chunk retrieval with no expansion, reranking, or query manipulation. Serves as the baseline for comparative evaluation.

### 2. Standard Pipeline (Chunk-Based Extent)

```
Query → Query Expansion → Chunk Search → Section Expansion → Reranking → LLM Answer
```

A three-engine architecture:
- **Retrieval Engine** — Query expansion → hybrid chunk search → section-level expansion → Cohere reranking
- **Prompt Engine** — Constructs prompts with hierarchical document context
- **Generation Engine** — Answer synthesis via LLM

### 3. IA-ARF Pipeline (Intent-Aware Adaptive Retrieval Framework)

```
Query → Intent Detection → Query Refinement → Strategy-Specific Retrieval → Optimized Prompt → LLM Answer
```

The main contribution of this work. An LLM-based intent classifier routes queries to one of five specialized retrieval strategies:

| Intent | Retrieval Strategy | Description |
|--------|-------------------|-------------|
| `OVERVIEW` | LLM Decomposition | Decomposes query into sub-queries targeting specific programs/courses |
| `STRUCTURE` | Section Search + Expansion | Retrieves structural sections (tables of contents, program outlines) |
| `ROADMAP` | Seed & Expand | Finds seed sections → expands via placeholder resolution |
| `FACTUAL` | Chunk Exact Match + Rerank | Precise chunk retrieval with aggressive reranking |
| `COMPARE` | Split-Retrieve-Merge | Splits entities → retrieves separately → merges interleaved |

---

## Features

- 🔍 **Hybrid Search** — Vector (kNN), fulltext (BM25), and hybrid (RRF) search modes
- 🎯 **Intent Detection** — Automatic 5-class intent classification for query routing
- 🏫 **Major-Aware Retrieval** — Filters by academic program (CS, CE, MMT, AI, etc.)
- 💬 **Conversational Chat** — Multi-turn dialogue with history contextualization
- 🔄 **Streaming Responses** — Real-time SSE streaming for answer generation
- 📚 **Document Management** — CRUD with DOCX/PDF ingestion and Markdown parsing
- 🔐 **Authentication** — Email OTP + Google OAuth with JWT tokens
- 📊 **RAGAS-Compatible Evaluation** — Automated evaluation with ground-truth test sets

---

## Getting Started

### Prerequisites

- Python 3.9+ and Node.js 18+
- Docker & Docker Compose
- [Ollama](https://ollama.com) installed locally
- ≥ 16 GB RAM recommended

### 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/University_Advising_System.git
cd University_Advising_System
```

### 2. Start Infrastructure

```bash
cd backend
docker-compose up -d    # Elasticsearch 8.15 + PostgreSQL 15
```

### 3. Set Up Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Pull required Ollama models
ollama pull bge-m3        # Embedding model (1024-dim)
ollama pull gemma3:4b     # LLM for generation

# Configure environment
cp .env.example .env      # Edit with your API keys

# Initialize database
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Set Up Frontend

```bash
cd ../frontend
npm install
npm run dev               # Starts on http://localhost:3000
```

### 5. Ingest Documents

```bash
# Use the API to ingest Markdown documents
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"directory": "data/raw"}'
```

Visit the API docs at **http://localhost:8000/docs** for full endpoint documentation.

---

## Evaluation

The system includes a comprehensive evaluation framework with ground-truth test queries (`tests/query.json`) across all five intent categories.

### Running Evaluations

```bash
cd backend

# Naive Pipeline (baseline)
python tests/run_naive_evaluation.py
python tests/run_naive_evaluation.py --factual --search-mode hybrid

# Standard Pipeline (Chunk-Based Extent)
python tests/run_pipeline_evaluation.py
python tests/run_pipeline_evaluation.py --structure

# IA-ARF Pipeline (Intent-Based)
python tests/run_ragas_evaluation.py
python tests/run_ragas_evaluation.py --overview --search-mode vector
```

### Filtering by Intent

All scripts support intent filters: `--overview`, `--structure`, `--roadmap`, `--factual`, `--compare`

### Output Format

Results are saved as RAGAS-compatible JSON in `tests/output/`:

```json
{
  "question": "...",
  "answer": "...",
  "contexts": ["..."],
  "ground_truth": "...",
  "metadata": {
    "intent": "FACTUAL",
    "search_mode": "hybrid",
    "response_time_ms": 2340,
    "num_sources": 5
  }
}
```

---

## Project Structure

```
University_Advising_System/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI application entry
│   │   ├── config.py                        # Pydantic Settings
│   │   ├── clients/                         # External service clients
│   │   │   ├── elasticsearch.py             # ES client (vector/fulltext/hybrid)
│   │   │   ├── ollama.py                    # Ollama (embedding + generation)
│   │   │   ├── openai_client.py             # OpenAI client
│   │   │   └── cohere_reranker.py           # Cohere reranker
│   │   ├── query/                           # RAG Pipeline implementations
│   │   │   ├── naive_pipeline.py            # Naive RAG (baseline)
│   │   │   ├── pipeline.py                  # Standard RAG (Chunk-Based Extent)
│   │   │   ├── intent_based_rag_pipeline.py # IA-ARF Pipeline
│   │   │   ├── intent_based_retrieval_engine.py
│   │   │   ├── intent_based_prompt_engine.py
│   │   │   └── query_expander.py            # Query expansion
│   │   ├── retrieval_engine/                # Intent detection & query refinement
│   │   ├── ingestion/                       # Document ingestion pipeline
│   │   ├── routers/                         # API route handlers
│   │   ├── services/                        # Business logic layer
│   │   └── utils/
│   │       └── chunker.py                   # MarkdownStructureChunker
│   ├── tests/                               # Evaluation scripts & test suites
│   ├── docker-compose.yml                   # Elasticsearch + PostgreSQL
│   └── requirements.txt
│
├── frontend/
│   ├── app/                                 # Next.js 15 App Router pages
│   │   ├── chat/                            # Standard chat interface
│   │   ├── chat-stream/                     # Streaming chat interface
│   │   ├── document/                        # Document management
│   │   └── login/                           # Authentication pages
│   ├── components/                          # Reusable React components
│   │   ├── chat/                            # Chat UI components
│   │   ├── Sidebar/                         # Navigation sidebar
│   │   └── ui/                              # Base UI components (Radix-based)
│   └── package.json
│
└── README.md                                # ← You are here
```

---

## API Reference

| Group | Method | Endpoint | Description |
|-------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/email/request-otp` | Request email OTP |
| | POST | `/api/auth/email/verify-otp` | Verify OTP |
| | POST | `/api/auth/google` | Google OAuth login |
| | GET | `/api/auth/me` | Current user profile |
| **Chat** | POST | `/api/chats/chat` | RAG chat (synchronous) |
| | POST | `/api/chats/chat/stream` | RAG chat (SSE streaming) |
| | GET | `/api/chats` | List chat sessions |
| **Query** | POST | `/api/query` | Direct RAG query |
| | GET | `/api/query/majors` | List available majors |
| **Ingestion** | POST | `/api/ingest` | Ingest markdown documents |
| | GET | `/api/ingest/status` | Index statistics |
| **Documents** | GET/POST/PUT/DELETE | `/api/docs` | Document CRUD |
| **System** | GET | `/health` | Health check |

---

## Configuration

All settings are managed via environment variables (`.env`). Key parameters:

```env
# LLM Provider
USE_OPENAI=false                    # Toggle OpenAI vs Ollama
OPENAI_API_KEY=sk-...               # Required if USE_OPENAI=true
COHERE_API_KEY=...                  # Optional, for reranking

# Retrieval Settings
SEARCH_MODE=hybrid                  # vector | fulltext | hybrid
ENABLE_RERANKING=true               # Cohere reranking toggle
ENABLE_QUERY_EXPANSION=true         # Query expansion toggle
TOP_K=10                            # Number of chunks to retrieve

# Infrastructure
ELASTICSEARCH_URL=http://localhost:9200
POSTGRES_HOST=localhost
OLLAMA_BASE_URL=http://localhost:11434
```

See `backend/.env.example` for the complete configuration reference.

---

## Citation

If you use this system in your research, please cite:

```bibtex
@inproceedings{eduassist2025,
  title     = {EduAssist: An Intent-Aware Adaptive Retrieval Framework 
               for AI-Powered University Academic Advising},
  author    = {[Author Names]},
  booktitle = {[Conference Name]},
  year      = {2025},
  institution = {University of Information Technology, VNU-HCM},
  note      = {Retrieval-augmented generation system with intent-based 
               adaptive retrieval for Vietnamese academic advising}
}
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgments

- **University of Information Technology (UIT), VNU-HCM** — Domain knowledge, institutional documents, and user testing
- **Ollama** — Local LLM deployment infrastructure
- **Elasticsearch** — Vector and hybrid retrieval capabilities  
- **Cohere** — Multilingual reranking model
- **LangChain** — LLM orchestration components

---

<p align="center">
  <strong>University of Information Technology — Vietnam National University, Ho Chi Minh City</strong><br/>
  Built with ❤️ for smarter academic advising
</p>
