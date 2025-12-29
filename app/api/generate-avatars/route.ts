// ========================================
// Avatar Generation API Endpoint
// POST: Generate avatars for a story
// GET: Retrieve cached avatars
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generateAvatarsForStory,
  generateAvatarInAllStyles,
  getCachedAvatar,
  getOrGenerateAvatar,
} from '@/lib/ai/avatar-generator';
import { CinematicStyleId } from '@/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// Request/Response Types
// ========================================

interface GenerateAvatarsRequest {
  storyId: string;
  photoUrls: string[];
  styleId: CinematicStyleId;
  generateAllStyles?: boolean;
}

// ========================================
// POST: Generate Avatars
// ========================================

export async function POST(request: NextRequest) {
  const requestId = `avatar_${Date.now()}`;
  console.log(`\n========================================`);
  console.log(`[${requestId}] /api/generate-avatars - POST Request`);
  console.log(`========================================\n`);

  try {
    const body: GenerateAvatarsRequest = await request.json();
    const { storyId, photoUrls, styleId, generateAllStyles } = body;

    // Validation
    if (!storyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: storyId' },
        { status: 400 }
      );
    }

    if (!photoUrls || photoUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: photoUrls' },
        { status: 400 }
      );
    }

    if (!styleId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: styleId' },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Request details:`, {
      storyId,
      photoCount: photoUrls.length,
      styleId,
      generateAllStyles,
    });

    // Update story status to show avatar generation
    await supabase
      .from('stories')
      .update({
        status: 'generating_characters',
        current_step: 'Creating your animated characters...',
        progress: 25,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId);

    let result;

    if (generateAllStyles) {
      // Generate avatars for all 24 styles (premium feature)
      console.log(`[${requestId}] Generating avatars in all 24 styles`);

      const allStyleAvatars: Record<string, Partial<Record<CinematicStyleId, string>>> = {};

      // Process up to 2 photos (one per partner)
      for (let i = 0; i < Math.min(photoUrls.length, 2); i++) {
        const personAvatars = await generateAvatarInAllStyles(photoUrls[i], storyId, i);
        allStyleAvatars[`person${i}`] = personAvatars;
      }

      result = {
        success: Object.keys(allStyleAvatars).length > 0,
        storyId,
        allStyleAvatars,
        styleId,
        generationTimeMs: 0,
        modelUsed: 'instant-id',
      };
    } else {
      // Generate avatars for single style (default)
      result = await generateAvatarsForStory(photoUrls, styleId, storyId);
      result = { ...result, storyId };
    }

    // Update story with avatar data
    if (result.success) {
      await supabase
        .from('stories')
        .update({
          current_step: 'Characters created! Preparing your love story...',
          progress: 35,
          avatar_data: JSON.stringify(result),
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId);
    } else {
      // Avatar generation failed, but don't block the pipeline
      console.warn(`[${requestId}] Avatar generation failed, continuing with original photos`);
      await supabase
        .from('stories')
        .update({
          current_step: 'Preparing your love story...',
          progress: 35,
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyId);
    }

    console.log(`[${requestId}] Avatar generation complete:`, {
      success: result.success,
      avatarCount: result.avatars?.length || 0,
      generationTimeMs: result.generationTimeMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[${requestId}] Avatar generation failed:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Avatar generation failed',
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET: Retrieve Cached Avatars
// ========================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get('storyId');
  const personIndex = parseInt(searchParams.get('personIndex') || '0');
  const styleId = searchParams.get('styleId') as CinematicStyleId;

  console.log(`[Avatar API] GET request:`, { storyId, personIndex, styleId });

  // Validation
  if (!storyId) {
    return NextResponse.json(
      { success: false, error: 'Missing query parameter: storyId' },
      { status: 400 }
    );
  }

  if (!styleId) {
    return NextResponse.json(
      { success: false, error: 'Missing query parameter: styleId' },
      { status: 400 }
    );
  }

  try {
    // Check cache
    const cachedUrl = await getCachedAvatar(storyId, personIndex, styleId);

    if (cachedUrl) {
      return NextResponse.json({
        success: true,
        avatarUrl: cachedUrl,
        cached: true,
        storyId,
        personIndex,
        styleId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Avatar not found in cache',
        cached: false,
        storyId,
        personIndex,
        styleId,
      });
    }
  } catch (error) {
    console.error('[Avatar API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve avatar',
      },
      { status: 500 }
    );
  }
}

// ========================================
// Runtime Configuration
// ========================================

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for avatar generation
