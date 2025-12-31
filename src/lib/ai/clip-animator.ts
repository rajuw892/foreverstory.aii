// ========================================
// Clip Animator Service
// Creates animated video clips from scenes + avatars using Kling/Runway
// ========================================

import { CinematicStyleId } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { SceneType, getSceneMotionPrompt, SCENE_BASE_PROMPTS } from '@/config/scene-prompts';
import { replicateWithRetry, delayBetweenRequests } from './replicate-utils';

// ========================================
// Initialize Clients
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// Types
// ========================================

export interface AnimationClip {
  clipId: string;
  sceneType: SceneType;
  videoUrl: string;
  duration: number;
  provider: 'kling' | 'runway' | 'replicate';
}

export interface AnimationInput {
  imageUrl: string;  // Scene image or composed avatar+scene image
  sceneType: SceneType;
  styleId: CinematicStyleId;
  storyContext?: string;
  duration?: number;
}

export interface AnimationResult {
  success: boolean;
  clips: AnimationClip[];
  totalDuration: number;
  generationTimeMs: number;
  error?: string;
}

// ========================================
// Animation Prompts
// ========================================

/**
 * Generate animation-specific prompt for Kling/Runway
 */
function generateAnimationPrompt(
  sceneType: SceneType,
  styleId: CinematicStyleId,
  storyContext?: string
): string {
  const baseScene = SCENE_BASE_PROMPTS[sceneType];
  const motionPrompt = getSceneMotionPrompt(sceneType, styleId);

  const emotionKeywords: Record<SceneType, string> = {
    opening: 'gentle camera movement, establishing shot, romantic anticipation',
    meeting: 'two people moving towards each other, eye contact, spark of connection',
    first_date: 'intimate conversation, gentle gestures, shy smiles, nervous energy',
    funny_moment: 'genuine laughter, joyful movement, playful interaction',
    love_moment: 'tender embrace, loving gaze, emotional intensity, time slowing down',
    adventure: 'exciting movement, exploring together, wind in hair, shared excitement',
    future_dream: 'dreamy slow motion, hopeful expressions, gazing at horizon together',
    closing: 'embrace, silhouette, walking into sunset, eternal love',
  };

  const parts = [
    motionPrompt,
    emotionKeywords[sceneType],
    storyContext ? `scene depicting: ${storyContext}` : '',
    'cinematic camera movement, smooth animation, professional quality',
    'romantic atmosphere, emotional storytelling',
  ];

  return parts.filter(Boolean).join(', ');
}

// ========================================
// Kling AI Animation
// ========================================

async function animateWithKling(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  const apiKey = process.env.KLING_API_KEY;
  const apiSecret = process.env.KLING_API_SECRET;

  if (!apiKey) {
    throw new Error('Kling API key not configured');
  }

  console.log('[Animation] Starting Kling animation...');

  try {
    // Create video generation task
    const createResponse = await fetch('https://api.klingai.com/v1/videos/image2video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model_name: 'kling-v1-6',
        image: imageUrl,
        prompt: prompt,
        duration: duration.toString(),
        aspect_ratio: '16:9',  // Landscape for movie
        cfg_scale: 0.5,
        mode: 'pro', // Higher quality
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Animation] Kling API error:', errorText);
      throw new Error('Failed to create Kling animation task');
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      throw new Error('No task ID returned from Kling');
    }

    console.log(`[Animation] Kling task created: ${taskId}`);

    // Poll for completion (up to 10 minutes for longer clips)
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes with 5-second intervals

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.klingai.com/v1/videos/image2video/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data?.task_status;

        if (status === 'succeed') {
          videoUrl = statusData.data?.task_result?.videos?.[0]?.url;
          console.log('[Animation] Kling animation complete!');
        } else if (status === 'failed') {
          throw new Error('Kling animation failed');
        } else {
          console.log(`[Animation] Kling status: ${status} (attempt ${attempts + 1})`);
        }
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Kling animation timed out');
    }

    return videoUrl;
  } catch (error) {
    console.error('[Animation] Kling error:', error);
    throw error;
  }
}

// ========================================
// Runway Animation
// ========================================

