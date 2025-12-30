// ========================================
// Deluxe Video Generation API Route
// Creates fully animated short movie with:
// - AI-generated character avatars that look like the couple
// - Animated scene backgrounds
// - Lip-synced talking heads
// - Professional video composition
// Only triggered after Deluxe tier payment
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAnimatedMovie, MovieConfig } from '@/lib/ai/movie-composer';
import { CinematicStyleId } from '@/types';

// ========================================
// Configuration
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// Kling AI Configuration
// ========================================

const KLING_CONFIG = {
  apiKey: process.env.KLING_AI_API_KEY || '',
  apiSecret: process.env.KLING_AI_API_SECRET || '',
  endpoint: process.env.KLING_AI_ENDPOINT || 'https://api.klingai.com/v1',
};

// ========================================
// Runway Gen-3 Configuration (Alternative)
// ========================================

const RUNWAY_CONFIG = {
  apiKey: process.env.RUNWAY_API_KEY || '',
  endpoint: process.env.RUNWAY_API_ENDPOINT || 'https://api.runwayml.com/v1',
};

// ========================================
// Request Interface
// ========================================

interface GenerateDeluxeRequest {
  jobId: string;
}

interface KlingVideoRequest {
  image_url: string;
  prompt: string;
  duration: number; // in seconds
  aspect_ratio: '16:9' | '9:16' | '1:1';
  mode: 'standard' | 'professional';
}

interface RunwayVideoRequest {
  promptImage: string;
  promptText: string;
  duration: number;
  ratio: '16:9' | '9:16' | '1:1';
  model: 'gen3a_turbo';
}

// ========================================
// Helper: Update Job Status
// ========================================

async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  currentStep: string,
  deluxeVideoUrl?: string
) {
  const updateData: any = {
    status,
    progress,
    current_step: currentStep,
    updated_at: new Date().toISOString(),
  };

  if (deluxeVideoUrl) {
    updateData.deluxe_video_url = deluxeVideoUrl;
  }

  await supabase
    .from('stories')
    .update(updateData)
    .eq('id', jobId);
}

// ========================================
// Kling AI Integration
// ========================================

