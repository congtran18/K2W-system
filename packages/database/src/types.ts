// Database type definitions for K2W system
export interface Database {
  public: {
    Tables: {
      keywords: {
        Row: {
          id: string;
          keyword: string;
          search_volume: number;
          competition: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['keywords']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['keywords']['Insert']>;
      };
      content: {
        Row: {
          id: string;
          keyword_id: string;
          title: string;
          content: string;
          meta_description: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['content']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['content']['Insert']>;
      };
      websites: {
        Row: {
          id: string;
          domain: string;
          status: string;
          deployment_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['websites']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['websites']['Insert']>;
      };
    };
    Views: {};
    Functions: {
      execute_query: {
        Args: { query: string; params: unknown[] };
        Returns: Record<string, unknown>;
      };
    };
    Enums: {};
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];