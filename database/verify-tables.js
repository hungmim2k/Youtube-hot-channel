// Script to verify that the necessary tables exist in Supabase
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

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please define the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Table names
const TABLES = {
  USERS: 'users',
  KEYWORDS: 'keywords',
};

async function verifyTables() {
  console.log('Verifying Supabase tables...');
  
  // Check users table
  try {
    console.log(`Checking ${TABLES.USERS} table...`);
    const { data: usersData, error: usersError } = await supabase
      .from(TABLES.USERS)
      .select('count')
      .limit(1);
      
    if (usersError) {
      console.error(`Error: ${TABLES.USERS} table does not exist or is not accessible.`);
      console.error(usersError);
      return false;
    } else {
      console.log(`✅ ${TABLES.USERS} table exists and is accessible.`);
    }
  } catch (error) {
    console.error(`Error checking ${TABLES.USERS} table:`, error.message);
    return false;
  }
  
  // Check keywords table
  try {
    console.log(`Checking ${TABLES.KEYWORDS} table...`);
    const { data: keywordsData, error: keywordsError } = await supabase
      .from(TABLES.KEYWORDS)
      .select('count')
      .limit(1);
      
    if (keywordsError) {
      console.error(`Error: ${TABLES.KEYWORDS} table does not exist or is not accessible.`);
      console.error(keywordsError);
      return false;
    } else {
      console.log(`✅ ${TABLES.KEYWORDS} table exists and is accessible.`);
    }
  } catch (error) {
    console.error(`Error checking ${TABLES.KEYWORDS} table:`, error.message);
    return false;
  }
  
  // Check admin user
  try {
    console.log('Checking admin user...');
    const { data: adminData, error: adminError } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('username', 'admin')
      .single();
      
    if (adminError) {
      console.error('Error: Admin user does not exist or could not be retrieved.');
      console.error(adminError);
      return false;
    } else {
      console.log('✅ Admin user exists:');
      console.log(`   Username: ${adminData.username}`);
      console.log(`   Role: ${adminData.role}`);
      console.log(`   Created at: ${new Date(adminData.created_at).toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error checking admin user:', error.message);
    return false;
  }
  
  console.log('\n✅ All tables and the admin user have been verified successfully!');
  return true;
}

// Run the verification
verifyTables().then(success => {
  if (!success) {
    console.log('\n❌ Verification failed. Please follow the instructions in SUPABASE_INSTRUCTIONS.md to set up the tables.');
    process.exit(1);
  }
});