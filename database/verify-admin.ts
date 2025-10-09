import { supabase, TABLES } from './supabase';
import { DEFAULT_ADMIN } from './services/userServiceSupabase';

async function verifyAdmin() {
  try {
    console.log('Verifying admin account...');

    // Check if admin user exists
    const { data: adminUser, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('username', DEFAULT_ADMIN.username)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking for admin user:', error);
      
      if (error.code === 'PGRST116') {
        console.log('Admin user does not exist.');
        return false;
      }
      
      throw error;
    }
    
    if (adminUser) {
      console.log('Admin user exists:', adminUser);
      return true;
    } else {
      console.log('Admin user does not exist.');
      return false;
    }
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

// Run the verification
verifyAdmin().then(exists => {
  if (exists) {
    console.log('Admin account verification successful!');
  } else {
    console.log('Admin account verification failed. Please run the migration script to create the admin account.');
  }
});