// ========================================
// Scene Generator Service
// Creates animated backgrounds for story moments
// ========================================

import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import { CinematicStyleId } from '@/types';
import {
  SceneType,
  generateScenePrompt,
  getSceneNegativePrompt,
  getSceneSequence,
  getSceneMotionPrompt,
  SCENE_BASE_PROMPTS,
} from '@/config/scene-prompts';
import { replicateWithRetry, delayBetweenRequests } from './replicate-utils';

// ========================================
// Initialize Clients
// ========================================

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// Model Configuration (FREE-TIER PRIORITIZED)
// ========================================

type ReplicateModel = `${string}/${string}:${string}`;

// PRIMARY (FREE): SDXL Lightning 4-step - Fast, free-tier friendly
const SDXL_LIGHTNING_MODEL: ReplicateModel =
  'bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637';

// SECONDARY (FREE): Standard SDXL - Good quality, has free tier
const SDXL_MODEL: ReplicateModel =
  'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';

// FALLBACK (FREE): Stable Diffusion 2.1 - Older but reliable
const SD_21_MODEL: ReplicateModel =
  'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4';

// ========================================
// Scene Image Generation
// ========================================

export interface SceneImage {
  sceneType: SceneType;
  imageUrl: string;
  prompt: string;
  styleId: CinematicStyleId;
}

export interface SceneGenerationResult {
  success: boolean;
  scenes: SceneImage[];
  generationTimeMs: number;
  error?: string;
}

/**
 * Generate a single scene image
 * PRIORITY: FREE models (SDXL Lightning -> SDXL -> SD 2.1)
 */
export async function generateSceneImage(
  sceneType: SceneType,
  styleId: CinematicStyleId,
  storyContext?: string
): Promise<string> {
  const prompt = generateScenePrompt(sceneType, styleId, storyContext);
  const negativePrompt = getSceneNegativePrompt(styleId);

  console.log(`[Scene] Generating ${sceneType} scene for style: ${styleId}`);

  // PRIMARY (FREE): SDXL Lightning - Fast and free-tier friendly
  try {
    console.log('[Scene] Using SDXL Lightning (free, fast)...');

    const output = await replicateWithRetry(
      async () => {
        return await replicate.run(SDXL_LIGHTNING_MODEL, {
          input: {
            prompt,
            negative_prompt: negativePrompt,
            width: 1024,
            height: 576, // 16:9 aspect ratio
            num_outputs: 1,
            scheduler: 'K_EULER',
            num_inference_steps: 4, // Lightning only needs 4 steps!
          },
        });
      },
      {
        onRetry: (attempt) => {
          console.log(`[Scene] SDXL Lightning retry ${attempt} for ${sceneType}...`);
        },
      }
    );

    if (Array.isArray(output) && output.length > 0) {
      console.log(`[Scene] SDXL Lightning success for ${sceneType}`);
      return output[0] as string;
    }

    throw new Error('No output from SDXL Lightning');
  } catch (lightningError) {
    console.warn(`[Scene] SDXL Lightning failed, trying standard SDXL:`, lightningError);

    // SECONDARY (FREE): Standard SDXL
    try {
      const output = await replicate.run(SDXL_MODEL, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width: 1344,
          height: 768,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 25, // Reduced for cost savings
          scheduler: 'K_EULER',
        },
      });

      if (Array.isArray(output) && output.length > 0) {
        console.log(`[Scene] SDXL success for ${sceneType}`);
        return output[0] as string;
      }

      throw new Error('No output from SDXL model');
    } catch (sdxlError) {
      console.warn(`[Scene] SDXL failed, trying SD 2.1 fallback:`, sdxlError);

      // FALLBACK (FREE): SD 2.1
      try {
        const output = await replicate.run(SD_21_MODEL, {
          input: {
            prompt,
            negative_prompt: negativePrompt,
            width: 768,
            height: 512,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 25,
          },
        });

        if (Array.isArray(output) && output.length > 0) {
          console.log(`[Scene] SD 2.1 success for ${sceneType}`);
          return output[0] as string;
        }

        throw new Error('No output from SD 2.1 fallback');
      } catch (fallbackError) {
        console.error(`[Scene] All models failed for ${sceneType}:`, fallbackError);
        throw fallbackError;
      }
    }
  }
}

/**
 * Generate all scenes for a story
 */
