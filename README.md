# 🚀 K2W (Keyword-to-Website) System
### Enterprise AI-Driven SEO Content Orchestration & Multi-Site Publishing Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-red?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-crimson?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)

An advanced, enterprise-grade monorepo platform that automates the entire SEO lifecycle: from keyword research and semantic clustering to AI content generation, multi-model fallback image pipeline execution, editorial review workspace, automated cost/budget optimization, A/B testing, and one-click multi-platform publishing.

---

## 🎯 Product Purpose & Core Use Cases

The **K2W (Keyword-to-Website) System** is built specifically to automate organic traffic scaling for **Marketing Departments, SEO Agencies, and Digital Content Teams**. It eliminates the manual bottlenecks of research, drafting, image curation, translation, and CMS uploads, allowing marketing operations to scale efficiently.

### Primary Use Case: Scaling SEO for Marketing Teams
In modern marketing, creating search-optimized landing pages and blog posts is a slow, expensive process involving SEO analysts, copywriters, designers, translators, and web developers. 
**K2W compresses this entire workflow into minutes:**
1. **Targeted Campaigns**: Marketers input target search keywords (e.g., "modular home designs", "office container rental").
2. **AI Semantic Analysis & Writing**: The platform runs keyword checks (search volume, difficulty, search intent) and automatically writes high-quality, structured articles optimized for SEO (target keyword density, heading hierarchies, FAQ schemas, and meta descriptions).
3. **Automatic Content Translation**: Drafts generated in local languages (such as Vietnamese) can be automatically translated into professional English using Gemini AI with a single click—preserving all HTML markup and attributes.
4. **Automated Rich Media**: The pipeline generates matching high-fidelity featured images using a reliable, multi-model fallback chain (FLUX.1 → SDXL → Pollinations) and stores them on a CDN.
5. **Human-in-the-Loop Review**: Content editors inspect, live-edit, or translate drafts inside a sandboxed multi-device preview page.
6. **Instant Publishing**: Approved content is pushed instantly to WordPress, Ghost, or Static site architectures (like Webflow or GitHub Pages) via automated REST APIs.

---

## 🗺️ System Workflow Architecture

This system leverages a distributed micro-service workflow implemented inside a clean Turborepo monorepo structure. It handles heavy prompt generation, queueing, asset CDN uploads, caching, and multi-site deployments seamlessly.

```mermaid
graph TD
    User["User / Editor"] -->|1. Submit Keywords| FE["Next.js Frontend"]
    FE -->|2. POST Request| API["Express.js API Gateway"]
    
    subgraph "Hugging Face Spaces (Docker)"
        API -->|3. Cache Check| Redis[("Redis / Upstash Cache")]
        API -->|4. Push Job| Queue["BullMQ Queue"]
        Queue -->|5. Poll Job| Worker["Background Worker"]
        
        Worker -->|6. SEO Prompt| AI_Text{"AI Text Orchestrator"}
        AI_Text -->|Primary| Gemini["Google Gemini 3.5 Flash"]
        AI_Text -->|Fallback| OpenAI["OpenAI GPT-4o-mini"]
        
        Worker -->|7. Image Prompt| AI_Img{"AI Image Orchestrator"}
        AI_Img -->|HF Token| Flux["Hugging Face FLUX.1"]
        AI_Img -->|API Key| SDXL["Stability AI XL"]
        AI_Img -->|No Key| Pollinations["Pollinations AI"]
        
        AI_Img -->|8. Upload Blobs| Supabase_Storage[("Supabase Storage CDN")]
    end
    
    Gemini -->|9a. Save Content| DB[("Supabase PostgreSQL Database")]
    OpenAI -->|9b. Save Content| DB
    Supabase_Storage -->|9c. Save CDN URLs| DB
    
    FE -->|10. Review and Edit| Editor["Live Preview and Direct Editor"]
    Editor -->|11. Approve and Publish| Publisher["Multi-Site Publisher"]
    
    Publisher -->|WordPress API| WP["WordPress Site"]
    Publisher -->|Ghost API| Ghost["Ghost Blog"]
    Publisher -->|Git Push| Static["GitHub Pages / Webflow"]
    
    subgraph "Advanced Features"
        API -->|12. Monitor Stats| Analytics["Advanced Analytics Dashboard"]
        API -->|13. Budget Tracking| Cost["Cost Optimization Engine"]
        API -->|14. Variant Split| AB["A/B Testing Framework"]
    end
```

