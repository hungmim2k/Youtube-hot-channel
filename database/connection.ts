import mongoose from 'mongoose';

// Add emitWarning to mongoose type
declare module 'mongoose' {
  interface Mongoose {
    emitWarning?: (warning: string) => void;
  }
}

// Polyfill for global in browser environments
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Polyfill for mongoose's emitWarning function in browser environments
if (mongoose && !mongoose.emitWarning) {
  mongoose.emitWarning = function(warning: string) {
    console.warn(`Mongoose warning: ${warning}`);
  };
}

// Add a comment to clarify the framework being used
// This project uses React with Vite and connects directly to MongoDB using Mongoose
// from the client-side without a separate Node.js backend

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  // Handle gracefully in browser environment
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB
 */
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('Disconnected from MongoDB');
  }
}

// Connection event handlers
if (mongoose.connection && mongoose.connection.on) {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
  });
}

// Handle process termination (Node.js environment only)
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
}
