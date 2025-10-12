# CI/CD Setup Guide

This guide explains how to set up continuous integration and deployment for the K2W System using GitHub Actions.

## 🔧 Required Secrets

Add these secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

### Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Supabase
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Google Cloud Platform
```
GCP_PROJECT_ID=your_gcp_project_id
GCP_SERVICE_ACCOUNT_KEY=your_service_account_json_key
```

### Application
```
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
OPENAI_API_KEY=your_openai_api_key
```

### Notifications (Optional)
```
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

## 🚀 Deployment Flow

### On Push to Main Branch:

1. **Lint & Test** 
   - Code quality checks
   - TypeScript validation
   - Unit tests

2. **Build & Deploy Frontend**
   - Build Next.js application
   - Deploy to Vercel

3. **Deploy Backend**
   - Build Express API
   - Deploy to Google Cloud Functions

4. **Database Migrations**
   - Run Supabase migrations
   - Update schema if needed

5. **Notifications**
   - Slack notification on success/failure

## 📋 Setup Steps

### 1. Vercel Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
cd apps/web
vercel login
vercel link

# Get project details
vercel project ls
```

### 2. Google Cloud Setup

```bash
# Create service account
gcloud iam service-accounts create k2w-github-actions

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:k2w-github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.admin"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=k2w-github-actions@PROJECT_ID.iam.gserviceaccount.com
```

### 3. GitHub Secrets Setup

```bash
# Add secrets via GitHub CLI
gh secret set VERCEL_TOKEN --body "your_token"
gh secret set SUPABASE_URL --body "your_url"
# ... etc
```

## 🛠 Workflow Features

### Caching
- **pnpm cache** for faster installs
- **Node modules** cached between runs

### Parallel Jobs
- Frontend and backend deploy in parallel
- Database migrations run independently
- Faster overall deployment time

### Error Handling
- Jobs fail fast on errors
- Detailed error reporting
- Slack notifications for failures

### Security
- Secrets properly managed
- No sensitive data in logs
- Service account with minimal permissions

## 🔍 Monitoring

Monitor deployments via:

1. **GitHub Actions tab** - Build logs and status
2. **Vercel dashboard** - Frontend deployment status  
3. **Google Cloud Console** - API deployment logs
4. **Supabase dashboard** - Database migration status
5. **Slack notifications** - Real-time alerts

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check logs in GitHub Actions
# Verify all secrets are set correctly
# Test build locally first
```

#### Vercel Deployment Issues
```bash
# Verify Vercel token has correct permissions
# Check project is linked correctly
# Ensure build output directory is correct
```

#### GCP Deployment Issues
```bash
# Verify service account permissions
# Check Cloud Functions are enabled
# Ensure correct project ID
```

#### Database Migration Issues
```bash
# Verify Supabase service role key
# Check migration SQL syntax
# Test migration locally first
```

## ⚡ Performance Optimizations

- **Incremental builds** where possible
- **Conditional deployments** (only on main branch)
- **Parallel job execution**
- **Smart caching strategies**

## 🔄 Manual Deployment

If needed, deploy manually:

```bash
# Frontend
cd apps/web
vercel --prod

# Backend  
cd apps/api
gcloud functions deploy k2w-api --runtime nodejs18

# Database
cd packages/database  
pnpm migrate:prod
```

---

💡 **Tip**: Always test changes in a feature branch before merging to main!