---

## ✨ Key Platform Features

### 1. Automated AI Content Orchestration Engine
* **Multi-LLM Hybrid Routing**: Utilizes Google's high-speed `gemini-3.5-flash` model for high-throughput, cost-effective content generation, with automatic failover to OpenAI's `gpt-4o-mini` if limits are exceeded.
* **SEO Structuring**: Dynamically configures heading hierarchy (H1, H2, H3), semantic keyword inclusion, automatic metadata fields, search intent targets, and FAQ blocks schema.
* **Inline Internal Linking**: Automatically maps keywords to existing campaign URLs, strengthening the internal linking structure.

### 2. Multi-Model Image Fallback & CDN Storage Pipeline
* **Robust Fail-safe Pipeline**: To ensure images are generated under all circumstances, the system utilizes a cascading fallback chain:
  1. **Hugging Face FLUX.1-schnell** (Free, state-of-the-art detail)
  2. **Stability AI SDXL** (Professional graphics style)
  3. **Pollinations AI** (Keyless fallback model)
* **Supabase storage integration**: Images are processed from base64/binary payloads and uploaded directly to Supabase storage buckets, saving network bandwidth and producing fast public CDN URLs.
* **DoH (DNS-over-HTTPS) Lookup Resolver**: Custom HTTPS agent implementing Google & Cloudflare DoH lookup overrides to bypass strict name-resolution blocks in Hugging Face sandboxed Space environments.

### 3. Interactive Review Workspace & English Translation
* **Live Sandboxed Preview**: View exact draft layouts across Simulated Desktop and Mobile viewport frames.
* **WYSIWYG Inline Code Editor**: Directly edit title, meta description, and HTML body with instant live iframe feedback.
* **One-Click Gemini Translation**: Features a professional Gemini AI translator that converts Vietnamese drafts into high-converting English copy while strictly keeping all original HTML tags, inline styles, CSS classes, and image links unchanged.

### 4. Enterprise Cost Optimization & Budgeting
* **Prompt Compressor**: Sophisticated token-pruning algorithm that reduces prompt sizes by 20% to 80% while retaining structural output instructions, minimizing LLM billings.
* **Real-time Spending Tracker**: Monitors running expenditures per provider (Gemini, OpenAI, Hugging Face, Stability AI), alerts at configurable limits (75%, 90%, 95%), and suspends queue generation upon breach of daily or monthly budgets.

### 5. Advanced Multi-Site Analytics & A/B Testing
* **Real-time Performance Metrics**: Monitors page speed metrics (LCP, INP) and Core Web Vitals to suggest image size and scripts improvements.
* **A/B Split Testing**: Setup variations of title and CTA configurations, automatically routing site traffic and showing statistical significance graphs (conversion rate, bounce rates).
* **Multi-Domain Overview**: Adaptive dark-mode UI displaying active domains, live sites, and development status.

---

## 🏗️ Project Structure

The project is structured as a Turborepo monorepo to isolate dependencies and facilitate package-sharing:

