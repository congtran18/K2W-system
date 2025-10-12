-- =============================================
-- K2W System Database Schema
-- Supabase PostgreSQL Schema with RLS
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Keywords Table
-- =============================================
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    keyword_text TEXT NOT NULL,
    status TEXT DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ANALYZING_SEO', 'GENERATING_TEXT', 'CHECKING_GRAMMAR', 'CHECKING_PLAGIARISM', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    
    -- Additional metadata fields
    region TEXT DEFAULT 'US',
    language TEXT DEFAULT 'en',
    search_volume INTEGER,
    difficulty INTEGER CHECK (difficulty >= 0 AND difficulty <= 100),
    cluster_id UUID,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Content Table  
-- =============================================
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE NOT NULL,
    
    -- SEO Content Fields
    title TEXT NOT NULL,
    body_html TEXT NOT NULL,
    meta_description TEXT,
    meta_title TEXT,
    
    -- Structured Data
    faqs JSONB DEFAULT '[]'::jsonb,
    headings JSONB DEFAULT '[]'::jsonb,
    
    -- Quality Metrics
    plagiarism_report_url TEXT,
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    readability_score INTEGER CHECK (readability_score >= 0 AND performance_score <= 100),
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    
    -- Publishing Info
    preview_url TEXT,
    published_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'published', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ
);

-- =============================================
-- Analytics Table (for tracking performance)
-- =============================================
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE NOT NULL,
    
    -- Performance Metrics
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0 CHECK (ctr >= 0 AND ctr <= 1),
    average_position DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,4) CHECK (bounce_rate >= 0 AND bounce_rate <= 1),
    time_on_page INTEGER, -- in seconds
    conversions INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure one record per content per date
    UNIQUE(content_id, date)
);

-- =============================================
-- Jobs Table (for background task tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    
    -- Job Details
    type TEXT NOT NULL CHECK (type IN ('content_generation', 'image_generation', 'seo_optimization', 'translation', 'plagiarism_check', 'grammar_check')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Job Data
    payload JSONB DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_time INTEGER, -- in seconds
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- =============================================
-- Languages Table (for multi-language support)
-- =============================================
CREATE TABLE IF NOT EXISTS languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g., 'en', 'vi', 'ja'
    name TEXT NOT NULL, -- e.g., 'English', 'Vietnamese', 'Japanese'
    region TEXT NOT NULL, -- e.g., 'US', 'VN', 'JP'
    locale TEXT UNIQUE NOT NULL, -- e.g., 'en-US', 'vi-VN', 'ja-JP'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- User Profiles Table (extended user info)
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Profile Info
    full_name TEXT,
    company TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    
    -- Preferences
    default_language TEXT DEFAULT 'en-US',
    default_region TEXT DEFAULT 'US',
    timezone TEXT DEFAULT 'UTC',
    
    -- Usage Limits
    monthly_keyword_limit INTEGER DEFAULT 100,
    keywords_used_this_month INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Keywords table indexes
CREATE INDEX IF NOT EXISTS idx_keywords_user_id ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_status ON keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_created_at ON keywords(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_user_status ON keywords(user_id, status);

-- Content table indexes  
CREATE INDEX IF NOT EXISTS idx_content_keyword_id ON content(keyword_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at DESC);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_content_id ON analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_content_date ON analytics(content_id, date);

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_keyword_id ON jobs(keyword_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- User profiles index
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- =============================================
-- Functions for automatic timestamp updates
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_keywords_updated_at 
    BEFORE UPDATE ON keywords 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Keywords RLS Policies
CREATE POLICY "Users can view their own keywords" ON keywords
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own keywords" ON keywords
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own keywords" ON keywords
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own keywords" ON keywords
    FOR DELETE USING (auth.uid() = user_id);

-- Content RLS Policies (through keyword relationship)
CREATE POLICY "Users can view content for their keywords" ON content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM keywords k 
            WHERE k.id = content.keyword_id 
            AND k.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert content for their keywords" ON content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM keywords k 
            WHERE k.id = content.keyword_id 
            AND k.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update content for their keywords" ON content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM keywords k 
            WHERE k.id = content.keyword_id 
            AND k.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete content for their keywords" ON content
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM keywords k 
            WHERE k.id = content.keyword_id 
            AND k.user_id = auth.uid()
        )
    );

-- Analytics RLS Policies (through content->keyword relationship)
CREATE POLICY "Users can view analytics for their content" ON analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content c
            JOIN keywords k ON k.id = c.keyword_id
            WHERE c.id = analytics.content_id 
            AND k.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics" ON analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON analytics
    FOR UPDATE USING (true);

-- Jobs RLS Policies (through keyword relationship)
CREATE POLICY "Users can view jobs for their keywords" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM keywords k 
            WHERE k.id = jobs.keyword_id 
            AND k.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage all jobs" ON jobs
    FOR ALL USING (true);

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Languages table is public (read-only for users)
ALTER TABLE languages DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Insert Default Data
-- =============================================

-- Insert sample languages data
INSERT INTO languages (code, name, region, locale) VALUES
    ('en', 'English', 'US', 'en-US'),
    ('es', 'Spanish', 'ES', 'es-ES'),
    ('fr', 'French', 'FR', 'fr-FR'),
    ('de', 'German', 'DE', 'de-DE'),
    ('it', 'Italian', 'IT', 'it-IT'),
    ('pt', 'Portuguese', 'BR', 'pt-BR'),
    ('zh', 'Chinese', 'CN', 'zh-CN'),
    ('ja', 'Japanese', 'JP', 'ja-JP'),
    ('ko', 'Korean', 'KR', 'ko-KR'),
    ('vi', 'Vietnamese', 'VN', 'vi-VN'),
    ('th', 'Thai', 'TH', 'th-TH')
ON CONFLICT (code, region) DO NOTHING;

-- =============================================
-- Advanced Features: AI Feedback Loop & Admin Panel
-- =============================================

-- Create content_optimizations table for AI feedback loop
CREATE TABLE content_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
  key_issues JSONB DEFAULT '[]'::jsonb,
  optimization_priorities JSONB DEFAULT '[]'::jsonb,
  content_updates JSONB DEFAULT '{}'::jsonb,
  seo_improvements JSONB DEFAULT '{}'::jsonb,
  ux_improvements JSONB DEFAULT '[]'::jsonb,
  conversion_optimizations JSONB DEFAULT '[]'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  analytics_data JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  implemented_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for content_optimizations
CREATE INDEX idx_content_optimizations_content_id ON content_optimizations(content_id);
CREATE INDEX idx_content_optimizations_analysis_date ON content_optimizations(analysis_date);
CREATE INDEX idx_content_optimizations_status ON content_optimizations(status);
CREATE INDEX idx_content_optimizations_performance_rating ON content_optimizations(performance_rating);

-- Create admin_users table for advanced admin panel
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create system_config table for API keys and settings management
CREATE TABLE system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cost_tracking table
CREATE TABLE cost_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  service_provider VARCHAR(100) NOT NULL, -- 'openai', 'deepl', 'grammarly', etc.
  service_type VARCHAR(100) NOT NULL, -- 'content_generation', 'translation', 'grammar_check', etc.
  usage_count INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  project_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, service_provider, service_type, user_id)
);

