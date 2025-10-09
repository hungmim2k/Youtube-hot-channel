import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Please define the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
}

// Create a Supabase client with the anon key (for client-side usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase admin client with the service role key (for admin operations)
// Note: This should only be used in secure contexts or server-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define database table names
export const TABLES = {
  USERS: 'users',
  KEYWORDS: 'keywords',
};

// Define database types
export type Role = 'admin' | 'user';
export type Expiration = 'never' | string;

export interface UserRecord {
  id?: string;
  username: string;
  password: string; // Note: In production, consider using Supabase Auth instead of storing passwords
  role: Role;
  expiration: Expiration;
  api_keys?: string[];
  created_at?: string;
}

export interface KeywordRecord {
  id?: string;
  keyword: string;
  username: string;
  ip: string;
  timestamp?: string;
}