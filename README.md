<p align="center">
  <img src="frontend/public/EduAsitant-logo.png" alt="EduAssist Logo" width="200"/>
</p>

<h1 align="center">Intent-Aware Adaptive Retrieval Framework<br/>for AI-Powered University Academic Advising</h1>

<p align="center">
  <em>An intent-driven RAG system that dynamically selects retrieval strategies based on query classification, purpose-built for Vietnamese academic advising</em>
</p>

<p align="center">
  <a href="#motivation">Motivation</a> •
  <a href="#proposed-framework-ia-arf">IA-ARF Framework</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#evaluation">Evaluation</a> •
  <a href="#citation">Citation</a>
</p>

---

## Motivation

Standard RAG systems apply a **uniform retrieval strategy** to all queries — regardless of whether a user asks for a broad program overview, a specific credit count, or a semester-by-semester roadmap. This leads to suboptimal context quality: overview queries retrieve overly narrow chunks, factual queries drown in irrelevant sections, and comparative queries miss information from one of the entities being compared.

**EduAssist** addresses this by introducing **IA-ARF (Intent-Aware Adaptive Retrieval Framework)** — a RAG pipeline that first classifies the user's query intent, then activates a **purpose-built retrieval strategy** optimized for that intent class. This yields more relevant context, better-structured prompts, and ultimately higher answer quality.

---

## Proposed Framework: IA-ARF

<p align="center">
  <img src="IA-ARF-Architecture System.png" alt="IA-ARF System Architecture" width="800"/>
</p>

<p align="center">
  <em>Figure 1. IA-ARF System Architecture — Intent-Oriented Data Ingestion, Adaptive Retrieval Engine, Augmentation Engine, and Generation Engine.</em>
</p>

### Intent Classification

An LLM-based classifier routes each incoming query into one of **five intent classes**, determined via priority-ordered rules:

| Priority | Intent | Trigger Condition | Example Query |
|:--------:|--------|-------------------|---------------|
| 1 | `COMPARE` | Two explicitly named entities + comparison keywords | *"Ngành CNTT khác gì ngành KTMT?"* |
| 2 | `ROADMAP` | References a specific semester or year number | *"Học kỳ 5 ngành AI học những môn gì?"* |
| 3 | `OVERVIEW` | Asks broadly about a program or course | *"Ngành Công nghệ thông tin học gì?"* |
| 4 | `FACTUAL` | Seeks a specific short-answer fact | *"Môn Mạng máy tính bao nhiêu tín chỉ?"* |
| 5 | `STRUCTURE` | Default — regulations, policies, processes | *"Điều kiện tốt nghiệp là gì?"* |

### Five Adaptive Retrieval Strategies

Each intent activates a **distinct retrieval strategy** tailored to the information need:

#### 1. `OVERVIEW` → LLM Decomposition

```
Query → LLM detects target type (MAJOR vs COURSE)
      → Generates 3 targeted sub-queries
      → Retrieves sections for each sub-query
      → Merges and deduplicates
```

- **MAJOR queries** decompose into: knowledge blocks, study format/duration, career opportunities
- **COURSE queries** decompose into: general info, course description, teaching plan
- Returns **section-level** results (H2 heading granularity)

#### 2. `STRUCTURE` → Section Search + Expansion

```
Query → Chunk search (hybrid) → Cohere rerank → Extract section IDs → Expand to full sections
```

- Retrieves fine-grained chunks then expands to parent sections for structural completeness
- Ideal for policy documents, regulations, and process descriptions

#### 3. `ROADMAP` → Seed & Expand

```
Query → Schema-aware expansion → Chunk search → LLM selects best seed section
      → Regex placeholder detection → Generate expansion queries → Retrieve additional sections
```

- **Seed**: LLM selects the most relevant semester/year section via structured reasoning
- **Expand**: Regex detects placeholders (e.g., "môn tự chọn ngành \*\*") and generates queries to resolve them
- **No LLM overhead** for expansion when no placeholders are found (early exit)

#### 4. `FACTUAL` → Chunk-Level Precision

```
Query → Chunk search (top-20) → Cohere rerank (top-5) → Return chunks directly
```

- Returns **chunk-level** results (not sections) for maximum precision
- Aggressive reranking to surface exact-match passages

#### 5. `COMPARE` → Split-Retrieve-Merge

```
Query → LLM extracts Entity₁ and Entity₂
      → Retrieve sections for Entity₁ (expand + rerank)
      → Retrieve sections for Entity₂ (expand + rerank)
      → Interleave merge → Deduplicate
```

- Ensures balanced coverage of both entities being compared
- Interleaved merging preserves ordering fairness

### Intent-Aware Prompt Generation

After retrieval, prompts are **tailored per intent** — each intent class receives a different system instruction, context formatting, and output structure to maximize answer quality.

---

## System Architecture


### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, TailwindCSS 4, Radix UI |
| **Backend** | Python 3.9+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| **Search** | Elasticsearch 8.15 — kNN (vector), BM25 (fulltext), RRF (hybrid) |
| **Database** | PostgreSQL 15 — authentication, chat history, document metadata |
| **Embeddings** | BGE-M3 via Ollama (1024-dim dense vectors) |
| **Generation** | Gemma 3:4B (Ollama) / GPT-4o-mini (OpenAI) |
| **Reranking** | Cohere `rerank-multilingual-v3.0` |
| **Infrastructure** | Docker Compose |

### Key Features

