// Test script to verify database connection
import { connectToDatabase, disconnectFromDatabase } from './connection';
import { initializeDatabase, getAllUsers } from './services/userService';
import { getAllKeywords } from './services/keywordService';

async function testConnection() {
  try {
    console.log('Testing database connection...');

    // Connect to database
    await connectToDatabase();
    console.log('Successfully connected to MongoDB');

    // Initialize database (creates admin user if it doesn't exist)
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Test user service
    const users = await getAllUsers();
    console.log(`Retrieved ${users.length} users from database`);

    // Test keyword service
    const keywords = await getAllKeywords();
    console.log(`Retrieved ${keywords.length} keywords from database`);

    // Disconnect from database
    await disconnectFromDatabase();
    console.log('Successfully disconnected from MongoDB');

    console.log('All database tests passed!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

// Run the test
testConnection();
