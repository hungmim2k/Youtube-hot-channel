import { authenticateUser } from './services/userServiceSupabase';
import { DEFAULT_ADMIN } from './services/userServiceSupabase';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Attempt to authenticate with admin credentials
    const result = await authenticateUser(DEFAULT_ADMIN.username, DEFAULT_ADMIN.password);
    
    if (result) {
      console.log('Admin login successful!');
      console.log('Admin user details:', result);
      return true;
    } else {
      console.log('Admin login failed. Please check that the admin account exists and the credentials are correct.');
      return false;
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
    return false;
  }
}

// Run the test
testAdminLogin().then(success => {
  if (success) {
    console.log('Admin login test passed!');
  } else {
    console.log('Admin login test failed. Please run the migration script to create the admin account.');
  }
});