export async function generateAllScenes(
  styleId: CinematicStyleId,
  storyId: string,
  storyData: {
    howMet?: string;
    firstDate?: string;
    funnyMoment?: string;
    loveMoment?: string;
    adventure?: string;
    futureDream?: string;
  }
): Promise<SceneGenerationResult> {
  const startTime = Date.now();
  const scenes: SceneImage[] = [];
  const sceneSequence = getSceneSequence();

  console.log(`[Scene] Generating ${sceneSequence.length} scenes for story ${storyId}`);

  // Map story data to scene contexts
  const sceneContexts: Record<SceneType, string | undefined> = {
    opening: 'romantic beginning of a love story',
    meeting: storyData.howMet,
    first_date: storyData.firstDate,
    funny_moment: storyData.funnyMoment,
    love_moment: storyData.loveMoment,
    adventure: storyData.adventure,
    future_dream: storyData.futureDream,
    closing: 'happily ever after, forever together',
  };

  // Generate scenes in batches of 2 for parallelism while respecting rate limits
  const batchSize = 2;
  for (let i = 0; i < sceneSequence.length; i += batchSize) {
    const batch = sceneSequence.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (sceneType) => {
        try {
          const imageUrl = await generateSceneImage(
            sceneType,
            styleId,
            sceneContexts[sceneType]
          );

          // Upload to Supabase
          const storedUrl = await uploadSceneImage(imageUrl, storyId, sceneType);

          return {
            sceneType,
            imageUrl: storedUrl,
            prompt: generateScenePrompt(sceneType, styleId, sceneContexts[sceneType]),
            styleId,
          };
        } catch (error) {
          console.error(`[Scene] Failed to generate ${sceneType}:`, error);
          return null;
        }
      })
    );

    // Add successful scenes
    for (const result of batchResults) {
      if (result) {
        scenes.push(result);
      }
    }

    // Delay between batches to avoid rate limiting
    if (i + batchSize < sceneSequence.length) {
      console.log('[Scene] Waiting 2s before next batch to avoid rate limits...');
      await delayBetweenRequests(2000);
    }
  }

  const generationTimeMs = Date.now() - startTime;

  console.log(
    `[Scene] Generated ${scenes.length}/${sceneSequence.length} scenes in ${generationTimeMs}ms`
  );

  return {
    success: scenes.length > 0,
    scenes,
    generationTimeMs,
    error: scenes.length === 0 ? 'No scenes could be generated' : undefined,
  };
}

/**
 * Upload scene image to Supabase storage
 */
async function uploadSceneImage(
  imageUrl: string,
  storyId: string,
  sceneType: SceneType
): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    const path = `scenes/${storyId}/${sceneType}.png`;

    const { error } = await supabase.storage
      .from('photos')
      .upload(path, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error(`[Scene] Upload failed for ${sceneType}:`, error);
      return imageUrl; // Return original URL if upload fails
    }

    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error(`[Scene] Upload error for ${sceneType}:`, error);
    return imageUrl;
  }
}

// ========================================
// Scene with Avatar Composition
// ========================================

export interface ComposedScene {
  sceneType: SceneType;
  backgroundUrl: string;
  avatarUrls: string[];
  composedImageUrl?: string;
  motionPrompt: string;
}

/**
 * Compose scene with avatars for animation
 * Returns data ready for Kling/Runway animation
 */
export async function composeSceneWithAvatars(
  sceneImage: SceneImage,
  avatarUrls: string[],
  storyId: string
): Promise<ComposedScene> {
  // For now, we'll pass scene and avatars separately to the animation pipeline
  // Future: Use image composition API to overlay avatars on scenes

  const motionPrompt = getSceneMotionPrompt(sceneImage.sceneType, sceneImage.styleId);

  return {
    sceneType: sceneImage.sceneType,
    backgroundUrl: sceneImage.imageUrl,
    avatarUrls,
    motionPrompt,
  };
}

/**
 * Prepare all scenes for animation
 */
export async function prepareScenesForAnimation(
  scenes: SceneImage[],
  avatarUrls: string[],
  storyId: string
): Promise<ComposedScene[]> {
  const composedScenes: ComposedScene[] = [];

  for (const scene of scenes) {
    const composed = await composeSceneWithAvatars(scene, avatarUrls, storyId);
    composedScenes.push(composed);
  }

  return composedScenes;
}

// ========================================
// Cache Management
// ========================================

/**
 * Get cached scene from storage
 */
export async function getCachedScene(
  storyId: string,
  sceneType: SceneType
): Promise<string | null> {
  const path = `scenes/${storyId}/${sceneType}.png`;
  const { data } = supabase.storage.from('photos').getPublicUrl(path);

  try {
    const response = await fetch(data.publicUrl, { method: 'HEAD' });
    if (response.ok) {
      return data.publicUrl;
    }
  } catch {
    // Scene doesn't exist
  }

  return null;
}

/**
 * Get or generate scene
 */
export async function getOrGenerateScene(
  sceneType: SceneType,
  styleId: CinematicStyleId,
  storyId: string,
  storyContext?: string
): Promise<string | null> {
  // Check cache first
  const cached = await getCachedScene(storyId, sceneType);
  if (cached) {
    console.log(`[Scene] Cache hit for ${storyId}/${sceneType}`);
    return cached;
  }

  // Generate new scene
  try {
    const imageUrl = await generateSceneImage(sceneType, styleId, storyContext);
    return await uploadSceneImage(imageUrl, storyId, sceneType);
  } catch (error) {
    console.error(`[Scene] Failed to generate ${sceneType}:`, error);
    return null;
  }
}
