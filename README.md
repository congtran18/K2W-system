---
title: K2w Backend
emoji: 🚀
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
---

# K2W System - Keyword to Website Platform


An AI-driven platform that transforms keywords into complete, SEO-optimized websites with automated content generation, image creation, and publishing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/congtran18/K2W-system.git
cd K2W-system
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual API keys and configuration
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## 🏗️ Project Structure

```
K2W-system/
├── apps/
│   └── web/                    # Next.js frontend application
├── packages/                   # Shared packages
│   ├── ui/                     # UI components (shadcn/ui)
│   ├── database/               # Database schemas and types
│   ├── ai/                     # AI service integrations
│   └── utils/                  # Shared utilities
├── .env.example                # Environment variables template
├── package.json                # Root package.json with workspace config
└── turbo.json                  # Turborepo configuration
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Google Cloud Functions
- **Database**: Supabase (PostgreSQL)
- **Automation**: GCP Pub/Sub
- **AI Services**: OpenAI, SurferSEO, Grammarly, Copyscape
- **Performance**: Google PageSpeed Insights, AlsoAsked
- **CI/CD**: GitHub Actions
- **Package Manager**: pnpm with Turborepo

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint across all packages
- `pnpm test` - Run tests
- `pnpm type-check` - Run TypeScript type checking
- `pnpm web:dev` - Start only the web application

## 🌟 Features

- **Automated Content Generation**: AI-powered article creation
- **SEO Optimization**: Built-in SEO validation and enhancement
- **Multi-language Support**: Localized content generation
- **Image Generation**: AI-generated visuals for content
- **Analytics Integration**: Performance tracking and insights
- **Scalable Architecture**: Microservices-ready design

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

- **Supabase**: Database and authentication
- **OpenAI**: Content and image generation
- **Google Cloud**: Infrastructure and APIs
- **Third-party APIs**: SEO tools and services

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project credentials to `.env.local`:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
3. Run database migrations:
   ```bash
   cd packages/database
   pnpm migrate
   ```

Detailed setup guide: [`packages/database/README.md`](packages/database/README.md)

## 🚢 Deployment

### Development
```bash
pnpm dev
```

### Production
```bash
pnpm build
pnpm start
```

### Docker (Optional)
```bash
docker build -t k2w-system .
docker run -p 3000:3000 k2w-system
```

## 📊 Monitoring

The system includes comprehensive monitoring for:
- AI request costs and performance
- Content generation metrics
- SEO optimization results
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation wiki

---

Built with ❤️ for OSG Global's digital expansion initiative.