---
title: K2w Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# 🚀 K2W System — Enterprise AI-Driven Content & Multi-Site Publisher Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4-blue?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-red?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-crimson?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Container-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Spaces-yellow?style=for-the-badge)](https://huggingface.co/)

An advanced, enterprise-grade monorepo platform that automates the entire SEO lifecycle: from keyword research and semantic clustering to AI content generation, multi-model fallback image pipeline execution, editorial review workspace, automated cost/budget optimization, A/B testing, and one-click multi-platform publishing.

---

## 🎯 Product Purpose & Core Use Cases

**K2W (Keyword-to-Website) System** is designed specifically to automate organic traffic scaling for **Marketing Departments, SEO Agencies, and Content Teams**. It eliminates the manual bottlenecks of research, drafting, image generation, and publishing.

*   **For Marketing Teams (Scalable SEO Campaigns):** Marketers paste target search keywords, and the system automatically analyzes search metrics and generates **high-quality, SEO-optimized articles** with target keyword density, proper heading structures, metadata, and custom matching featured images.
*   **For Content Editors (Editorial Workflow Gate):** Features an interactive **Approval Dashboard** where editors inspect, edit, and approve/reject drafts with structured logs before publication.
*   **For Multi-Site Networks (Instant Publishing Hub):** Direct integrations with **WordPress, Ghost, and Static Sites** allow one-click mass deployment, removing manual copy-paste overhead entirely.

---

## 🗺️ System Workflow Architecture

This system leverages a distributed micro-service workflow implemented inside a clean Turborepo monorepo structure. It handles heavy prompt generation, queueing, asset CDN uploads, caching, and multi-site deployments seamlessly.

```mermaid
graph TD
    User([User / Editor]) -->|1. Submit Keywords| FE[Next.js Frontend]
    FE -->|2. POST Request| API[Express.js API Gateway]
    
    subgraph Backend Services [Hugging Face Spaces - Docker]
        API -->|3. Cache Check| Redis[(Redis / Upstash Cache)]
        API -->|4. Push Job| Queue[BullMQ Queue]
        Queue -->|5. Poll Job| Worker[Background Worker]
        
        Worker -->|6. SEO Prompt| AI_Text{AI Text Orchestrator}
        AI_Text -->|Primary| Gemini[Google Gemini 3.5 Flash]
        AI_Text -->|Fallback| OpenAI[OpenAI GPT-4o-mini]
        
        Worker -->|7. Image Prompt| AI_Img{AI Image Orchestrator}
        AI_Img -->|HF Token| Flux[Hugging Face FLUX.1]
        AI_Img -->|API Key| SDXL[Stability AI SDXL]
        AI_Img -->|No Key| Pollinations[Pollinations AI]
        
        AI_Img -->|8. Upload Blobs| Supabase_Storage[(Supabase Storage CDN)]
    end
    
    Gemini & OpenAI & Supabase_Storage -->|9. Save Content & CDN URLs| DB[(Supabase PostgreSQL Database)]
    
    FE -->|10. Review & Edit| Editor[Live Preview & Direct Editor]
    Editor -->|11. Approve & Publish| Publisher[Multi-Site Publisher]
    
    Publisher -->|WordPress API| WP[WordPress Site]
    Publisher -->|Ghost API| Ghost[Ghost Blog]
    Publisher -->|Git Push| Static[GitHub Pages / Webflow]
    
    subgraph Advanced Features
        API -->|12. Monitor Stats| Analytics[Advanced Analytics Dashboard]
        API -->|13. Budget Tracking| Cost[Cost Optimization Engine]
        API -->|14. Variant Split| AB[A/B Testing Framework]
    end
```

---

## ✨ Key Platform Features

### 1. Automated AI Content Orchestration Engine
- **Multi-LLM Strategy**: Uses Google's `gemini-3.5-flash` for high-throughput, cost-effective generations with automatic fallback to OpenAI's `gpt-4o-mini`.
- **SEO Optimization**: Integrates semantic keywords, search intent mapping (informational, transactional, navigational, commercial), headings structure optimization, and automated FAQ generation.

### 2. Multi-Model Image Fallback & CDN Storage Pipeline
- **Fail-safe Image Generation**: Implements a robust fallback chain starting from **Hugging Face FLUX.1-schnell** (free, high-throughput) to **Stability AI SDXL**, and falling back to keyless **Pollinations AI** to ensure images generate under all circumstances.
- **Supabase Storage Uploads**: Automatically converts base64/binary image responses and uploads them to Supabase Storage buckets, saving bandwidth and serving lightweight public URL links.
- **DNS-over-HTTPS (DoH) Resolver**: Custom HTTPS agent implementing Google & Cloudflare DoH lookup overrides to bypass strict network name-resolution blocks inside Hugging Face Spaces.

### 3. System Health & Performance Optimization
- **Intelligent Caching**: Redis (Upstash) key-value caching layer yielding up to **90% faster API response times** for static analytics dashboards and data sources.
- **Multi-tier Rate Limiting**: Protection presets for authentication routes, AI endpoints, and standard API routes (utilizing `rate-limiter-flexible`).

### 4. Enterprise Cost Optimization & Budgeting
- **Prompt Optimizer**: Reduces token footprint by 20% to 80% while preserving output quality, keeping LLM usage highly efficient.
- **Real-time Spending Tracker**: Tracks cost per provider, alerts on budget thresholds (e.g., 75%, 90%, 95%), and automatically terminates processing when daily or monthly budget limits are breached.

### 5. Editorial Approval Workspace & Live Preview
- **WYSIWYG Inline Editor**: Direct raw HTML code editor with word counter, layout parameters editing, and auto-saving drafts.
- **Iframe Sandboxed Live Preview**: Allows previewing exact layout renderings inside simulated device contexts.
- **Vietnamese to English Translation**: Universal translation hooks and clean localization wrappers.

### 6. A/B Testing Framework
- Automates content variations testing (Title, Meta description, CTA elements) with statistical significance tracking and automated layout routing.

### 7. Multi-Site Publisher Hub
- Instantly publishes approved contents to WordPress, Ghost, and Static Pages (Webflow / GitHub Pages) via REST APIs and Webhook callbacks.

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

### Keywords
- `POST` `/api/k2w/keywords/submit` - Submit keyword for processing
- `GET` `/api/k2w/keywords/history` - Get user keyword research history
- `GET` `/api/k2w/keywords/:keyword_id/status` - Check polling status of queue
- `POST` `/api/k2w/keywords/import` - Bulk CSV/JSON import keyword lists

### Content Generation & Editing
- `POST` `/api/k2w/content/generate` - Trigger AI text and image generation
- `GET` `/api/k2w/content/:content_id` - Fetch fully rendered article details
- `PUT` `/api/k2w/content/:content_id/optimize` - Trigger AI-driven re-optimization
- `POST` `/api/k2w/content/:content_id/approve` - Approve draft for publishing
- `POST` `/api/k2w/content/:content_id/reject` - Reject draft and log review feedback

### System & Performance (Optimize)
- `GET` `/api/optimize/health` - Check cache hit rates, memory deltas, response speed
- `GET` `/api/optimize/insights` - View system recommendations & next steps
- `GET` `/api/optimize/cache/stats` - Read Redis statistics (hit rate, miss rate)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase Account & Project
- Google Gemini API Key

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
- **Backend API Gateway**: `http://localhost:7860`
- **Next.js Web Application**: `http://localhost:3000`

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
Point your Vercel instance to `apps/web` and set:
`NEXT_PUBLIC_API_URL` -> Your Hugging Face Spaces API address.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for advanced SEO expansion initiatives.