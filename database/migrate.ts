import { supabaseAdmin } from './supabase';

async function migrate() {
  try {
    console.log('Starting migration...');

    // Create users table
    console.log('Creating users table...');
    const { error: usersError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
          expiration TEXT NOT NULL,
          api_keys TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
      throw usersError;
    }

    // Create keywords table
    console.log('Creating keywords table...');
    const { error: keywordsError } = await supabaseAdmin.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS keywords (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          keyword TEXT NOT NULL,
          username TEXT NOT NULL,
          ip TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_keywords_username ON keywords(username);
        CREATE INDEX IF NOT EXISTS idx_keywords_timestamp ON keywords(timestamp);
      `
    });

    if (keywordsError) {
      console.error('Error creating keywords table:', keywordsError);
      throw keywordsError;
    }

    // Initialize database (create admin user if it doesn't exist)
    console.log('Initializing database...');
    const { initializeDatabase } = await import('./services/userServiceSupabase');
    await initializeDatabase();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrate();