# K2W API Server

Express.js API server cho hệ thống K2W, tập trung xử lý tất cả logic API thay vì phân tán trong Next.js routes.

## 🏗️ Architecture

API server này thay thế các Next.js API routes với:

- **Express.js**: RESTful API server
- **TypeScript**: Type safety và developer experience
- **Authentication**: JWT-based auth middleware
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Centralized error management
- **Validation**: Request/response validation với Zod

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env với real credentials
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   pnpm start
   ```

## 📡 API Endpoints

### Content Management
- `POST /api/content/generate` - Generate content from keywords
- `POST /api/content/optimize` - Optimize content for SEO
- `POST /api/content/batch-process` - Batch processing
- `GET /api/content/:id` - Get content by ID
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `GET /api/content` - List content with filters

### Keyword Management
- `POST /api/keywords/submit` - Submit keywords for processing
- `GET /api/keywords/:id` - Get keyword by ID
- `GET /api/keywords` - List keywords

### Analytics
- `GET /api/analytics` - Get analytics overview
- `POST /api/analytics/optimize` - Optimize analytics

### Health Check
- `GET /health` - Server health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `WEB_APP_URL` | Frontend URL for CORS | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `REDIS_URL` | Redis connection URL | No |

## 🔐 Authentication

API sử dụng JWT tokens từ Supabase:

```bash
# Request header
Authorization: Bearer <jwt_token>
```

## 📊 Migration from Next.js API Routes

Để migrate từ Next.js API routes sang Express server:

1. **Update frontend API calls** từ `/api/*` thành `http://localhost:3001/api/*`
2. **Move logic** từ Next.js route handlers sang Express controllers
3. **Update authentication** để sử dụng JWT middleware thay vì Next.js auth

### Before (Next.js):
```typescript
// apps/web/src/app/api/content/route.ts
export async function POST(request: Request) {
  // API logic here
}
```

### After (Express):
```typescript
// apps/api/src/controllers/contentController.ts
public generateContent = async (req: Request, res: Response) => {
  // API logic here
}
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/health

# Test content generation (với auth token)
curl -X POST http://localhost:3001/api/content/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"keywordIds": ["keyword1"], "template": "article"}'
```

## 📈 Benefits of Consolidation

1. **Single Responsibility**: API server chỉ focus vào API logic
2. **Better Performance**: Express.js tối ưu hơn cho API endpoints
3. **Easier Testing**: Isolated API logic dễ test hơn
4. **Scalability**: Có thể scale API server độc lập
5. **Cleaner Architecture**: Tách biệt frontend và backend concerns