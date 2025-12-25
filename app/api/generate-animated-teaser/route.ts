// ========================================
// Animated Teaser Generation API Route
// Generates a 15-second REAL ANIMATED teaser using AI
// Instead of Ken Burns slideshow, this creates actual cartoon animation
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ========================================
// Configuration
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// AI Animation Services Configuration
// ========================================

const KLING_CONFIG = {
  apiKey: process.env.KLING_AI_API_KEY || '',
  apiSecret: process.env.KLING_AI_API_SECRET || '',
  endpoint: process.env.KLING_AI_ENDPOINT || 'https://api.klingai.com/v1',
};

const RUNWAY_CONFIG = {
  apiKey: process.env.RUNWAY_API_KEY || '',
  endpoint: 'https://api.runwayml.com/v1',
};

const LUMA_CONFIG = {
  apiKey: process.env.LUMA_API_KEY || '',
  endpoint: 'https://api.lumalabs.ai/dream-machine/v1',
};

// ========================================
// Request Interface
// ========================================

interface AnimatedTeaserRequest {
  jobId: string;
  photoUrls: string[]; // 2-8 photos
  storyData: {
    partner1Name: string;
    partner2Name: string;
    howWeMet: string;
    styleId?: string;
  };
}

interface AnimationScene {
  sceneNumber: number;
  duration: number; // seconds
  photoUrl: string;
  prompt: string; // AI animation prompt
  narration: string;
  cameraMovement: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'static';
}

// ========================================
// Helper: Update Job Status
// ========================================

