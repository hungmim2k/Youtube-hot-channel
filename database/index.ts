// Export Supabase client and types
export * from './supabase';

// Export services
export * from './services/userServiceSupabase';
export * from './services/keywordServiceSupabase';

// Initialize database
import { initializeDatabase } from './services/userServiceSupabase';

// Initialize database when this module is imported
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});