async function generateWithKlingAI(
  photoUrls: string[],
  narrationText: string,
  styleId: string,
  jobId: string
): Promise<string> {
  console.log('[Kling AI] Starting animation generation for job:', jobId);

  try {
    // Step 1: Select best photos for animation (first 6 photos)
    const selectedPhotos = photoUrls.slice(0, 6);
    console.log('[Kling AI] Selected photos:', selectedPhotos.length);

    await updateJobStatus(
      jobId,
      'generating_deluxe',
      10,
      'Preparing photos for animation...'
    );

    // Step 2: Generate prompts for each photo segment
    const prompts = generateAnimationPrompts(narrationText, styleId);
    console.log('[Kling AI] Generated prompts:', prompts.length);

    // Step 3: Generate video clips for each photo (25 seconds each)
    const videoClips: string[] = [];

    for (let i = 0; i < selectedPhotos.length; i++) {
      const photoUrl = selectedPhotos[i];
      const prompt = prompts[i] || prompts[0];

      await updateJobStatus(
        jobId,
        'generating_deluxe',
        10 + (i * 10),
        `Animating photo ${i + 1} of ${selectedPhotos.length}...`
      );

      console.log(`[Kling AI] Generating clip ${i + 1}/${selectedPhotos.length}`);

      const clipUrl = await generateKlingClip({
        image_url: photoUrl,
        prompt: `${prompt}. Smooth animation, emotional, cinematic. Transform the photo into a beautiful animated scene with the characters moving naturally.`,
        duration: 25, // 25 seconds per clip
        aspect_ratio: '16:9',
        mode: 'professional', // Higher quality for Deluxe
      });

      videoClips.push(clipUrl);
      console.log(`[Kling AI] Clip ${i + 1} generated:`, clipUrl);
    }

    await updateJobStatus(
      jobId,
      'generating_deluxe',
      70,
      'Combining animated clips...'
    );

    // Step 4: Combine clips into final video
    const finalVideoUrl = await combineVideoClips(videoClips, jobId);

    await updateJobStatus(
      jobId,
      'generating_deluxe',
      90,
      'Adding narration and music...'
    );

    // Step 5: Add original narration and music
    const finalUrl = await addAudioToVideo(finalVideoUrl, jobId);

    console.log('[Kling AI] Final deluxe video:', finalUrl);
    return finalUrl;

  } catch (error) {
    console.error('[Kling AI] Generation failed:', error);
    throw new Error(`Kling AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// Generate single Kling AI clip
// ========================================

async function generateKlingClip(request: KlingVideoRequest): Promise<string> {
  if (!KLING_CONFIG.apiKey || !KLING_CONFIG.apiSecret) {
    throw new Error('Kling AI credentials not configured');
  }

  try {
    // Create generation task
    const createResponse = await fetch(`${KLING_CONFIG.endpoint}/videos/image2video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KLING_CONFIG.apiKey}`,
        'X-API-Secret': KLING_CONFIG.apiSecret,
      },
      body: JSON.stringify({
        model_name: 'kling-v1',
        image_url: request.image_url,
        prompt: request.prompt,
        negative_prompt: 'static, frozen, still image, no movement, ugly, distorted',
        duration: request.duration,
        aspect_ratio: request.aspect_ratio,
        cfg_scale: 0.5, // Creativity
        mode: request.mode,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Kling AI API error: ${error}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.data.task_id;

    console.log('[Kling AI] Task created:', taskId);

    // Poll for completion
    let status = 'processing';
    let videoUrl = '';
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes (5 second intervals)

    while (status === 'processing' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`${KLING_CONFIG.endpoint}/videos/task/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${KLING_CONFIG.apiKey}`,
          'X-API-Secret': KLING_CONFIG.apiSecret,
        },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        status = statusData.data.task_status;

        if (status === 'succeed') {
          videoUrl = statusData.data.task_result.videos[0].url;
          break;
        } else if (status === 'failed') {
          throw new Error('Kling AI generation failed');
        }
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Kling AI generation timeout');
    }

    return videoUrl;

  } catch (error) {
    console.error('[Kling AI] Clip generation error:', error);
    throw error;
  }
}

// ========================================
// Runway Gen-3 Integration (Alternative)
// ========================================

async function generateWithRunway(
  photoUrls: string[],
  narrationText: string,
  styleId: string,
  jobId: string
): Promise<string> {
  console.log('[Runway] Starting animation generation for job:', jobId);

  try {
    const selectedPhotos = photoUrls.slice(0, 6);
    const prompts = generateAnimationPrompts(narrationText, styleId);
    const videoClips: string[] = [];

    for (let i = 0; i < selectedPhotos.length; i++) {
      await updateJobStatus(
        jobId,
        'generating_deluxe',
        10 + (i * 10),
        `Animating photo ${i + 1} of ${selectedPhotos.length}...`
      );

      const clipUrl = await generateRunwayClip({
        promptImage: selectedPhotos[i],
        promptText: prompts[i] || prompts[0],
        duration: 25,
        ratio: '16:9',
        model: 'gen3a_turbo',
      });

      videoClips.push(clipUrl);
    }

    await updateJobStatus(
      jobId,
      'generating_deluxe',
      70,
      'Combining animated clips...'
    );

    const finalVideoUrl = await combineVideoClips(videoClips, jobId);
    const finalUrl = await addAudioToVideo(finalVideoUrl, jobId);

    return finalUrl;

  } catch (error) {
    console.error('[Runway] Generation failed:', error);
    throw new Error(`Runway generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// Generate single Runway clip
// ========================================

async function generateRunwayClip(request: RunwayVideoRequest): Promise<string> {
  if (!RUNWAY_CONFIG.apiKey) {
    throw new Error('Runway API key not configured');
  }

  try {
    // Create generation task
    const createResponse = await fetch(`${RUNWAY_CONFIG.endpoint}/image_to_video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        promptImage: request.promptImage,
        promptText: request.promptText + '. Smooth animation, characters moving naturally, cinematic.',
        model: request.model,
        duration: request.duration,
        ratio: request.ratio,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Runway API error');
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Poll for completion
    let status = 'PENDING';
    let videoUrl = '';
    let attempts = 0;

    while ((status === 'PENDING' || status === 'RUNNING') && attempts < 120) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`${RUNWAY_CONFIG.endpoint}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${RUNWAY_CONFIG.apiKey}` },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        status = statusData.status;

        if (status === 'SUCCEEDED') {
          videoUrl = statusData.output[0];
          break;
        } else if (status === 'FAILED') {
          throw new Error('Runway generation failed');
        }
      }

      attempts++;
    }

    if (!videoUrl) throw new Error('Runway generation timeout');
    return videoUrl;

  } catch (error) {
    console.error('[Runway] Clip generation error:', error);
    throw error;
  }
}

// ========================================
// Helper: Generate Animation Prompts
// ========================================

function generateAnimationPrompts(narrationText: string, styleId: string): string[] {
  // Extract key moments from narration
  const segments = [
    'Two people meeting for the first time, eyes connecting, warm smiles, magical moment',
    'Couple on their first date, laughing together, sharing stories, romantic atmosphere',
    'Funny moment together, genuine laughter, playful interaction, joyful expressions',
    'Intimate moment of realization, deep emotions, love dawning, tender gazes',
    'Showing appreciation, small gestures of love, everyday moments, happiness',
    'Looking towards future together, dreams shared, hopeful expressions, unity',
  ];

  // Add style-specific modifiers
  const styleModifier = getStyleModifier(styleId);
  return segments.map(segment => `${segment}, ${styleModifier}`);
}

function getStyleModifier(styleId: string): string {
  const modifiers: Record<string, string> = {
    ghibli_cherry_blossoms: 'Studio Ghibli animation style, soft watercolor, dreamy',
    pixar_up_balloons: 'Pixar 3D animation, expressive characters, vibrant colors',
    disney_castle_fireworks: 'Disney animation style, magical, enchanting',
    anime: 'Beautiful anime style, Makoto Shinkai aesthetic, emotional',
    // Add more as needed
  };

  return modifiers[styleId] || 'beautiful animation style, cinematic, emotional';
}

// ========================================
// Helper: Combine Video Clips
// ========================================

async function combineVideoClips(clipUrls: string[], jobId: string): Promise<string> {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, unlink } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const listFilePath = path.join(tempDir, `concat-${jobId}.txt`);
    const outputPath = path.join(tempDir, `deluxe-${jobId}.mp4`);

    // Download all clips first
    const localClips: string[] = [];
    for (let i = 0; i < clipUrls.length; i++) {
      const clipPath = path.join(tempDir, `clip-${jobId}-${i}.mp4`);

      // Download clip
      const response = await fetch(clipUrls[i]);
      const buffer = await response.arrayBuffer();
      await writeFile(clipPath, Buffer.from(buffer));

      localClips.push(clipPath);
    }

    // Create concat file for FFmpeg
    const concatContent = localClips.map(p => `file '${p}'`).join('\n');
    await writeFile(listFilePath, concatContent);

    // Combine videos using FFmpeg
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`,
      { timeout: 300000 } // 5 minute timeout
    );

    // Upload to Supabase
    const fs = await import('fs/promises');
    const videoBuffer = await fs.readFile(outputPath);

    const { error } = await supabase.storage
      .from('videos')
      .upload(`deluxe/${jobId}.mp4`, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) throw error;

    // Clean up temp files
    await Promise.all([
      unlink(listFilePath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      ...localClips.map(p => unlink(p).catch(() => {})),
    ]);

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(`deluxe/${jobId}.mp4`);

    return data.publicUrl;

  } catch (error) {
    console.error('[Combine] Video combining failed:', error);
    throw new Error('Failed to combine video clips');
  }
}

// ========================================
// Helper: Add Audio to Video
// ========================================

async function addAudioToVideo(videoUrl: string, jobId: string): Promise<string> {
  try {
    // Get original story data for audio URLs
    const { data: story } = await supabase
      .from('stories')
      .select('narration_audio_url, music_url')
      .eq('id', jobId)
      .single();

    if (!story || !story.narration_audio_url) {
      return videoUrl; // Return without audio if not available
    }

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, unlink, readFile } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `final-deluxe-${jobId}.mp4`);

    // Download video
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    const videoPath = path.join(tempDir, `video-${jobId}.mp4`);
    await writeFile(videoPath, Buffer.from(videoBuffer));

    // Download narration
    const narrationResponse = await fetch(story.narration_audio_url);
    const narrationBuffer = await narrationResponse.arrayBuffer();
    const narrationPath = path.join(tempDir, `narration-${jobId}.mp3`);
    await writeFile(narrationPath, Buffer.from(narrationBuffer));

    // Combine video with narration using FFmpeg
    let ffmpegCmd = `ffmpeg -i "${videoPath}" -i "${narrationPath}"`;

    if (story.music_url) {
      // Download music
      const musicResponse = await fetch(story.music_url);
      const musicBuffer = await musicResponse.arrayBuffer();
      const musicPath = path.join(tempDir, `music-${jobId}.mp3`);
      await writeFile(musicPath, Buffer.from(musicBuffer));

      // Mix narration (70%) and music (30%)
      ffmpegCmd += ` -i "${musicPath}" -filter_complex "[1:a]volume=0.7[a1];[2:a]volume=0.3[a2];[a1][a2]amix=inputs=2:duration=first[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac "${outputPath}"`;
    } else {
      // Just add narration
      ffmpegCmd += ` -c:v copy -c:a aac -map 0:v -map 1:a "${outputPath}"`;
    }

    await execAsync(ffmpegCmd, { timeout: 300000 });

    // Upload final video
    const finalBuffer = await readFile(outputPath);
    const { error } = await supabase.storage
      .from('videos')
      .upload(`deluxe/${jobId}-final.mp4`, finalBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) throw error;

    // Clean up
    await Promise.all([
      unlink(videoPath).catch(() => {}),
      unlink(narrationPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(`deluxe/${jobId}-final.mp4`);

    return data.publicUrl;

  } catch (error) {
    console.error('[Audio] Failed to add audio:', error);
    // Return video without audio if adding audio fails
    return videoUrl;
  }
}

// ========================================
// Main POST Handler
// Triggered after Deluxe payment
// ========================================

export async function POST(request: NextRequest) {
  let storyJobId: string = '';

  try {
    const body: GenerateDeluxeRequest = await request.json();
    const jobId = body.jobId;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Assign to outer scope variable for error handler access
    storyJobId = jobId;

    // Verify story exists and payment is complete
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', jobId)
      .single();

    if (storyError || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Verify payment (basic, premium, or deluxe)
    if (!story.paid) {
      return NextResponse.json(
        { error: 'Payment required' },
        { status: 402 }
      );
    }

    // Determine duration based on tier
    const tierDurations: Record<string, number> = {
      basic: 30,      // 30 seconds
      premium: 90,    // 1.5 minutes
      deluxe: 150,    // 2.5 minutes
    };
    const targetDuration = tierDurations[story.payment_tier] || 30;

    // Check if already generated
    if (story.deluxe_video_url) {
      return NextResponse.json({
        success: true,
        jobId,
        movieUrl: story.deluxe_video_url,
        teaserUrl: story.teaser_url,
        duration: targetDuration,
        message: 'Animated movie already generated',
      });
    }

    console.log(`[Animated Movie] Starting ${story.payment_tier} tier generation (${targetDuration}s) for job:`, jobId);

    await updateJobStatus(
      jobId,
      'generating_movie',
      5,
      'Starting your animated movie creation...'
    );

    // Use the new Movie Composer for fully animated content
    const movieConfig: MovieConfig = {
      storyId: jobId,
      styleId: (story.style_id || 'ghibli_cherry_blossoms') as CinematicStyleId,
      photoUrls: story.photo_urls || [],
      storyData: {
        partner1Name: story.story_data?.partner1Name || story.story_data?.coupleNames?.split(' & ')[0] || 'Partner 1',
        partner2Name: story.story_data?.partner2Name || story.story_data?.coupleNames?.split(' & ')[1] || 'Partner 2',
        howMet: story.story_data?.howMet || story.story_data?.howWeMet || '',
        firstDate: story.story_data?.firstDate || '',
        funnyMoment: story.story_data?.funniestMoment || story.story_data?.insideJoke || '',
        loveMoment: story.story_data?.whenIKnew || story.story_data?.iLoveYou || '',
        adventure: story.story_data?.adventure || '',
        futureDream: story.story_data?.futureDream || '',
      },
      narrationAudioUrl: story.narration_audio_url || '',
      musicUrl: story.music_url || '',
      targetDuration,
    };

    // Generate fully animated movie
    const movieResult = await createAnimatedMovie(
      movieConfig,
      async (progress) => {
        await updateJobStatus(
          storyJobId,
          'generating_movie',
          Math.min(progress.progress, 95),
          progress.message
        );
      }
    );

    if (!movieResult.success) {
      throw new Error(movieResult.error || 'Movie generation failed');
    }

    const deluxeVideoUrl = movieResult.movieUrl;

    // Update story with animated movie data
    await supabase
      .from('stories')
      .update({
        deluxe_video_url: movieResult.movieUrl,
        teaser_url: movieResult.teaserUrl,
        character_images: movieResult.components.avatars,
        scene_images: movieResult.components.scenes,
        scene_videos: movieResult.components.animatedClips,
        status: 'completed',
        progress: 100,
        current_step: 'Your animated movie is ready!',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`[Animated Movie] Generation complete (${targetDuration}s):`, movieResult.movieUrl);

    return NextResponse.json({
      success: true,
      jobId,
      tier: story.payment_tier,
      duration: targetDuration,
      movieUrl: movieResult.movieUrl,
      teaserUrl: movieResult.teaserUrl,
      generationTimeMs: movieResult.generationTimeMs,
      components: {
        avatars: movieResult.components.avatars.length,
        scenes: movieResult.components.scenes.length,
        animatedClips: movieResult.components.animatedClips.length,
      },
      message: `Your ${targetDuration}-second animated movie is ready!`,
    });

  } catch (error) {
    console.error('[Deluxe] Generation failed:', error);

    if (storyJobId) {
      await supabase
        .from('stories')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Deluxe generation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', storyJobId);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Deluxe generation failed',
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET Handler - Check Deluxe Status
// ========================================

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

    const { data: story, error } = await supabase
      .from('stories')
      .select('deluxe_video_url, status, progress, current_step')
      .eq('id', jobId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: story.status,
      progress: story.progress,
      currentStep: story.current_step,
      deluxeVideoUrl: story.deluxe_video_url,
      isComplete: story.status === 'completed' && !!story.deluxe_video_url,
    });

  } catch (error) {
    console.error('[Deluxe Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
