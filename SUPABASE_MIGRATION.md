# Migration from Mongoose to Supabase

## Overview
This document outlines the changes made to migrate the application from using MongoDB with Mongoose to using Supabase as the database provider.

## Changes Made

### 1. Dependencies
- Removed `mongoose` and `mongodb` dependencies
- Added `@supabase/supabase-js` dependency

### 2. Database Configuration
- Created a new Supabase client configuration file (`database/supabase.ts`)
- Updated the database index file (`database/index.ts`) to export Supabase services instead of Mongoose models and services

### 3. Database Services
- Created new Supabase-based user service (`database/services/userServiceSupabase.ts`)
- Created new Supabase-based keyword service (`database/services/keywordServiceSupabase.ts`)
- Both services maintain the same API as the original Mongoose services, but use Supabase under the hood

### 4. Authentication Context
- Updated `contexts/AuthContext.tsx` to use the new Supabase services
- Updated field names to match Supabase conventions (e.g., `apiKeys` → `api_keys`, `createdAt` → `created_at`)

### 5. Environment Variables
- Updated `vite.config.ts` to include Supabase environment variables instead of MongoDB ones
- Using the Supabase configuration from the `.env.local` file

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  expiration TEXT NOT NULL,
  api_keys TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Keywords Table
```sql
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  username TEXT NOT NULL,
  ip TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_keywords_username ON keywords(username);
CREATE INDEX idx_keywords_timestamp ON keywords(timestamp);
```

## Next Steps
1. Create the necessary tables in Supabase using the SQL statements above
2. Test the application to ensure all functionality works with Supabase
3. Consider implementing proper authentication using Supabase Auth in the future