-- ========================================
-- ForeverStory.ai - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  anonymous_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued',
    'processing_script',
    'generating_characters',
    'creating_scenes',
    'generating_video',
    'adding_voice',
    'compiling',
    'completed',
    'failed'
  )),
  story_data JSONB NOT NULL,
  script JSONB,
  character_images TEXT[],
  scene_images TEXT[],
  scene_videos TEXT[],
  voiceover_url TEXT,
  video_url TEXT,
  watermarked_video_url TEXT,
  teaser_url TEXT,
  deluxe_video_url TEXT,
  paid BOOLEAN DEFAULT FALSE,
  tier TEXT,
  payment_tier TEXT,
  error_message TEXT,
  progress INTEGER DEFAULT 0,
  current_step TEXT,
  duration_seconds INTEGER DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  stripe_payment_id TEXT UNIQUE,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job queue table (backup for Redis)
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_anonymous_id ON public.stories(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_story_id ON public.payments(story_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON public.payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_job_queue_status ON public.job_queue(status);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous access
CREATE POLICY "Allow anonymous story creation" ON public.stories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read own stories" ON public.stories
  FOR SELECT USING (
    anonymous_id = current_setting('request.headers', true)::json->>'x-anonymous-id'
    OR user_id = auth.uid()
  );

CREATE POLICY "Allow update own stories" ON public.stories
  FOR UPDATE USING (
    anonymous_id = current_setting('request.headers', true)::json->>'x-anonymous-id'
    OR user_id = auth.uid()
  );

-- Service role bypass for API routes
CREATE POLICY "Service role full access stories" ON public.stories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access job_queue" ON public.job_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('scenes', 'scenes', true);