-- Create indexes for cost_tracking
CREATE INDEX idx_cost_tracking_date ON cost_tracking(date);
CREATE INDEX idx_cost_tracking_service ON cost_tracking(service_provider, service_type);
CREATE INDEX idx_cost_tracking_user ON cost_tracking(user_id);

-- Create domains table for multi-site management
CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  region VARCHAR(10) NOT NULL,
  language VARCHAR(10) NOT NULL,
  brand_settings JSONB DEFAULT '{}'::jsonb,
  seo_settings JSONB DEFAULT '{}'::jsonb,
  publishing_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  ssl_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_deployments table
CREATE TABLE content_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  deployed_url VARCHAR(500),
  deployment_status VARCHAR(50) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'unpublished')),
  deployment_platform VARCHAR(100) NOT NULL, -- 'wordpress', 'firebase', 'vercel', etc.
  deployment_config JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(content_id, domain_id)
);

-- Create indexes for domains and deployments
CREATE INDEX idx_domains_region_language ON domains(region, language);
CREATE INDEX idx_content_deployments_content_id ON content_deployments(content_id);
CREATE INDEX idx_content_deployments_domain_id ON content_deployments(domain_id);
CREATE INDEX idx_content_deployments_status ON content_deployments(deployment_status);

-- Create system_monitoring table
CREATE TABLE system_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'counter', 'gauge', 'histogram'
  labels JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for monitoring
CREATE INDEX idx_system_monitoring_timestamp ON system_monitoring(timestamp);
CREATE INDEX idx_system_monitoring_metric ON system_monitoring(metric_name, metric_type);

-- Create notification_settings table
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL, -- 'email', 'telegram', 'slack', 'webhook'
  endpoint VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, notification_type, channel)
);

-- Update existing tables to support new features
ALTER TABLE content ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id);
ALTER TABLE content ADD COLUMN IF NOT EXISTS optimization_score INTEGER DEFAULT 0;
ALTER TABLE content ADD COLUMN IF NOT EXISTS last_optimization_date TIMESTAMP WITH TIME ZONE;