- 🔍 **Hybrid Search** — Vector (kNN), fulltext (BM25), and hybrid (RRF) search modes
- 🏫 **Major-Aware Filtering** — Filters retrieval by academic program via H1-level document metadata
- 💬 **Multi-Turn Chat** — Conversation history contextualization for follow-up queries
- 🔄 **Streaming Responses** — Server-Sent Events (SSE) for real-time answer generation
- 📚 **Document Management** — CRUD with DOCX/PDF parsing → Markdown → chunking → indexing
- 🔐 **Authentication** — Email OTP + Google OAuth with JWT tokens

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
curl -X POST http://localhost:8000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"directory": "data/raw"}'
```

API documentation: **http://localhost:8000/docs**

---

## Evaluation

To validate the effectiveness of IA-ARF, we compare it against two baseline pipelines using the same ground-truth test set (`tests/query.json`) spanning all five intent categories.

### Baselines

| Pipeline | Description |
|----------|-------------|
| **Naive** | Direct chunk retrieval → simple prompt → LLM. No expansion, no reranking. |
| **Standard (Chunk-Based Extent)** | Query expansion → chunk search → section expansion → Cohere reranking → LLM. |
| **IA-ARF (Proposed)** | Intent detection → adaptive strategy selection → intent-aware prompt → LLM. |

### Running Evaluations

```bash
cd backend

# Baseline: Naive Pipeline
python tests/run_naive_evaluation.py
python tests/run_naive_evaluation.py --factual --search-mode hybrid

# Baseline: Standard Pipeline (Chunk-Based Extent)
python tests/run_pipeline_evaluation.py
python tests/run_pipeline_evaluation.py --structure

# Proposed: IA-ARF Pipeline
python tests/run_ragas_evaluation.py
python tests/run_ragas_evaluation.py --overview --search-mode vector
```

All scripts support intent filters: `--overview`, `--structure`, `--roadmap`, `--factual`, `--compare`

### Output Format (RAGAS-Compatible)

Results are saved as JSON in `tests/output/`:

```json
{
  "question": "Ngành CNTT học những gì?",
  "answer": "...",
  "contexts": ["..."],
  "ground_truth": "...",
  "metadata": {
    "intent": "OVERVIEW",
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
│   │   ├── main.py                              # FastAPI entry point
│   │   ├── config.py                            # Pydantic Settings
│   │   ├── clients/                             # External service clients
│   │   │   ├── elasticsearch.py                 # ES (vector/fulltext/hybrid)
│   │   │   ├── ollama.py                        # Ollama (embedding + LLM)
│   │   │   ├── openai_client.py                 # OpenAI client
│   │   │   └── cohere_reranker.py               # Cohere reranker
│   │   ├── query/                               # ★ RAG Pipelines
│   │   │   ├── intent_based_rag_pipeline.py     # ★ IA-ARF orchestrator
│   │   │   ├── intent_based_retrieval_engine.py # ★ 5 retrieval strategies
│   │   │   ├── intent_based_prompt_engine.py    # ★ Intent-aware prompts
│   │   │   ├── naive_pipeline.py                # Baseline: Naive RAG
│   │   │   ├── pipeline.py                      # Baseline: Standard RAG
│   │   │   └── query_expander.py                # Query expansion utilities
│   │   ├── retrieval_engine/
│   │   │   ├── intent_detection.py              # ★ 5-class intent classifier
│   │   │   └── refine_query.py                  # Query normalization
│   │   ├── ingestion/                           # Document ingestion pipeline
│   │   ├── services/                            # Business logic layer
│   │   └── utils/
│   │       └── chunker.py                       # MarkdownStructureChunker
│   ├── tests/                                   # Evaluation & test suites
│   │   ├── query.json                           # Ground-truth test queries
│   │   ├── run_ragas_evaluation.py              # ★ IA-ARF evaluation
│   │   ├── run_naive_evaluation.py              # Naive baseline eval
│   │   └── run_pipeline_evaluation.py           # Standard baseline eval
│   ├── docker-compose.yml
│   └── requirements.txt
│
├── frontend/                                    # Next.js 15 web application
│   ├── app/                                     # App Router pages
│   │   ├── chat-stream/                         # Streaming chat interface
│   │   ├── document/                            # Document management
│   │   └── login/                               # Authentication
│   └── components/                              # React UI components
│
└── README.md
```

> ★ marks core IA-ARF components

---

## Citation

This work is published at the **26th IEEE International Conference on Advanced Learning Technologies (ICALT 2026)**, July 6–9, 2026, Vietnam.

If you use this system or the IA-ARF framework in your research, please cite:

```bibtex
@inproceedings{nguyen2026iaarf,
  title     = {IA-ARF: An Intent-Aware Adaptive Retrieval
               Framework for Academic Advising Systems},
  author    = {Nguyen, Thien and Tang, Han and Tran, Hung-Nghiep},
  booktitle = {Proceedings of the 26th IEEE International Conference
               on Advanced Learning Technologies (ICALT 2026)},
  year      = {2026},
  month     = {July},
  address   = {Vietnam},
  publisher = {IEEE Computer Society},
  institution = {University of Information Technology, VNU-HCM},
  note      = {Intent-driven RAG with five adaptive retrieval strategies
               for university advising}
}
```

---

## License

This project is licensed under the [CC BY-NC-SA 4.0 License](LICENSE).

## Acknowledgments

- **University of Information Technology (UIT), VNU-HCM** — Domain expertise, user evaluation
- **Ollama** — Local LLM deployment infrastructure
- **Elasticsearch** — Vector and hybrid retrieval engine
- **Cohere** — Multilingual reranking model

---

<p align="center">
  <strong>UNKN Lab - University of Information Technology - Vietnam National University, Ho Chi Minh City</strong><br/>
  Built with ❤️ for smarter academic advising
</p>