```
K2W-system/                         ← Turborepo monorepo
├── apps/
│   ├── api/                        ← Express.js REST API (deployed on HF Spaces via Docker)
│   └── web/                        ← Next.js 14 frontend (deployed on Vercel)
├── packages/
│   ├── ai/                         ← AI LLM and Image API orchestration layer
│   ├── database/                   ← Shared Supabase client initialization, migrations, schemas
│   ├── ui/                         ← Premium glassmorphic reusable components (shadcn/ui-based)
│   └── utils/                      ← Shared helper functions (dates, formats, logging)
├── Dockerfile                      ← Multi-stage Docker build config for Express backend
├── turbo.json                      ← Pipeline execution configuration
└── pnpm-workspace.yaml             ← Workspace mapping
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|-------|------------------|
| **Backend Framework** | Node.js 18, Express.js, TypeScript |
| **Frontend Framework**| Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Cache & Queues** | Redis (Upstash), BullMQ |
| **AI Text Orchestration**| Google Gemini API (`gemini-3.5-flash`), OpenAI API (`gpt-4o-mini`) |
| **AI Image Generation**| HF FLUX.1 → Stability AI SDXL → Pollinations AI |
| **Hosting & Container**| Docker (Multi-stage), Hugging Face Spaces (API), Vercel (Web) |
| **Package Pipeline** | pnpm workspaces + Turborepo |

---

## 📡 API Endpoints

### Keywords & Campaigns
* `POST` `/api/k2w/keywords/submit` - Submit target keyword for processing.
* `GET` `/api/k2w/keywords/history` - Fetch user keyword campaigns history.
* `GET` `/api/k2w/keywords/:keyword_id/status` - Poll processing status from queue.
* `POST` `/api/k2w/keywords/import` - Bulk import keyword lists (CSV/JSON).

### Content & Translation
* `POST` `/api/k2w/content/generate` - Trigger AI copy and matching featured images.
* `GET` `/api/k2w/content/:content_id` - Fetch fully rendered article details.
* `PUT` `/api/k2w/content/:content_id/body` - Update modified title and body HTML.
* `POST` `/api/k2w/content/:content_id/translate-en` - Translate draft (title, meta description, HTML body) to English using Gemini AI.
* `POST` `/api/k2w/content/:content_id/approve` - Approve draft and stage for publishing.
* `POST` `/api/k2w/content/:content_id/reject` - Reject draft and log review feedback.

### Advanced Cost & System Performance
* `GET` `/api/optimize/health` - Check cache hit rates, memory status, response speeds.
* `GET` `/api/optimize/insights` - Read system-generated performance recommendations.
* `GET` `/api/optimize/cache/stats` - Fetch Redis caching statistics.
* `POST` `/api/cost-optimization/optimize-prompt` - Optimize LLM prompt token sizes.
* `GET` `/api/cost-optimization/recommendations` - Fetch budget optimization recommendations.

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18+
* pnpm 8+
* Supabase Account & Project
* Google Gemini API Key

### 2. Installation & Workspace Setup
```bash
# Clone the repository
git clone https://github.com/congtran18/K2W-system.git
cd K2W-system

# Install workspace dependencies
pnpm install
```

### 3. Environment Configurations
Configure variables inside `apps/api/.env` (using `apps/api/.env.example` template):
```env
PORT=7860
NODE_ENV=development

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Text Generation
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Image Generation
HUGGINGFACE_TOKEN=your_hf_inference_token
STABILITY_API_KEY=your_stability_key

# Caching Layer (Upstash/Redis)
REDIS_URL=redis://default:token@your-redis-instance.upstash.io:6379
```

### 4. Running Locally
Run both apps concurrently:
```bash
pnpm dev
```
* **Backend API Gateway**: `http://localhost:7860`
* **Next.js Web Application**: `http://localhost:3000`

---

## 🚢 Production Deployment

### Dockerizing Backend (Hugging Face Spaces)
The backend compiles automatically inside a lean multi-stage Docker build:
```bash
# Build Docker image
docker build -t k2w-backend .

# Run Docker container locally
docker run -p 7860:7860 --env-file apps/api/.env k2w-backend
```
To deploy on Hugging Face Spaces:
```bash
git push hf main
```

### Frontend Deployment (Vercel)
Point your Vercel instance to `apps/web` and set `NEXT_PUBLIC_API_URL` to your API gateway address.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for advanced SEO expansion initiatives.