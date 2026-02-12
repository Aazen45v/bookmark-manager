-- Database Schema for Bookmark Manager
-- Run this in your Supabase SQL Editor

-- Create bookmarks table with Row Level Security (RLS)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on bookmarks table
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policy: Users can update their own bookmarks
CREATE POLICY "Users can update own bookmarks" ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
-- Go to Supabase Dashboard > Database > Replication > Source
-- Enable replication for the 'bookmarks' table

-- Note: For Google Auth to work, configure:
-- 1. Go to Supabase Authentication > Providers > Google
-- 2. Enable Google provider
-- 3. Add your Google OAuth client ID and secret from Google Cloud Console
-- 4. Add authorized redirect URI in Google Cloud Console:
--    https://your-project.supabase.co/auth/v1/callback
