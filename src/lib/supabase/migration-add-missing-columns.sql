-- ========================================
-- ForeverStory.ai - Database Migration
-- Add missing columns to stories table
-- ========================================
-- Run this in your Supabase SQL Editor

-- Add missing columns to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS character_images TEXT[],
ADD COLUMN IF NOT EXISTS tier TEXT,
ADD COLUMN IF NOT EXISTS teaser_url TEXT,
ADD COLUMN IF NOT EXISTS deluxe_video_url TEXT,
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 90;

-- Add index for tier column (for analytics)
CREATE INDEX IF NOT EXISTS idx_stories_tier ON public.stories(tier);

-- Update the schema to reflect these changes
COMMENT ON COLUMN public.stories.character_images IS 'Array of URLs to character avatar images';
COMMENT ON COLUMN public.stories.tier IS 'Payment tier: basic, premium, or deluxe';
COMMENT ON COLUMN public.stories.teaser_url IS 'URL to the 30-second teaser video';
COMMENT ON COLUMN public.stories.deluxe_video_url IS 'URL to the animated deluxe version';
COMMENT ON COLUMN public.stories.duration_seconds IS 'Video duration in seconds';
