import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getProgressPercentage, getStatusMessage } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Fetch story from Supabase
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Calculate progress
    const progress = story.progress || getProgressPercentage(story.status);
    const currentStep = story.current_step || getStatusMessage(story.status);

    return NextResponse.json({
      status: story.status,
      progress,
      currentStep,
      videoUrl: story.video_url,
      watermarkedVideoUrl: story.watermarked_video_url,
      paid: story.paid,
      storyData: story.story_data,
      error: story.error_message,
      createdAt: story.created_at,
    });
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