async function animateWithRunway(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error('Runway API key not configured');
  }

  console.log('[Animation] Starting Runway animation...');

  try {
    const createResponse = await fetch('https://api.runwayml.com/v1/image-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptImage: imageUrl,
        promptText: prompt,
        duration: Math.min(duration, 10), // Runway max is 10s
        ratio: '16:9',
        watermark: false,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[Animation] Runway API error:', errorText);
      throw new Error('Failed to create Runway animation task');
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    if (!taskId) {
      throw new Error('No task ID returned from Runway');
    }

    console.log(`[Animation] Runway task created: ${taskId}`);

    // Poll for completion
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 120;

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await fetch(
        `https://api.runwayml.com/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Runway-Version': '2024-11-06',
          },
        }
      );

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();

        if (statusData.status === 'SUCCEEDED') {
          videoUrl = statusData.output?.[0];
          console.log('[Animation] Runway animation complete!');
        } else if (statusData.status === 'FAILED') {
          throw new Error('Runway animation failed');
        } else {
          console.log(`[Animation] Runway status: ${statusData.status} (attempt ${attempts + 1})`);
        }
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Runway animation timed out');
    }

    return videoUrl;
  } catch (error) {
    console.error('[Animation] Runway error:', error);
    throw error;
  }
}

// ========================================
// Replicate Animation (Fallback)
// Using Stable Video Diffusion
// ========================================

async function animateWithReplicate(
  imageUrl: string,
  prompt: string,
  duration: number = 4
): Promise<string> {
  const Replicate = (await import('replicate')).default;
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  });

  console.log('[Animation] Starting Replicate SVD animation...');

  try {
    const output = await replicateWithRetry(
      async () => {
        return await replicate.run(
          'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
          {
            input: {
              input_image: imageUrl,
              motion_bucket_id: 127,
              cond_aug: 0.02,
              decoding_t: 7,
              fps: 8,
              frames: duration * 8,
            },
          }
        );
      },
      {
        onRetry: (attempt) => {
          console.log(`[Animation] Replicate SVD retry ${attempt}...`);
        },
      }
    );

    console.log('[Animation] Replicate SVD output type:', typeof output);
    console.log('[Animation] Replicate SVD output:', output);

    // Handle different output formats
    let videoUrl: string | null = null;

    if (typeof output === 'string') {
      console.log('[Animation] Replicate SVD complete (string)!');
      videoUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      console.log('[Animation] Replicate SVD complete (array)!');
      videoUrl = output[0];
    } else if (output && typeof output === 'object') {
      // Check if it's a ReadableStream first - this is the most common case
      const isStream = output.constructor && output.constructor.name === 'ReadableStream';

      if (isStream) {
        console.log('[Animation] Replicate SVD returned ReadableStream, consuming...');
        // For Replicate's streaming API using Web Streams API
        const reader = (output as any).getReader();
        const chunks: any[] = [];

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            console.log('[Animation] Stream chunk:', value);
            chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }

        console.log('[Animation] Total chunks:', chunks.length);

        // The stream should yield the URL or the final result
        if (chunks.length > 0) {
          const lastChunk = chunks[chunks.length - 1];
          console.log('[Animation] Last chunk type:', typeof lastChunk);
          console.log('[Animation] Last chunk:', lastChunk);

          if (typeof lastChunk === 'string') {
            videoUrl = lastChunk;
          } else if (lastChunk && typeof lastChunk === 'object' && 'output' in lastChunk) {
            videoUrl = lastChunk.output;
          } else if (Array.isArray(lastChunk)) {
            videoUrl = lastChunk[0];
          }
        }
        console.log('[Animation] Stream consumed, videoUrl:', videoUrl);
      } else if ('url' in output && typeof (output as any).url === 'string') {
        // Only use url property if it's actually a string, not a method
        console.log('[Animation] Replicate SVD complete (object with url property)!');
        videoUrl = (output as any).url;
      }
    }

    if (!videoUrl) {
      throw new Error(`No valid output from Replicate SVD. Got: ${JSON.stringify(output)}`);
    }

    return videoUrl;
  } catch (error) {
    console.error('[Animation] Replicate error:', error);
    throw error;
  }
}

// ========================================
// Main Animation Function with Fallback
// PRIORITY: FREE (Replicate SVD) -> PAID (Kling/Runway)
// ========================================

/**
 * Animate a single scene with automatic provider fallback
 * FREE models are prioritized to reduce costs
 */
export async function animateScene(
  input: AnimationInput,
  storyId: string
): Promise<AnimationClip | null> {
  const { imageUrl, sceneType, styleId, storyContext, duration = 5 } = input;
  const prompt = generateAnimationPrompt(sceneType, styleId, storyContext);

  console.log(`[Animation] Animating ${sceneType} scene...`);

  let videoUrl: string;
  let provider: 'kling' | 'runway' | 'replicate';

  // PRIORITY: FREE (Replicate) -> PAID (Kling/Runway)
  // Replicate SVD has generous free tier
  try {
    if (process.env.REPLICATE_API_TOKEN) {
      // PRIMARY (FREE): Replicate Stable Video Diffusion
      console.log('[Animation] Using Replicate SVD (free tier)...');
      videoUrl = await animateWithReplicate(imageUrl, prompt, Math.min(duration, 4));
      provider = 'replicate';
    } else if (process.env.KLING_API_KEY) {
      // FALLBACK 1 (PAID): Kling AI
      console.log('[Animation] Using Kling AI (paid)...');
      videoUrl = await animateWithKling(imageUrl, prompt, duration);
      provider = 'kling';
    } else if (process.env.RUNWAY_API_KEY) {
      // FALLBACK 2 (PAID): Runway
      console.log('[Animation] Using Runway (paid)...');
      videoUrl = await animateWithRunway(imageUrl, prompt, duration);
      provider = 'runway';
    } else {
      throw new Error('No animation API configured');
    }
  } catch (primaryError) {
    console.warn(`[Animation] Primary provider failed:`, primaryError);

    // Try paid fallbacks if free failed
    try {
      if (process.env.KLING_API_KEY) {
        console.log('[Animation] Falling back to Kling AI (paid)...');
        videoUrl = await animateWithKling(imageUrl, prompt, duration);
        provider = 'kling';
      } else if (process.env.RUNWAY_API_KEY) {
        console.log('[Animation] Falling back to Runway (paid)...');
        videoUrl = await animateWithRunway(imageUrl, prompt, duration);
        provider = 'runway';
      } else {
        throw new Error('All animation providers failed');
      }
    } catch (fallbackError) {
      console.error(`[Animation] All providers failed for ${sceneType}:`, fallbackError);
      return null;
    }
  }

  // Upload to Supabase
  const storedUrl = await uploadAnimationClip(videoUrl, storyId, sceneType);

  const clipId = `clip_${storyId}_${sceneType}_${Date.now()}`;

  return {
    clipId,
    sceneType,
    videoUrl: storedUrl,
    duration,
    provider,
  };
}

/**
 * Animate all scenes for a story
 */
export async function animateAllScenes(
  inputs: AnimationInput[],
  storyId: string,
  onProgress?: (progress: number, message: string) => Promise<void>
): Promise<AnimationResult> {
  const startTime = Date.now();
  const clips: AnimationClip[] = [];

  console.log(`[Animation] Animating ${inputs.length} scenes for story ${storyId}`);

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const progressPercent = Math.round((i / inputs.length) * 100);

    await onProgress?.(progressPercent, `Animating scene ${i + 1}/${inputs.length}...`);

    const clip = await animateScene(input, storyId);
    if (clip) {
      clips.push(clip);
    }

    // Delay between scenes to respect rate limits and avoid 429 errors
    if (i < inputs.length - 1) {
      console.log('[Animation] Waiting 2s before next scene to avoid rate limits...');
      await delayBetweenRequests(2000);
    }
  }

  const generationTimeMs = Date.now() - startTime;
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  console.log(`[Animation] Generated ${clips.length}/${inputs.length} clips in ${generationTimeMs}ms`);

  return {
    success: clips.length > 0,
    clips,
    totalDuration,
    generationTimeMs,
    error: clips.length === 0 ? 'No clips could be generated' : undefined,
  };
}

// ========================================
// Storage
// ========================================

async function uploadAnimationClip(
  videoUrl: string,
  storyId: string,
  sceneType: SceneType
): Promise<string> {
  try {
    const response = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await response.arrayBuffer());

    const path = `clips/${storyId}/${sceneType}.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(path, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error(`[Animation] Upload failed for ${sceneType}:`, error);
      return videoUrl;
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error(`[Animation] Upload error for ${sceneType}:`, error);
    return videoUrl;
  }
}

// ========================================
// Quick Animation (Single Avatar)
// For animating talking head with lip sync
// ========================================

/**
 * Animate a single avatar (for talking head / lip sync prep)
 * PRIORITY: FREE (Replicate) -> PAID (Kling/Runway)
 */
export async function animateAvatar(
  avatarUrl: string,
  motionPrompt: string,
  storyId: string,
  duration: number = 5
): Promise<string | null> {
  console.log('[Animation] Animating avatar for talking head...');

  try {
    let videoUrl: string;

    // PRIORITY: FREE first
    if (process.env.REPLICATE_API_TOKEN) {
      console.log('[Animation] Avatar: Using Replicate SVD (free)...');
      videoUrl = await animateWithReplicate(avatarUrl, motionPrompt, Math.min(duration, 4));
    } else if (process.env.KLING_API_KEY) {
      console.log('[Animation] Avatar: Using Kling AI (paid)...');
      videoUrl = await animateWithKling(avatarUrl, motionPrompt, duration);
    } else if (process.env.RUNWAY_API_KEY) {
      console.log('[Animation] Avatar: Using Runway (paid)...');
      videoUrl = await animateWithRunway(avatarUrl, motionPrompt, duration);
    } else {
      throw new Error('No animation API configured');
    }

    // Upload to storage
    const response = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await response.arrayBuffer());
    const path = `avatars/${storyId}/animated_avatar.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(path, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      return videoUrl;
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('[Animation] Avatar animation failed:', error);
    return null;
  }
}
