import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

interface MigrationResult {
  success: boolean;
  migration: string;
  error?: string;
}

export class MigrationRunner {
  private client;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

    // Only validate in runtime, not build time
    const isProduction = process.env.NODE_ENV === 'production';
    const isBuild = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build';

    if (!isBuild && isProduction && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      console.warn('Warning: Missing Supabase environment variables for migration in production');
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async runMigration(migrationFile: string): Promise<MigrationResult> {
    try {
      console.log(`Running migration: ${migrationFile}`);
      
      // Read the SQL file
      const migrationPath = join(__dirname, '..', 'migrations', migrationFile);
      const sql = readFileSync(migrationPath, 'utf8');
      
      // Execute the migration
      const { error } = await this.client.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Migration ${migrationFile} failed:`, error);
        return {
          success: false,
          migration: migrationFile,
          error: error.message
        };
      }
      
      console.log(`Migration ${migrationFile} completed successfully`);
      return {
        success: true,
        migration: migrationFile
      };
      
    } catch (error) {
      console.error(`Migration ${migrationFile} failed:`, error);
      return {
        success: false,
        migration: migrationFile,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runAllMigrations(): Promise<MigrationResult[]> {
    const migrations = [
      '001_initial_schema.sql'
    ];

    const results: MigrationResult[] = [];
    
    for (const migration of migrations) {
      const result = await this.runMigration(migration);
      results.push(result);
      
      // Stop on first failure
      if (!result.success) {
        console.error('Migration failed, stopping execution');
        break;
      }
    }
    
    return results;
  }

  async createMigrationHistoryTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        success BOOLEAN DEFAULT true,
        error_message TEXT
      );
    `;
    
    const { error } = await this.client.rpc('exec_sql', { sql });
    if (error) {
      throw new Error(`Failed to create migration history table: ${error.message}`);
    }
  }

  async recordMigration(filename: string, success: boolean, error?: string): Promise<void> {
    const { error: insertError } = await this.client
      .from('_migrations')
      .insert({
        filename,
        success,
        error_message: error
      });
      
    if (insertError) {
      console.error('Failed to record migration:', insertError);
    }
  }
}

// CLI runner
if (require.main === module) {
  async function main() {
    try {
      const runner = new MigrationRunner();
      
      // Ensure migration history table exists
      await runner.createMigrationHistoryTable();
      
      // Run all migrations
      const results = await runner.runAllMigrations();
      
      // Record results
      for (const result of results) {
        await runner.recordMigration(
          result.migration, 
          result.success, 
          result.error
        );
      }
      
      // Print summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log('\n=== Migration Summary ===');
      console.log(`✅ Successful: ${successful}`);
      console.log(`❌ Failed: ${failed}`);
      
      if (failed > 0) {
        console.log('\nFailed migrations:');
        results
          .filter(r => !r.success)
          .forEach(r => console.log(`- ${r.migration}: ${r.error}`));
        process.exit(1);
      }
      
      console.log('\n🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('Migration runner failed:', error);
      process.exit(1);
    }
  }

  main();
}