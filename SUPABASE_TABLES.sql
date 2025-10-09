-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  expiration TEXT NOT NULL,
  api_keys TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  username TEXT NOT NULL,
  ip TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_keywords_username ON keywords(username);
CREATE INDEX IF NOT EXISTS idx_keywords_timestamp ON keywords(timestamp);

-- Create admin user
INSERT INTO users (id, username, password, role, expiration, api_keys, created_at)
VALUES (
  uuid_generate_v4(),
  'admin',
  '0968885430',
  'admin',
  'never',
  '{}',
  NOW()
)
ON CONFLICT (username) DO NOTHING;