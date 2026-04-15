---
title: K2w Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# K2W System — Keyword to Website Platform

An AI-driven monorepo platform that transforms keywords into complete, SEO-optimized content with automated AI generation, image creation, and multi-platform publishing.

> **Backend API** is deployed on [Hugging Face Spaces](https://huggingface.co/spaces) via Docker at port `7860`.  
> **Frontend** is a Next.js app deployed separately (e.g., Vercel).

---

## 🏗️ Architecture Overview

```
K2W-system/                         ← Turborepo monorepo
├── apps/
│   ├── api/                        ← Express.js REST API (deployed on HF Spaces)
│   └── web/                        ← Next.js 14 frontend (deployed on Vercel)
├── packages/
│   ├── ai/                         ← AI service integrations (Gemini, HuggingFace, etc.)
│   ├── database/                   ← Supabase client, schema types, migrations
│   ├── ui/                         ← Shared UI components (shadcn/ui)
│   └── utils/                      ← Shared utility functions
├── Dockerfile                      ← Multi-stage Docker build (backend only)
├── turbo.json                      ← Turborepo pipeline config
└── pnpm-workspace.yaml             ← pnpm workspace config
```

---

## 🤖 AI Provider Stack

### Text Generation
| Priority | Provider | Model | Notes |
|----------|----------|-------|-------|
| 1 | **Gemini** (Google) | `gemini-3.5-flash` | Primary — ~99% cheaper than OpenAI |
| 2 | **OpenAI** | `gpt-4o-mini` | Fallback only |

### Image Generation
| Priority | Provider | Model | Notes |
|----------|----------|-------|-------|
| 1 | **Hugging Face** | FLUX.1-schnell | 100% free, 1000 req/hr, requires `HUGGINGFACE_TOKEN` |
| 2 | **Stability AI** | SDXL | 25 free images/day, requires `STABILITY_API_KEY` |
| 3 | **Pollinations** | — | No key needed, used as last fallback |
| 4 | **Google Imagen** | — | Requires Google Cloud setup |

> **DNS-over-HTTPS fix**: The HuggingFace service uses a custom HTTPS Agent with DoH lookup override (Google & Cloudflare) to reliably resolve `api-inference.huggingface.co` inside HF Spaces network restrictions.

### Image Storage
Generated images (base64 from HuggingFace / Stability AI) are automatically uploaded to **Supabase Storage** (`k2w-images` bucket) and served as public URLs — keeping API responses lightweight.

---

## 🛠️ Technology Stack

| Layer | Tech |
|-------|------|
| **Backend API** | Node.js 18, Express.js, TypeScript |
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Caching** | Redis (Upstash) |
| **Job Queue** | BullMQ |
| **AI Text** | Google Gemini → OpenAI (fallback) |
| **AI Images** | HuggingFace FLUX.1 → Stability AI → Pollinations |
| **Image Storage** | Supabase Storage |
| **Deployment** | Docker → Hugging Face Spaces (API), Vercel (Web) |
| **Package Manager** | pnpm 8 + Turborepo |

---

## 📡 API Endpoints

Base URL: `http://localhost:7860` (local) / HF Spaces URL (production)

### Keywords
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/k2w/keywords/submit` | Submit keyword for processing |
| `GET` | `/api/k2w/keywords/history` | Get keyword history |
| `GET` | `/api/k2w/keywords/:keyword_id/status` | Get keyword status |
| `POST` | `/api/k2w/keywords/import` | Bulk import keywords |
| `POST` | `/api/k2w/keywords/cluster` | Trigger keyword clustering |
| `PUT` | `/api/k2w/keywords/:keyword_id/status` | Update keyword status |
| `DELETE` | `/api/k2w/keywords/:keyword_id` | Delete keyword |

### Content Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/k2w/content/generate` | Generate AI content for a keyword |
| `POST` | `/api/k2w/content/batch-generate` | Batch generate for multiple keywords |
| `GET` | `/api/k2w/content/:content_id` | Get content by ID |
| `PUT` | `/api/k2w/content/:content_id/optimize` | Re-optimize content with AI |
| `PUT` | `/api/k2w/content/:content_id/body` | Update content body directly |
| `POST` | `/api/k2w/content/:content_id/approve` | Approve content for publishing |
| `POST` | `/api/k2w/content/:content_id/reject` | Reject and request edits |
| `GET` | `/api/k2w/content/:content_id/download` | Download content as HTML |
| `DELETE` | `/api/k2w/content/:content_id` | Delete content |

### Publishing
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/k2w/publish/content` | Publish content (WordPress, Ghost, Static/GitHub Pages) |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/k2w/analytics/:project_id/dashboard` | Project dashboard metrics |
| `GET` | `/api/k2w/analytics/detailed` | Detailed analytics |
| `GET` | `/api/k2w/analytics/system/overview` | System-wide analytics |

### Advanced Features
| Route Prefix | Description |
|--------------|-------------|
| `/api/k2w/seo-external` | External SEO API integrations |
| `/api/k2w/analytics-advanced` | Advanced analytics & reporting |
| `/api/k2w/ab-testing` | A/B testing management |
| `/api/k2w/cost-optimization` | AI cost optimization tools |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Global API health check (DB ping) |
| `GET` | `/api/k2w/health` | K2W workflow health check |
| `GET` | `/api/k2w/status` | System status with metrics |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Installation

```bash
git clone https://github.com/congtran18/K2W-system.git
cd K2W-system
pnpm install
```

### Environment Setup

```bash
# Copy the template and fill in your values
cp apps/api/.env.example apps/api/.env
```

**Required environment variables** (in `apps/api/.env`):

```env
# Text generation (required — choose at least one)
GEMINI_API_KEY=your_gemini_api_key       # Recommended (free 15 req/min)
OPENAI_API_KEY=your_openai_api_key       # Fallback

# Image generation (optional — at least one recommended)
HUGGINGFACE_TOKEN=hf_your_token          # Priority 1: 100% free, unlimited
STABILITY_API_KEY=sk-your_key            # Priority 2: 25 free/day

# Database (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Caching (optional)
REDIS_URL=redis://localhost:6379

# App config
PORT=7860
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Run Development Servers

```bash
# Start both API and Web simultaneously
pnpm dev

# Or start individually
pnpm api:dev      # API on http://localhost:7860
pnpm web:dev      # Web on http://localhost:3000
```

### Build for Production

```bash
# Build all packages + apps
pnpm build

# Or build API only
pnpm api:build
```

---

## 🚢 Deployment

### Docker (API backend → Hugging Face Spaces)

The Docker build is a **multi-stage build** that:
1. Installs all dependencies and compiles TypeScript
2. Copies only `dist/` artifacts into a lean runtime image
3. Starts the Express API on port `7860`

```bash
# Local Docker build & run
docker build -t k2w-api .
docker run -p 7860:7860 --env-file apps/api/.env k2w-api
```

Push to Hugging Face Spaces:
```bash
git push hf main
```

### Frontend (Next.js → Vercel)
Deploy `apps/web` to Vercel and set `NEXT_PUBLIC_API_URL` to point to the HF Spaces URL.

---

## 📦 Workspace Scripts

```bash
pnpm dev              # Start all apps in dev mode (Turborepo)
pnpm build            # Build all packages and apps
pnpm lint             # Run ESLint across all packages
pnpm type-check       # TypeScript type checking
pnpm test             # Run test suites
pnpm api:dev          # Start API only
pnpm api:build        # Build API only
pnpm web:dev          # Start Web only
pnpm web:build        # Build Web only
pnpm packages:build   # Build all shared packages
```

---

## 📊 Monitoring

- **Health check**: `GET /health` — DB connectivity, uptime, memory
- **K2W status**: `GET /api/k2w/status` — Feature flags, architecture info
- **Cost tracking**: AI request costs tracked per provider via the cost-optimization service
- **Analytics**: Content performance, keyword rankings, and SEO metrics in the analytics dashboard

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for OSG Global's digital expansion initiative.