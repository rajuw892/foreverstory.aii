import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { StoryFormData } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}`;
  console.log(`\n========================================`);
  console.log(`[${requestId}] /api/generate - New request received`);
  console.log(`========================================\n`);

  try {
    const body = await request.json();
    const { anonymousId, ...storyData } = body as StoryFormData & { anonymousId: string };

    console.log(`[${requestId}] Request data:`, {
      anonymousId,
      coupleNames: storyData.coupleNames,
      photoCount: storyData.photos?.length || 0,
      styleId: storyData.cinematicStyleId || storyData.artStyle,
      voiceId: storyData.voiceId,
    });

    // Validate required fields
    if (!storyData.coupleNames || !storyData.photos || storyData.photos.length < 2) {
      console.error(`[${requestId}] Validation failed:`, {
        hasCoupleNames: !!storyData.coupleNames,
        photoCount: storyData.photos?.length || 0,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create story record in Supabase
    const storyId = uuidv4();
    console.log(`[${requestId}] Generated story ID: ${storyId}`);

    const { error: insertError } = await supabase
      .from('stories')
      .insert({
        id: storyId,
        // user_id is optional (NULL for anonymous users)
        status: 'queued',
        story_data: storyData,
        progress: 0,
        current_step: 'Preparing your story...',
        paid: false,
      });

    if (insertError) {
      console.error(`[${requestId}] Supabase insert error:`, insertError);
      return NextResponse.json(
        { error: 'Failed to create story' },
        { status: 500 }
      );
    }

    console.log(`[${requestId}] Story record created in Supabase successfully`);

    // Trigger video generation in the background (fire and forget)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const videoGenPayload = {
      jobId: storyId,
      storyData: {
        partner1Name: storyData.coupleNames.split(' and ')[0] || storyData.coupleNames,
        partner2Name: storyData.coupleNames.split(' and ')[1] || 'Your Partner',
        anniversaryDate: new Date().toISOString().split('T')[0],
        howWeMet: storyData.howMet,
        firstDate: storyData.firstDate,
        funniestMoment: storyData.insideJoke,
        whenIKnew: storyData.iLoveYou,
        favoriteThing: storyData.adventure,
        futureDream: storyData.futureDream,
      },
      photoUrls: storyData.photos,
      styleId: storyData.cinematicStyleId || storyData.artStyle || 'ghibli_cherry_blossoms',
      voiceId: storyData.voiceId || 'aria',
    };

    console.log(`[${requestId}] Triggering background video generation:`, {
      url: `${baseUrl}/api/generate-video`,
      jobId: storyId,
      photoCount: videoGenPayload.photoUrls.length,
      styleId: videoGenPayload.styleId,
      voiceId: videoGenPayload.voiceId,
    });

    // Don't await - let it run in background
    fetch(`${baseUrl}/api/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoGenPayload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[${requestId}] Background job HTTP error:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          });
        } else {
          console.log(`[${requestId}] Background job triggered successfully`);
        }
      })
      .catch(err => {
        console.error(`[${requestId}] Background job failed to trigger:`, {
          error: err.message,
          stack: err.stack,
        });
      });

    console.log(`[${requestId}] Returning success response to client`);

    return NextResponse.json({
      success: true,
      jobId: storyId,
      status: 'queued',
      message: 'Your story is being created!',
    });
  } catch (error) {
    console.error(`[${requestId}] Generate API error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
