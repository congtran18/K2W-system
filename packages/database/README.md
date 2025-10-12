# Database Schema Setup Guide

This guide will help you set up the K2W System database schema on Supabase.

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Environment Variables**: Set up your environment variables
3. **pnpm**: Ensure pnpm is installed

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following:
   - Project URL
   - `anon` public key
   - `service_role` secret key (⚠️ Keep this secret!)

## Step 2: Set Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Update the Supabase variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Run Database Migration

From the root directory:

```bash
# Install dependencies
pnpm install

# Run the database migration
cd packages/database
pnpm migrate
```

Or from the root:

```bash
pnpm --filter @k2w/database migrate
```

## Step 4: Verify Schema

After migration, verify the schema in your Supabase dashboard:

1. Go to Database > Tables
2. Check that these tables exist:
   - `keywords`
   - `content` 
   - `analytics`
   - `jobs`
   - `user_profiles`
   - `languages`

## Step 5: Enable Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable email authentication
3. Set up your site URL: `http://localhost:3000` (for development)

## Schema Overview

### Core Tables

#### `keywords`
- Stores user keywords with processing status
- Links to `auth.users` via `user_id`
- Tracks processing pipeline status

#### `content`
- Generated content for each keyword
- SEO metadata and quality scores
- Publishing status and URLs

#### `analytics`
- Performance metrics for published content
- Daily aggregated data
- SEO performance tracking

#### `jobs`
- Background task tracking
- Processing pipeline management
- Error handling and progress tracking

### Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **User isolation** - users can only access their own data  
✅ **Service role** access for system operations
✅ **Automatic timestamps** with triggers
✅ **Data validation** with CHECK constraints

### Included Features

- **Multi-language support** via `languages` table
- **User profiles** with usage limits
- **Real-time notifications** via PostgreSQL triggers
- **Performance indexes** for fast queries
- **Migration history** tracking
- **Business logic functions** for common operations

## Troubleshooting

### Migration Fails

1. Check your `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Ensure you have the service role key, not the anon key
3. Verify network connectivity to Supabase

### RLS Errors

If you get permission errors:
1. Check that RLS policies are correctly applied
2. Verify user authentication in your app
3. Use service role key for admin operations

### Performance Issues

1. Check that indexes are created correctly
2. Monitor query performance in Supabase dashboard
3. Consider query optimization for large datasets

## Next Steps

After setting up the database:

1. ✅ Set up authentication in your Next.js app
2. ✅ Create API routes for CRUD operations
3. ✅ Set up real-time subscriptions
4. ✅ Implement the content generation pipeline

## Development Commands

```bash
# Run migration
pnpm migrate

# Reset database (⚠️ Destructive!)
pnpm reset

# Check migration status
pnpm migrate:status

# Create new migration
pnpm migrate:create new_migration_name
```

## Production Deployment

For production:

1. Use a separate Supabase project
2. Set production environment variables
3. Run migrations with `NODE_ENV=production`
4. Monitor performance and costs
5. Set up automated backups

---

📝 **Note**: Keep your service role key secure and never commit it to version control!