-- Add performance tracking columns to analytics
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS sessions INTEGER DEFAULT 0;
ALTER TABLE analytics ADD COLUMN IF NOT EXISTS pageviews INTEGER DEFAULT 0;

-- Insert default system configurations
INSERT INTO system_config (key, value, category, description, is_sensitive) VALUES
  ('openai_api_key', '{"encrypted": true, "value": ""}', 'ai_services', 'OpenAI API key for content generation', true),
  ('deepl_api_key', '{"encrypted": true, "value": ""}', 'ai_services', 'DeepL API key for translations', true),
  ('grammarly_api_key', '{"encrypted": true, "value": ""}', 'quality_services', 'Grammarly API key for grammar checking', true),
  ('copyscape_api_key', '{"encrypted": true, "value": ""}', 'quality_services', 'Copyscape API key for plagiarism checking', true),
  ('google_analytics_api_key', '{"encrypted": true, "value": ""}', 'analytics', 'Google Analytics API key', true),
  ('google_search_console_api_key', '{"encrypted": true, "value": ""}', 'analytics', 'Google Search Console API key', true),
  ('max_monthly_keywords_per_user', '100', 'quotas', 'Maximum keywords per user per month', false),
  ('max_concurrent_jobs', '10', 'system', 'Maximum concurrent processing jobs', false),
  ('optimization_check_interval_days', '7', 'optimization', 'How often to check content performance', false),
  ('auto_optimization_threshold', '5', 'optimization', 'Performance rating threshold for auto-optimization', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default domain for localhost development
INSERT INTO domains (domain_name, display_name, region, language, brand_settings) VALUES
  ('localhost:3000', 'Local Development', 'US', 'en', '{"theme": "default", "logo": "", "colors": {"primary": "#2563eb", "secondary": "#64748b"}}')
ON CONFLICT (domain_name) DO NOTHING;

-- =============================================
-- Views for Convenient Data Access
-- =============================================

-- View for keywords with content status
CREATE OR REPLACE VIEW keywords_with_content AS
SELECT 
    k.*,
    c.id as content_id,
    c.title as content_title,
    c.status as content_status,
    c.performance_score,
    c.published_url,
    c.published_at
FROM keywords k
LEFT JOIN content c ON k.id = c.keyword_id;

-- View for content with analytics
CREATE OR REPLACE VIEW content_with_analytics AS
SELECT 
    c.*,
    k.keyword_text,
    k.user_id,
    COALESCE(SUM(a.impressions), 0) as total_impressions,
    COALESCE(SUM(a.clicks), 0) as total_clicks,
    COALESCE(AVG(a.ctr), 0) as avg_ctr,
    COALESCE(AVG(a.average_position), 0) as avg_position
FROM content c
JOIN keywords k ON k.id = c.keyword_id
LEFT JOIN analytics a ON a.content_id = c.id
GROUP BY c.id, k.keyword_text, k.user_id;

-- =============================================
-- Functions for Business Logic
-- =============================================

-- Function to get user's keyword usage this month
CREATE OR REPLACE FUNCTION get_user_monthly_usage(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM keywords 
        WHERE user_id = user_uuid 
        AND created_at >= DATE_TRUNC('month', NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more keywords
CREATE OR REPLACE FUNCTION can_user_create_keyword(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    usage_count INTEGER;
    user_limit INTEGER;
BEGIN
    -- Get current usage
    SELECT get_user_monthly_usage(user_uuid) INTO usage_count;
    
    -- Get user limit
    SELECT monthly_keyword_limit INTO user_limit
    FROM user_profiles 
    WHERE user_id = user_uuid;
    
    -- Default limit if no profile exists
    IF user_limit IS NULL THEN
        user_limit := 100;
    END IF;
    
    RETURN usage_count < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Notification Functions (for real-time updates)
-- =============================================

-- Function to notify on keyword status change
CREATE OR REPLACE FUNCTION notify_keyword_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM pg_notify(
            'keyword_status_change', 
            json_build_object(
                'keyword_id', NEW.id,
                'user_id', NEW.user_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'updated_at', NEW.updated_at
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for keyword status notifications
CREATE TRIGGER trigger_keyword_status_change
    AFTER UPDATE ON keywords
    FOR EACH ROW
    EXECUTE FUNCTION notify_keyword_status_change();

-- =============================================
-- Grant Permissions
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON keywords TO authenticated;
GRANT ALL ON content TO authenticated;
GRANT ALL ON analytics TO authenticated;
GRANT ALL ON jobs TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON languages TO anon, authenticated;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_monthly_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_create_keyword(UUID) TO authenticated;