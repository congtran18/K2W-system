# Workspace Configuration

This file contains package manager and workspace settings:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Package Dependencies

### Apps
- **web**: Next.js frontend application
  - Uses: @k2w/ui, @k2w/database, @k2w/ai, @k2w/utils
- **api**: Express.js backend application  
  - Uses: @k2w/database, @k2w/ai, @k2w/utils

### Packages
- **@k2w/ui**: Shared UI components (React, TailwindCSS, shadcn/ui)
- **@k2w/database**: Database schemas and types (Supabase, Zod)
- **@k2w/ai**: AI service integrations (OpenAI, etc.)
- **@k2w/utils**: Shared utilities and helpers

## Development Commands

```bash
# Install all dependencies
pnpm install

# Run all in development mode
pnpm dev

# Build all packages
pnpm build

# Run specific app
pnpm web:dev
pnpm api:dev

# Build specific packages
pnpm packages:build
```