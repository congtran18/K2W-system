import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Only validate in runtime, not build time
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuild && isProduction && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  console.warn('Warning: Missing Supabase environment variables in production');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database utilities
export class DatabaseService {
  constructor(private client = supabase) {}

  // Generic CRUD operations
  async findById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as T;
  }

  async findMany<T>(
    table: string, 
    filters?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    }
  ): Promise<T[]> {
    let query = this.client.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as T[];
  }

  async create<T>(table: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .insert({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .update({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const db = new DatabaseService();

// Re-export createClient from supabase for compatibility
export { createClient } from '@supabase/supabase-js';