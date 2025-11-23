import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';
import { StoryFormData } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anonymousId, ...storyData } = body as StoryFormData & { anonymousId: string };

    // Validate required fields
    if (!storyData.coupleNames || !storyData.photos || storyData.photos.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create story record in Supabase
    const storyId = uuidv4();

    const { error: insertError } = await supabase
      .from('stories')
      .insert({
        id: storyId,
        anonymous_id: anonymousId,
        status: 'queued',
        story_data: storyData,
        progress: 0,
        current_step: 'Preparing your story...',
        paid: false,
      });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      );
    }

    // Add job to Redis queue
    const jobPayload = {
      storyId,
      storyData,
      photoUrls: storyData.photos,
      createdAt: new Date().toISOString(),
    };

    await redis.lpush('video_jobs', JSON.stringify(jobPayload));

    // Also create job record in Supabase as backup
    await supabase.from('job_queue').insert({
      story_id: storyId,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      jobId: storyId,
      status: 'queued',
      message: 'Your story is being created!',
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
