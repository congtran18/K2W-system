export * from './schemas';
export * from './client';
export * from './k2w-schemas';
export * from './k2w-service';

// Re-export specific constants to avoid conflicts
export { 
  TABLE_NAMES,
  KEYWORD_STATUS, 
  CONTENT_STATUS,
  JOB_STATUS,
  JOB_TYPES,
  SEARCH_INTENT,
  CONTENT_TYPE,
  PUBLISH_STATUS
} from './k2w-schemas';

// Define custom Database type for our K2W application
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          project_ids: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: string;
          project_ids?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          project_ids?: string[];
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description?: string;
          domain: string;
          language: string;
          region: string;
          owner_id: string;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          domain: string;
          language: string;
          region: string;
          owner_id: string;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          domain?: string;
          language?: string;
          region?: string;
          settings?: any;
          updated_at?: string;
        };
      };
      keywords: {
        Row: {
          id: string;
          keyword: string;
          region: string;
          language: string;
          project_id: string;
          cluster_id?: string;
          search_intent?: string;
          volume?: number;
          difficulty?: number;
          cpc?: number;
          competition?: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          keyword: string;
          region: string;
          language: string;
          project_id: string;
          cluster_id?: string;
          search_intent?: string;
          volume?: number;
          difficulty?: number;
          cpc?: number;
          competition?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          keyword?: string;
          region?: string;
          language?: string;
          cluster_id?: string;
          search_intent?: string;
          volume?: number;
          difficulty?: number;
          cpc?: number;
          competition?: string;
          status?: string;
          updated_at?: string;
        };
      };
      clusters: {
        Row: {
          id: string;
          name: string;
          topic: string;
          project_id: string;
          language: string;
          region: string;
          keyword_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          topic: string;
          project_id: string;
          language: string;
          region: string;
          keyword_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          topic?: string;
          keyword_count?: number;
          updated_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          title: string;
          body: string;
          meta_title?: string;
          meta_description?: string;
          keyword_id: string;
          cluster_id: string;
          project_id: string;
          content_type: string;
          language: string;
          status: string;
          url?: string;
          published_at?: string;
          seo_score?: number;
          readability_score?: number;
          word_count?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          meta_title?: string;
          meta_description?: string;
          keyword_id: string;
          cluster_id: string;
          project_id: string;
          content_type: string;
          language: string;
          status?: string;
          url?: string;
          published_at?: string;
          seo_score?: number;
          readability_score?: number;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          body?: string;
          meta_title?: string;
          meta_description?: string;
          status?: string;
          url?: string;
          published_at?: string;
          seo_score?: number;
          readability_score?: number;
          word_count?: number;
          updated_at?: string;
        };
      };
      media_storage: {
        Row: {
          id: string;
          content_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          alt_text?: string;
          caption?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          alt_text?: string;
          caption?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          alt_text?: string;
          caption?: string;
        };
      };
      analytics_data: {
        Row: {
          id: string;
          content_id: string;
          url: string;
          impressions: number;
          clicks: number;
          ctr: number;
          position: number;
          bounce_rate?: number;
          session_duration?: number;
          conversions?: number;
          collected_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          url: string;
          impressions: number;
          clicks: number;
          ctr: number;
          position: number;
          bounce_rate?: number;
          session_duration?: number;
          conversions?: number;
          collected_at?: string;
        };
        Update: {
          impressions?: number;
          clicks?: number;
          ctr?: number;
          position?: number;
          bounce_rate?: number;
          session_duration?: number;
          conversions?: number;
        };
      };
    };
  };
}