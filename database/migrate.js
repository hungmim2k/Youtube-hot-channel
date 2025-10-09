// JavaScript version of the migration script
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local file
const envPath = resolve(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`Environment file not found: ${envPath}`);
  dotenv.config(); // Try to load from default .env file
}

// Get Supabase URL and service role key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Please define the NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Default admin user
const DEFAULT_ADMIN = {
  username: 'admin',
  password: '0968885430',
  role: 'admin',
  expiration: 'never',
  api_keys: [],
  created_at: new Date().toISOString()
};

// Table names
const TABLES = {
  USERS: 'users',
  KEYWORDS: 'keywords',
};

async function migrate() {
  try {
    console.log('Starting migration...');

    // Print SQL statements for creating tables
    console.log('To create the necessary tables, please run the following SQL in the Supabase dashboard SQL editor:');

    console.log(`
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  expiration TEXT NOT NULL,
  api_keys TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  username TEXT NOT NULL,
  ip TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keywords_username ON keywords(username);
CREATE INDEX IF NOT EXISTS idx_keywords_timestamp ON keywords(timestamp);
    `);

    console.log('After creating the tables, run the following SQL to create the admin user:');
    console.log(`
-- Create admin user
INSERT INTO users (id, username, password, role, expiration, api_keys, created_at)
VALUES (
  uuid_generate_v4(),
  'admin',
  '0968885430',
  'admin',
  'never',
  '{}',
  NOW()
)
ON CONFLICT (username) DO NOTHING;
    `);

    console.log('Please run these SQL statements in the Supabase dashboard SQL editor and then restart the application.');

    // Try to check if tables exist
    console.log('Attempting to check if tables exist...');
    try {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);

      if (usersError) {
        console.log('Users table does not exist or is not accessible.');
      } else {
        console.log('Users table exists and is accessible.');
      }
    } catch (error) {
      console.log('Error checking users table:', error.message);
    }

    try {
      const { data: keywordsData, error: keywordsError } = await supabaseAdmin
        .from('keywords')
        .select('count')
        .limit(1);

      if (keywordsError) {
        console.log('Keywords table does not exist or is not accessible.');
      } else {
        console.log('Keywords table exists and is accessible.');
      }
    } catch (error) {
      console.log('Error checking keywords table:', error.message);
    }

    // Try to initialize database (create admin user if it doesn't exist)
    console.log('Attempting to initialize database...');
    try {
      await initializeDatabase();
      console.log('Database initialization successful!');
    } catch (error) {
      console.log('Database initialization failed. This is expected if the tables do not exist yet.');
      console.log('Please run the SQL statements above in the Supabase dashboard SQL editor first.');
    }

    console.log('Migration script completed!');
  } catch (error) {
    console.error('Migration script failed:', error);
  }
}

// Initialize the database with the default admin user if it doesn't exist
async function initializeDatabase() {
  try {
    // Check if admin user exists
    const { data: adminExists, error: checkError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('username')
      .eq('username', DEFAULT_ADMIN.username)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for admin user:', checkError);
      throw checkError;
    }

    if (!adminExists) {
      // Create default admin user
      const { error: createError } = await supabaseAdmin
        .from(TABLES.USERS)
        .insert(DEFAULT_ADMIN);

      if (createError) {
        console.error('Error creating admin user:', createError);
        throw createError;
      }

      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the migration
migrate();
