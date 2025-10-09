import { supabase, supabaseAdmin, TABLES, UserRecord, Role, Expiration } from '../supabase';

// Default admin user
export const DEFAULT_ADMIN = {
  username: 'admin',
  password: '0968885430',
  role: 'admin' as Role,
  expiration: 'never' as Expiration,
  api_keys: [],
};

/**
 * Initialize the database with the default admin user if it doesn't exist
 */
export async function initializeDatabase() {
  try {
    // Check if admin user exists
    const { data: adminExists, error: checkError } = await supabase
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
        .insert({
          ...DEFAULT_ADMIN,
          created_at: new Date().toISOString(),
        });
      
      if (createError) {
        console.error('Error creating admin user:', createError);
        throw createError;
      }
      
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
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
    
    return data || [];
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
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Error getting user ${username}:`, error);
      throw error;
    }
    
    return data;
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
  api_keys?: string[];
}) {
  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error(`User ${userData.username} already exists`);
    }
    
    // Create new user
    const newUser = {
      username: userData.username,
      password: userData.password,
      role: userData.role || 'user',
      expiration: userData.expiration || 'never',
      api_keys: userData.api_keys || [],
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .insert(newUser)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return data;
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
  updates: Partial<Omit<UserRecord, 'username' | 'id'>>
) {
  try {
    // Find and update user
    const { data, error } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(updates)
      .eq('username', username)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating user ${username}:`, error);
      throw error;
    }
    
    if (!data) {
      throw new Error(`User ${username} not found`);
    }
    
    return data;
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
    // Don't allow deleting the default admin
    if (username === DEFAULT_ADMIN.username) {
      throw new Error('Cannot delete default admin user');
    }
    
    // Delete user
    const { error } = await supabaseAdmin
      .from(TABLES.USERS)
      .delete()
      .eq('username', username);
    
    if (error) {
      console.error(`Error deleting user ${username}:`, error);
      throw error;
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
    // Find user
    const { data: user, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Error authenticating user ${username}:`, error);
      throw error;
    }
    
    if (!user) {
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