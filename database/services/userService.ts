import { connectToDatabase } from '../connection';
import { User, IUser, DEFAULT_ADMIN, Role, Expiration } from '../models/User';

/**
 * Initialize the database with the default admin user if it doesn't exist
 */
export async function initializeDatabase() {
  try {
    await connectToDatabase();
    
    // Check if admin user exists
    const adminExists = await User.findOne({ username: DEFAULT_ADMIN.username });
    
    if (!adminExists) {
      // Create default admin user
      await User.create(DEFAULT_ADMIN);
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getAllUsers() {
  try {
    await connectToDatabase();
    return await User.find().select('-__v').lean();
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  try {
    await connectToDatabase();
    return await User.findOne({ username }).select('-__v').lean();
  } catch (error) {
    console.error(`Error getting user ${username}:`, error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  username: string;
  password: string;
  role?: Role;
  expiration?: Expiration;
  apiKeys?: string[];
}) {
  try {
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: userData.username });
    if (existingUser) {
      throw new Error(`User ${userData.username} already exists`);
    }
    
    // Create new user
    const newUser = await User.create({
      ...userData,
      role: userData.role || 'user',
      expiration: userData.expiration || 'never',
      apiKeys: userData.apiKeys || [],
      createdAt: new Date(),
    });
    
    return newUser.toObject();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  username: string,
  updates: Partial<Omit<IUser, 'username' | '_id'>>
) {
  try {
    await connectToDatabase();
    
    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true }
    ).select('-__v').lean();
    
    if (!updatedUser) {
      throw new Error(`User ${username} not found`);
    }
    
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user ${username}:`, error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(username: string) {
  try {
    await connectToDatabase();
    
    // Don't allow deleting the default admin
    if (username === DEFAULT_ADMIN.username) {
      throw new Error('Cannot delete default admin user');
    }
    
    // Delete user
    const result = await User.deleteOne({ username });
    
    if (result.deletedCount === 0) {
      throw new Error(`User ${username} not found`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user ${username}:`, error);
    throw error;
  }
}

/**
 * Authenticate a user
 */
export async function authenticateUser(username: string, password: string) {
  try {
    await connectToDatabase();
    
    // Find user
    const user = await User.findOne({ username }).lean();
    
    if (!user) {
      return null;
    }
    
    // Check password
    if (user.password !== password) {
      return null;
    }
    
    // Check if account has expired
    if (user.expiration !== 'never') {
      const expirationDate = new Date(user.expiration);
      if (expirationDate < new Date()) {
        return { ...user, expired: true };
      }
    }
    
    return user;
  } catch (error) {
    console.error(`Error authenticating user ${username}:`, error);
    throw error;
  }
}

/**
 * Check if a user's account has expired
 */
export function isUserExpired(user: { expiration: Expiration }) {
  if (user.expiration === 'never') return false;
  const expirationDate = new Date(user.expiration);
  return expirationDate < new Date();
}