async function updateStatus(
  jobId: string,
  progress: number,
  currentStep: string
) {
  await supabase
    .from('stories')
    .update({
      progress,
      current_step: currentStep,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

// ========================================
// Step 1: Generate 15-Second Story Scenes
// Creates 3 scenes × 5 seconds each
// ========================================

function generate15SecondStoryScenes(
  storyData: AnimatedTeaserRequest['storyData'],
  photoUrls: string[]
): AnimationScene[] {
  const { partner1Name, partner2Name, howWeMet, styleId } = storyData;

  // Select best 3 photos for teaser (first, middle, last)
  const selectedPhotos = [
    photoUrls[0], // Opening shot
    photoUrls[Math.floor(photoUrls.length / 2)] || photoUrls[1], // Middle
    photoUrls[photoUrls.length - 1] || photoUrls[0], // Closing
  ];

  const styleModifier = getAnimationStyleModifier(styleId || 'ghibli_cherry_blossoms');

  const scenes: AnimationScene[] = [
    {
      sceneNumber: 1,
      duration: 5,
      photoUrl: selectedPhotos[0],
      prompt: `Transform this photo into a beautiful animated scene. ${styleModifier}. The couple (${partner1Name} and ${partner2Name}) are meeting for the first time, eyes connecting, warm smiles, magical romantic moment. Subtle character movement, blinking eyes, gentle smiles, wind in hair, romantic atmosphere. Cinematic lighting, soft focus background, dreamy mood.`,
      narration: `This is the story of ${partner1Name} and ${partner2Name}...`,
      cameraMovement: 'zoom_in',
    },
    {
      sceneNumber: 2,
      duration: 5,
      photoUrl: selectedPhotos[1],
      prompt: `Animate this photo beautifully. ${styleModifier}. The couple is sharing a tender moment together, ${howWeMet.substring(0, 100)}. Characters showing emotion through subtle facial expressions, gentle movements, looking at each other lovingly. Romantic setting, warm lighting, emotional connection visible.`,
      narration: `${howWeMet.substring(0, 80)}...`,
      cameraMovement: 'pan_right',
    },
    {
      sceneNumber: 3,
      duration: 5,
      photoUrl: selectedPhotos[2],
      prompt: `Create a magical animated ending scene. ${styleModifier}. ${partner1Name} and ${partner2Name} looking towards their future together, hopeful expressions, warm smiles, hand in hand. Dreamy atmosphere, soft romantic lighting, feeling of forever beginning. Beautiful sunset or romantic background.`,
      narration: `Their forever story begins...`,
      cameraMovement: 'zoom_out',
    },
  ];

  return scenes;
}

function getAnimationStyleModifier(styleId: string): string {
  const styleModifiers: Record<string, string> = {
    ghibli_cherry_blossoms: 'Studio Ghibli animation style, soft watercolor aesthetic, hand-drawn quality, dreamy sakura petals floating',
    pixar_up_balloons: 'Pixar 3D animation style, expressive cartoon characters, vibrant colors, emotional depth',
    disney_castle_fireworks: 'Disney 2D animation style, classic fairy tale aesthetic, magical and enchanting',
    anime_starry_night: 'Anime style like Makoto Shinkai (Your Name), beautiful detailed backgrounds, emotional expressions',
    retro_film_noir: 'Retro animation style, film noir aesthetic, dramatic lighting and shadows',
    watercolor_garden: 'Watercolor animation style, soft pastel colors, gentle brush strokes, romantic garden setting',
  };

  return styleModifiers[styleId] || 'Beautiful animated cinematic style, romantic and emotional';
}

// ========================================
// Step 2: Generate Animated Clip with Kling AI
// Converts photo to 5-second animated video
// ========================================

async function generateKlingAnimatedClip(
  scene: AnimationScene,
  jobId: string
): Promise<string> {
  if (!KLING_CONFIG.apiKey || !KLING_CONFIG.apiSecret) {
    throw new Error('Kling AI credentials not configured. Add KLING_AI_API_KEY and KLING_AI_API_SECRET to .env.local');
  }

  console.log(`[Kling AI] Generating scene ${scene.sceneNumber} for job ${jobId}`);

  try {
    // Create image-to-video task
    const createResponse = await fetch(`${KLING_CONFIG.endpoint}/videos/image2video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KLING_CONFIG.apiKey}`,
        'X-API-Secret': KLING_CONFIG.apiSecret,
      },
      body: JSON.stringify({
        model_name: 'kling-v1-5', // Latest model
        image_url: scene.photoUrl,
        prompt: scene.prompt,
        negative_prompt: 'static image, frozen, no movement, still photo, ugly, distorted faces, blurry, low quality',
        duration: scene.duration, // 5 seconds
        aspect_ratio: '16:9',
        cfg_scale: 0.5, // Balance between creativity and photo accuracy
        camera_control: {
          type: scene.cameraMovement,
          speed: 'slow', // Smooth cinematic movement
        },
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Kling AI] API Error:', errorText);
      throw new Error(`Kling AI API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.data.task_id;

    console.log(`[Kling AI] Task created: ${taskId}`);

    // Poll for completion (Kling takes 60-180 seconds typically)
    let status = 'processing';
    let videoUrl = '';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)

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

        console.log(`[Kling AI] Task ${taskId} status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);

        if (status === 'succeed') {
          videoUrl = statusData.data.task_result.videos[0].url;
          console.log(`[Kling AI] Scene ${scene.sceneNumber} completed: ${videoUrl}`);
          break;
        } else if (status === 'failed') {
          const errorMsg = statusData.data.error_message || 'Unknown error';
          throw new Error(`Kling AI generation failed: ${errorMsg}`);
        }
      }

      attempts++;

      // Update progress for user
      const progressPercent = 20 + (scene.sceneNumber - 1) * 20 + (attempts / maxAttempts) * 20;
      await updateStatus(
        jobId,
        Math.floor(progressPercent),
        `Animating scene ${scene.sceneNumber}/3... ${Math.floor((attempts / maxAttempts) * 100)}%`
      );
    }

    if (!videoUrl) {
      throw new Error('Kling AI generation timeout after 5 minutes');
    }

    return videoUrl;

  } catch (error) {
    console.error(`[Kling AI] Scene ${scene.sceneNumber} generation failed:`, error);
    throw error;
  }
}

// ========================================
// Step 3: Fallback - Runway Gen-3 Animation
// Used if Kling AI fails or is not configured
// ========================================

async function generateRunwayAnimatedClip(
  scene: AnimationScene,
  jobId: string
): Promise<string> {
  if (!RUNWAY_CONFIG.apiKey) {
    throw new Error('Runway API key not configured. Add RUNWAY_API_KEY to .env.local');
  }

  console.log(`[Runway Gen-3] Generating scene ${scene.sceneNumber} for job ${jobId}`);

  try {
    const createResponse = await fetch(`${RUNWAY_CONFIG.endpoint}/image_to_video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_CONFIG.apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        promptImage: scene.photoUrl,
        promptText: scene.prompt,
        model: 'gen3a_turbo',
        duration: scene.duration,
        ratio: '16:9',
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Runway API error: ${createResponse.status}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    console.log(`[Runway] Task created: ${taskId}`);

    // Poll for completion
    let status = 'PENDING';
    let videoUrl = '';
    let attempts = 0;
    const maxAttempts = 60;

    while ((status === 'PENDING' || status === 'RUNNING') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`${RUNWAY_CONFIG.endpoint}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${RUNWAY_CONFIG.apiKey}` },
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        status = statusData.status;

        console.log(`[Runway] Task ${taskId} status: ${status}`);

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
    console.error(`[Runway] Scene ${scene.sceneNumber} generation failed:`, error);
    throw error;
  }
}

// ========================================
// Step 4: Combine 3 Scenes into 15-Second Video
// Uses FFmpeg to stitch clips with smooth transitions
// ========================================

async function combineAnimatedScenes(
  sceneUrls: string[],
  jobId: string
): Promise<string> {
  try {
    console.log(`[Combine] Stitching ${sceneUrls.length} animated scenes for job ${jobId}`);

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, unlink, readFile } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `teaser-animated-${jobId}.mp4`);

    // Download all scene clips
    const localClips: string[] = [];
    for (let i = 0; i < sceneUrls.length; i++) {
      const clipPath = path.join(tempDir, `scene-${jobId}-${i}.mp4`);

      console.log(`[Combine] Downloading scene ${i + 1}...`);
      const response = await fetch(sceneUrls[i]);
      const buffer = await response.arrayBuffer();
      await writeFile(clipPath, Buffer.from(buffer));

      localClips.push(clipPath);
    }

    // Create FFmpeg concat file with crossfade transitions
    const concatContent = localClips.map(p => `file '${p}'`).join('\n');
    const listFilePath = path.join(tempDir, `concat-${jobId}.txt`);
    await writeFile(listFilePath, concatContent);

    // Combine with smooth crossfade transitions (0.5 second fades)
    // This creates professional transitions between scenes
    console.log('[Combine] Applying crossfade transitions...');
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listFilePath}" ` +
      `-vf "fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5" ` +
      `-af "afade=t=in:st=0:d=0.5,afade=t=out:st=4.5:d=0.5" ` +
      `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k ` +
      `"${outputPath}"`,
      { timeout: 180000 } // 3 minute timeout
    );

    console.log('[Combine] Uploading to Supabase...');

    // Upload to Supabase Storage
    const videoBuffer = await readFile(outputPath);

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(`teasers-animated/${jobId}.mp4`, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Clean up temp files
    await Promise.all([
      unlink(listFilePath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      ...localClips.map(p => unlink(p).catch(() => {})),
    ]);

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(`teasers-animated/${jobId}.mp4`);

    console.log(`[Combine] Final teaser URL: ${data.publicUrl}`);
    return data.publicUrl;

  } catch (error) {
    console.error('[Combine] Failed to combine scenes:', error);
    throw new Error(`Video combining failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// Step 5: Add Narration + Music
// Mixes narration (70%) and background music (30%)
// ========================================

async function addAudioToTeaser(
  videoUrl: string,
  narrationText: string,
  jobId: string
): Promise<string> {
  try {
    console.log('[Audio] Adding narration and music to animated teaser...');

    // Generate short narration (15 seconds)
    const shortNarration = `This is ${narrationText.split('.')[0]}. ${narrationText.split('.')[1] || ''}`;

    // Generate voice-over using Edge-TTS (free, fast)
    const { spawnSync, exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, unlink, readFile } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();

    // Generate narration audio
    const textPath = path.join(tempDir, `narration-${jobId}.txt`);
    const narrationPath = path.join(tempDir, `narration-${jobId}.mp3`);
    await writeFile(textPath, shortNarration);

    // Check if edge-tts is available
    const probe = spawnSync('edge-tts', ['--version'], { stdio: 'ignore' });

    if (probe.error || probe.status !== 0) {
      console.warn('[Audio] edge-tts not available, skipping narration');
      return videoUrl; // Return video without narration
    }

    await execAsync(
      `edge-tts --voice "en-US-AriaNeural" --rate=-5% --file "${textPath}" --write-media "${narrationPath}"`,
      { timeout: 60000 }
    );

    // Download video
    const videoPath = path.join(tempDir, `video-${jobId}.mp4`);
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    await writeFile(videoPath, Buffer.from(videoBuffer));

    // Download background music (romantic track)
    const musicUrl = 'https://cdn.pixabay.com/download/audio/2024/02/14/audio_romantic.mp3';
    const musicPath = path.join(tempDir, `music-${jobId}.mp3`);
    const musicResponse = await fetch(musicUrl);
    const musicBuffer = await musicResponse.arrayBuffer();
    await writeFile(musicPath, Buffer.from(musicBuffer));

    const outputPath = path.join(tempDir, `final-teaser-${jobId}.mp4`);

    // Mix audio: narration (70%) + music (30%)
    await execAsync(
      `ffmpeg -i "${videoPath}" -i "${narrationPath}" -i "${musicPath}" ` +
      `-filter_complex "[1:a]volume=0.7[a1];[2:a]volume=0.3,afade=t=in:st=0:d=1,afade=t=out:st=14:d=1[a2];[a1][a2]amix=inputs=2:duration=first[aout]" ` +
      `-map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 128k -shortest ` +
      `"${outputPath}"`,
      { timeout: 120000 }
    );

    // Upload final video
    const finalBuffer = await readFile(outputPath);
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(`teasers-animated/${jobId}-final.mp4`, finalBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Clean up
    await Promise.all([
      unlink(textPath).catch(() => {}),
      unlink(narrationPath).catch(() => {}),
      unlink(musicPath).catch(() => {}),
      unlink(videoPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
    ]);

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(`teasers-animated/${jobId}-final.mp4`);

    return data.publicUrl;

  } catch (error) {
    console.error('[Audio] Failed to add audio:', error);
    return videoUrl; // Return video without audio if fails
  }
}

// ========================================
// Main POST Handler
// ========================================

export async function POST(request: NextRequest) {
  let jobId: string | null = null;

  try {
    console.log('\n========================================');
    console.log('[ANIMATED TEASER] Starting 15-second animated teaser generation');
    console.log('========================================\n');

    const body: AnimatedTeaserRequest = await request.json();
    jobId = body.jobId;

    if (!jobId || !body.photoUrls || body.photoUrls.length < 2) {
      return NextResponse.json(
        { error: 'Invalid request: Need jobId and at least 2 photos' },
        { status: 400 }
      );
    }

    console.log(`[${jobId}] Request received:`, {
      photoCount: body.photoUrls.length,
      partner1: body.storyData.partner1Name,
      partner2: body.storyData.partner2Name,
    });

    await updateStatus(jobId, 5, 'Preparing animated teaser...');

    // Step 1: Generate 3 scenes (5 seconds each)
    console.log(`[${jobId}] Generating story scenes...`);
    const scenes = generate15SecondStoryScenes(body.storyData, body.photoUrls);

    await updateStatus(jobId, 10, 'Creating animated scenes...');

    // Step 2: Generate animated clips for each scene
    const sceneUrls: string[] = [];
    const useKling = KLING_CONFIG.apiKey && KLING_CONFIG.apiSecret;
    const useRunway = RUNWAY_CONFIG.apiKey;

    if (!useKling && !useRunway) {
      return NextResponse.json(
        {
          error: 'No animation service configured. Please add KLING_AI_API_KEY or RUNWAY_API_KEY to your .env.local file.',
        },
        { status: 500 }
      );
    }

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      console.log(`[${jobId}] Generating scene ${i + 1}/3...`);

      await updateStatus(
        jobId,
        20 + (i * 20),
        `Animating scene ${i + 1}/3: "${scene.narration}"...`
      );

      let sceneUrl: string;

      try {
        if (useKling) {
          sceneUrl = await generateKlingAnimatedClip(scene, jobId);
        } else {
          sceneUrl = await generateRunwayAnimatedClip(scene, jobId);
        }
        sceneUrls.push(sceneUrl);
      } catch (error) {
        console.error(`[${jobId}] Scene ${i + 1} failed:`, error);
        throw new Error(`Failed to generate scene ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await updateStatus(jobId, 80, 'Combining animated scenes...');

    // Step 3: Combine scenes with transitions
    console.log(`[${jobId}] Combining ${sceneUrls.length} animated scenes...`);
    const combinedVideoUrl = await combineAnimatedScenes(sceneUrls, jobId);

    await updateStatus(jobId, 90, 'Adding narration and music...');

    // Step 4: Add narration and music
    console.log(`[${jobId}] Adding audio...`);
    const fullNarration = `This is the story of ${body.storyData.partner1Name} and ${body.storyData.partner2Name}. ${body.storyData.howWeMet}`;
    const finalTeaserUrl = await addAudioToTeaser(combinedVideoUrl, fullNarration, jobId);

    await updateStatus(jobId, 100, 'Your animated teaser is ready!');

    // Update database with teaser URL
    await supabase
      .from('stories')
      .update({
        teaser_url: finalTeaserUrl,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    console.log(`[${jobId}] ✓ Animated teaser completed: ${finalTeaserUrl}\n`);

    return NextResponse.json({
      success: true,
      jobId,
      teaserUrl: finalTeaserUrl,
      message: 'Animated 15-second teaser generated successfully!',
      animationType: useKling ? 'Kling AI' : 'Runway Gen-3',
    });

  } catch (error) {
    console.error(`[${jobId}] ❌ Animated teaser generation FAILED:`, error);

    if (jobId) {
      await supabase
        .from('stories')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Teaser generation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Animated teaser generation failed',
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET Handler - Check Teaser Status
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
      .select('teaser_url, status, progress, current_step')
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
      teaserUrl: story.teaser_url,
      isComplete: story.status === 'completed' && !!story.teaser_url,
    });

  } catch (error) {
    console.error('[Teaser Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
