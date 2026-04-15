-- =============================================
-- K2W System Database Schema
-- Supabase PostgreSQL Schema with RLS disabled for Local Guest Dev
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and views if they exist to avoid conflict and start clean
DROP VIEW IF EXISTS keywords_with_content CASCADE;
DROP VIEW IF EXISTS content_with_analytics CASCADE;
DROP TABLE IF EXISTS system_log CASCADE;
DROP TABLE IF EXISTS feedback_db CASCADE;
DROP TABLE IF EXISTS publish_log CASCADE;
DROP TABLE IF EXISTS seo_audit_log CASCADE;
DROP TABLE IF EXISTS analytics_data CASCADE;
DROP TABLE IF EXISTS media_storage CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS clusters CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop legacy tables from previous versions if they exist
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS content_optimizations CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS cost_tracking CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS content_deployments CASCADE;
DROP TABLE IF EXISTS system_monitoring CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;

-- 1. Create Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    project_ids TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{"language": "en", "timezone": "UTC", "notifications": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create Projects Table
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    region TEXT DEFAULT 'US',
    owner_id TEXT,
    settings JSONB DEFAULT '{"auto_publish": false, "seo_threshold": 80, "image_generation": false, "content_approval_required": true, "target_audience": "", "brand_tone": "", "internal_links": [], "cta_template": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Default Project (crucial to prevent FK errors when query default project)
INSERT INTO projects (id, name, domain, language, region)
VALUES ('default', 'Default Project', 'localhost:3000', 'vi', 'VN')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Clusters Table
CREATE TABLE clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'en',
    region TEXT DEFAULT 'US',
    keyword_count INTEGER DEFAULT 0,
    primary_keyword TEXT,
    related_keywords TEXT[] DEFAULT '{}',
    content_structure JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create Keywords Table
CREATE TABLE keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT NOT NULL,
    region TEXT DEFAULT 'US',
    language TEXT DEFAULT 'en',
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL,
    search_intent TEXT CHECK (search_intent IN ('informational', 'transactional', 'navigational', 'commercial')),
    volume INTEGER DEFAULT 0,
    difficulty INTEGER DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 100),
    cpc DECIMAL(10,2) DEFAULT 0.0,
    competition TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'clustering', 'clustered', 'queued', 'generating_text', 'generating_images', 'seo_review', 'ready_to_publish', 'published', 'failed', 'archived')),
    metadata JSONB DEFAULT '{"source": "manual"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Create Content Table
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    body_html TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    cluster_id UUID REFERENCES clusters(id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    content_type TEXT CHECK (content_type IN ('article', 'blog', 'product_page', 'landing_page', 'faq', 'guide')),
    language TEXT DEFAULT 'en',
    region TEXT DEFAULT 'US',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'optimizing', 'ready_to_publish', 'published', 'updating', 'archived')),
    url TEXT,
    published_at TIMESTAMPTZ,
    seo_score INTEGER DEFAULT 0,
    readability_score INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    headings JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    internal_links TEXT[] DEFAULT '{}',
    external_links TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    schema_markup TEXT,
    ai_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Create Media Storage Table
CREATE TABLE media_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    alt_text TEXT,
    caption TEXT,
    prompt_used TEXT,
    ai_generated BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Create Analytics Data Table
CREATE TABLE analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(10,4) DEFAULT 0.0,
    position DECIMAL(5,2) DEFAULT 0.0,
    bounce_rate DECIMAL(5,4) DEFAULT 0.0,
    session_duration INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0.0,
    source TEXT CHECK (source IN ('gsc', 'ga4', 'ahrefs')),
    collected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(content_id, date, source)
);

-- 8. Create SEO Audit Log Table
CREATE TABLE seo_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    audit_type TEXT CHECK (audit_type IN ('automated', 'manual')),
    results JSONB DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT true,
    audited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Create Publish Log Table
CREATE TABLE publish_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    target_url TEXT,
    platform TEXT CHECK (platform IN ('wordpress', 'firebase', 'replit', 'static', 'webflow')),
    status TEXT CHECK (status IN ('queued', 'publishing', 'published', 'failed', 'updated')),
    response_data JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    published_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 10. Create Feedback Table
CREATE TABLE feedback_db (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    feedback_type TEXT CHECK (feedback_type IN ('performance', 'quality', 'user')),
    metrics JSONB DEFAULT '{}'::jsonb,
    suggestions TEXT[] DEFAULT '{}',
    auto_generated BOOLEAN DEFAULT false,
    applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Create System Log Table
CREATE TABLE system_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Disable Row Level Security (RLS) on all tables for local dev ease
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE clusters DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_storage DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE seo_audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE publish_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_db DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_log DISABLE ROW LEVEL SECURITY;

-- 12. Create Convenience Views
CREATE OR REPLACE VIEW keywords_with_content AS
SELECT 
    k.*,
    c.id as content_id,
    c.title as content_title,
    c.status as content_status,
    c.seo_score,
    c.url as published_url,
    c.published_at
FROM keywords k
LEFT JOIN content c ON k.id = c.keyword_id;

CREATE OR REPLACE VIEW content_with_analytics AS
SELECT 
    c.*,
    k.keyword,
    k.project_id as keyword_project_id,
    COALESCE(SUM(a.impressions), 0) as total_impressions,
    COALESCE(SUM(a.clicks), 0) as total_clicks,
    COALESCE(AVG(a.ctr), 0.0) as avg_ctr,
    COALESCE(AVG(a.position), 0.0) as avg_position
FROM content c
JOIN keywords k ON k.id = c.keyword_id
LEFT JOIN analytics_data a ON a.content_id = c.id
GROUP BY c.id, k.keyword, k.project_id;

-- Grant permissions for authenticated and anonymous access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;