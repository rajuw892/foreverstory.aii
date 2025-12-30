// ========================================
// Avatar Generator Service
// Transforms couple photos into stylized animated characters
// ========================================

import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import { CinematicStyleId, Avatar, FaceData, AvatarGenerationResult } from '@/types';
import {
  getAvatarStyleConfig,
  INSTANT_ID_MODEL,
  IP_ADAPTER_MODEL,
  FACE_TO_MANY_MODEL,
  AVATAR_STYLE_CONFIGS,
} from '@/config/avatar-prompts';

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
// Face Detection & Extraction
// ========================================

/**
 * Detect faces in an image
 * For MVP, we use the full image as the face region
 * Future: Integrate proper face detection API
 */
export async function detectFaces(imageUrl: string): Promise<FaceData[]> {
  try {
    const faceId = `face_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // For MVP: Use the entire image as face region
    // The AI models handle face detection internally
    return [
      {
        faceId,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 },
        confidence: 0.95,
        croppedImageUrl: imageUrl,
      },
    ];
  } catch (error) {
    console.error('[Avatar] Face detection error:', error);
    // Fallback: use the entire image
    return [
      {
        faceId: `face_fallback_${Date.now()}`,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 },
        confidence: 0.5,
        croppedImageUrl: imageUrl,
      },
    ];
  }
}

// ========================================
// Avatar Generation with InstantID (Primary)
// ========================================

/**
 * Generate stylized avatar using InstantID model
 * Best for identity preservation with style transfer
 */
export async function generateAvatarWithInstantID(
  faceImageUrl: string,
  styleId: CinematicStyleId,
  options?: {
    pose?: string;
    expression?: string;
    additionalPrompt?: string;
  }
): Promise<string> {
  const styleConfig = getAvatarStyleConfig(styleId);

  // Build the full prompt with optional additions
  let fullPrompt = styleConfig.avatarPrompt;
  if (options?.pose) fullPrompt += `, ${options.pose}`;
  if (options?.expression) fullPrompt += `, ${options.expression}`;
  if (options?.additionalPrompt) fullPrompt += `, ${options.additionalPrompt}`;

  console.log(`[Avatar] InstantID generating for style: ${styleId}`);

  try {
    const output = await replicate.run(INSTANT_ID_MODEL, {
      input: {
        image: faceImageUrl,
        prompt: fullPrompt,
        negative_prompt: styleConfig.negativePrompt,
        ip_adapter_scale: styleConfig.settings.identityStrength,
        controlnet_conditioning_scale: styleConfig.settings.styleStrength,
        guidance_scale: styleConfig.settings.guidanceScale,
        num_inference_steps: styleConfig.settings.numInferenceSteps,
        width: 512,
        height: 512,
        scheduler: 'EulerDiscreteScheduler',
      },
    });

    if (Array.isArray(output) && output.length > 0) {
      console.log('[Avatar] InstantID generation successful');
      return output[0] as string;
    }

    throw new Error('No output from InstantID model');
  } catch (error) {
    console.error('[Avatar] InstantID generation error:', error);
    throw error;
  }
}

// ========================================
// Avatar Generation with IP-Adapter (Fallback 1)
// ========================================

/**
 * Generate stylized avatar using IP-Adapter FaceID
 * Fallback when InstantID fails
 */
export async function generateAvatarWithIPAdapter(
  faceImageUrl: string,
  styleId: CinematicStyleId
): Promise<string> {
  const styleConfig = getAvatarStyleConfig(styleId);

  console.log(`[Avatar] IP-Adapter fallback for style: ${styleId}`);

  try {
    const output = await replicate.run(IP_ADAPTER_MODEL, {
      input: {
        image: faceImageUrl,
        prompt: styleConfig.avatarPrompt,
        negative_prompt: styleConfig.negativePrompt,
        scale: styleConfig.settings.styleStrength,
        num_inference_steps: styleConfig.settings.numInferenceSteps,
        guidance_scale: styleConfig.settings.guidanceScale,
      },
    });

    if (Array.isArray(output) && output.length > 0) {
      console.log('[Avatar] IP-Adapter generation successful');
      return output[0] as string;
    }

    throw new Error('No output from IP-Adapter model');
  } catch (error) {
    console.error('[Avatar] IP-Adapter generation error:', error);
    throw error;
  }
}

// ========================================
// Avatar Generation with Face-to-Many (Fallback 2)
// ========================================

/**
 * Generate stylized avatar using Face-to-Many
 * Last resort fallback with simpler style transfer
 */
export async function generateAvatarWithFaceToMany(
  faceImageUrl: string,
  styleId: CinematicStyleId
): Promise<string> {
  const styleConfig = getAvatarStyleConfig(styleId);

  // Map our styles to face-to-many style options
  const styleMapping: Record<string, string> = {
    ghibli_cherry_blossoms: 'anime',
    howls_castle_night: 'anime',
    disney_castle_fireworks: 'disney',
    tangled_lanterns: 'disney',
    pixar_up_balloons: 'pixar',
    frozen_aurora: 'disney',
    toy_story_clouds: 'pixar',
    shrek_swamp_sunset: 'pixar',
  };

  const faceToManyStyle = styleMapping[styleId] || 'cartoon';

  console.log(`[Avatar] Face-to-Many fallback for style: ${styleId} -> ${faceToManyStyle}`);

  try {
    const output = await replicate.run(FACE_TO_MANY_MODEL, {
      input: {
        image: faceImageUrl,
        style: faceToManyStyle,
        prompt: styleConfig.avatarPrompt,
        negative_prompt: styleConfig.negativePrompt,
        instant_id_strength: styleConfig.settings.identityStrength,
      },
    });

    if (Array.isArray(output) && output.length > 0) {
      console.log('[Avatar] Face-to-Many generation successful');
      return output[0] as string;
    }

    throw new Error('No output from Face-to-Many model');
  } catch (error) {
    console.error('[Avatar] Face-to-Many generation error:', error);
    throw error;
  }
}

// ========================================
// Main Avatar Generation Function
// ========================================

/**
 * Generate a single avatar with automatic fallback chain
 * InstantID -> IP-Adapter -> Face-to-Many -> Original Photo
 */
export async function generateAvatar(
  photoUrl: string,
  styleId: CinematicStyleId,
  storyId: string,
  personIndex: number = 0
): Promise<Avatar | null> {
  const startTime = Date.now();

  console.log(
    `[Avatar] Starting generation for story ${storyId}, person ${personIndex}, style ${styleId}`
  );

  try {
    // Step 1: Detect and extract face
    const faces = await detectFaces(photoUrl);
    if (faces.length === 0) {
      console.error('[Avatar] No faces detected in photo');
      return null;
    }

    const primaryFace = faces[0];
    console.log(`[Avatar] Face detected with confidence ${primaryFace.confidence}`);

    // Step 2: Generate stylized avatar with fallback chain
    // PRIORITY: FREE models first (Face-to-Many), then paid models as fallback
    let stylizedAvatarUrl: string;
    let modelUsed = 'face-to-many';

    try {
      // PRIMARY (FREE): Face-to-Many - Best free option for stylized avatars
      stylizedAvatarUrl = await generateAvatarWithFaceToMany(
        primaryFace.croppedImageUrl,
        styleId
      );
    } catch (faceToManyError) {
      console.warn('[Avatar] Face-to-Many failed, trying InstantID (paid):', faceToManyError);
      modelUsed = 'instant-id';

      try {
        // FALLBACK 1 (PAID): InstantID - Higher quality but costs more
        stylizedAvatarUrl = await generateAvatarWithInstantID(
          primaryFace.croppedImageUrl,
          styleId,
          { expression: 'romantic, loving expression' }
        );
      } catch (instantIdError) {
        console.warn('[Avatar] InstantID failed, trying IP-Adapter (paid):', instantIdError);
        modelUsed = 'ip-adapter';

        try {
          // FALLBACK 2 (PAID): IP-Adapter
          stylizedAvatarUrl = await generateAvatarWithIPAdapter(
            primaryFace.croppedImageUrl,
            styleId
          );
        } catch (ipAdapterError) {
          console.warn('[Avatar] All AI models failed, using original photo:', ipAdapterError);
          modelUsed = 'original';
          stylizedAvatarUrl = photoUrl;
        }
      }
    }

    console.log(`[Avatar] Generated avatar using ${modelUsed}`);

    // Step 3: Upload to Supabase Storage (if not using original)
    let finalAvatarUrl = stylizedAvatarUrl;

    if (modelUsed !== 'original' && stylizedAvatarUrl.startsWith('http')) {
      try {
        const avatarPath = `avatars/${storyId}/person${personIndex}_${styleId}.png`;

        // Download the generated image
        const imageResponse = await fetch(stylizedAvatarUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(avatarPath, imageBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          console.error('[Avatar] Upload error:', uploadError);
          // Continue with the original URL from Replicate
        } else {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(avatarPath);
          finalAvatarUrl = urlData.publicUrl;
        }
      } catch (uploadErr) {
        console.error('[Avatar] Failed to upload to Supabase:', uploadErr);
        // Continue with the original URL from Replicate
      }
    }

    const generationTimeMs = Date.now() - startTime;
    console.log(`[Avatar] Generation complete in ${generationTimeMs}ms`);

    // Step 4: Create avatar record
    const avatar: Avatar = {
      id: `avatar_${storyId}_${personIndex}_${Date.now()}`,
      storyId,
      personIndex,
      sourcePhotoUrl: photoUrl,
      croppedFaceUrl: primaryFace.croppedImageUrl,
      stylizedAvatarUrls: { [styleId]: finalAvatarUrl },
      createdAt: new Date().toISOString(),
    };

    return avatar;
  } catch (error) {
    console.error('[Avatar] Generation failed:', error);
    return null;
  }
}

// ========================================
// Batch Avatar Generation for Story
// ========================================

/**
 * Generate avatars for multiple photos in a story
 * Processes photos in parallel for better performance
 */
export async function generateAvatarsForStory(
  photoUrls: string[],
  styleId: CinematicStyleId,
  storyId: string
): Promise<AvatarGenerationResult> {
  const startTime = Date.now();
  const avatars: Avatar[] = [];
  let modelUsed = 'instant-id';

  console.log(
    `[Avatar] Generating avatars for ${photoUrls.length} photos, style: ${styleId}`
  );

  // Limit to first 2 photos (one per partner typically)
  const photosToProcess = photoUrls.slice(0, 2);

  // Process in parallel for speed
  const avatarPromises = photosToProcess.map((photoUrl, index) =>
    generateAvatar(photoUrl, styleId, storyId, index)
  );

  const results = await Promise.all(avatarPromises);

  for (const avatar of results) {
    if (avatar) {
      avatars.push(avatar);
    }
  }

  const generationTimeMs = Date.now() - startTime;

  console.log(
    `[Avatar] Batch generation complete: ${avatars.length}/${photosToProcess.length} avatars in ${generationTimeMs}ms`
  );

  return {
    success: avatars.length > 0,
    avatars,
    generationTimeMs,
    modelUsed,
    error: avatars.length === 0 ? 'No avatars could be generated' : undefined,
  };
}

// ========================================
// Generate Avatar in All 24 Styles
// ========================================

/**
 * Generate avatars for a single photo in all 24 cinematic styles
 * Useful for style preview or premium features
 */
export async function generateAvatarInAllStyles(
  photoUrl: string,
  storyId: string,
  personIndex: number = 0
): Promise<Partial<Record<CinematicStyleId, string>>> {
  const results: Partial<Record<CinematicStyleId, string>> = {};

  const styleIds = Object.keys(AVATAR_STYLE_CONFIGS) as CinematicStyleId[];

  console.log(`[Avatar] Generating avatar in all ${styleIds.length} styles`);

  // Process in batches to avoid rate limiting
  const batchSize = 4;
  for (let i = 0; i < styleIds.length; i += batchSize) {
    const batch = styleIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (styleId) => {
        try {
          const avatar = await generateAvatar(photoUrl, styleId, storyId, personIndex);
          if (avatar && avatar.stylizedAvatarUrls[styleId]) {
            results[styleId] = avatar.stylizedAvatarUrls[styleId];
          }
        } catch (error) {
          console.error(`[Avatar] Failed to generate for style ${styleId}:`, error);
        }
      })
    );

    // Small delay between batches to avoid rate limits
    if (i + batchSize < styleIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log(`[Avatar] All-styles generation complete: ${Object.keys(results).length}/${styleIds.length} successful`);

  return results;
}

// ========================================
// Cache Management
// ========================================

/**
 * Check if avatar exists in cache
 */
export async function getCachedAvatar(
  storyId: string,
  personIndex: number,
  styleId: CinematicStyleId
): Promise<string | null> {
  const avatarPath = `avatars/${storyId}/person${personIndex}_${styleId}.png`;

  const { data } = supabase.storage.from('photos').getPublicUrl(avatarPath);

  // Check if file exists by making a HEAD request
  try {
    const response = await fetch(data.publicUrl, { method: 'HEAD' });
    if (response.ok) {
      console.log(`[Avatar] Cache hit for ${storyId}/person${personIndex}/${styleId}`);
      return data.publicUrl;
    }
  } catch {
    // File doesn't exist
  }

  return null;
}

/**
 * Get avatar from cache or generate new one
 */
export async function getOrGenerateAvatar(
  photoUrl: string,
  styleId: CinematicStyleId,
  storyId: string,
  personIndex: number = 0
): Promise<string | null> {
  // Check cache first
  const cached = await getCachedAvatar(storyId, personIndex, styleId);
  if (cached) {
    return cached;
  }

  // Generate new avatar
  const avatar = await generateAvatar(photoUrl, styleId, storyId, personIndex);
  return avatar?.stylizedAvatarUrls[styleId] || null;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Get avatar URLs for all persons in a story
 */
export async function getStoryAvatars(
  storyId: string,
  styleId: CinematicStyleId
): Promise<string[]> {
  const avatarUrls: string[] = [];

  for (let i = 0; i < 2; i++) {
    const cached = await getCachedAvatar(storyId, i, styleId);
    if (cached) {
      avatarUrls.push(cached);
    }
  }

  return avatarUrls;
}

/**
 * Delete all avatars for a story (cleanup)
 */
export async function deleteStoryAvatars(storyId: string): Promise<void> {
  try {
    const { data: files } = await supabase.storage
      .from('photos')
      .list(`avatars/${storyId}`);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `avatars/${storyId}/${f.name}`);
      await supabase.storage.from('photos').remove(filePaths);
      console.log(`[Avatar] Deleted ${filePaths.length} avatars for story ${storyId}`);
    }
  } catch (error) {
    console.error(`[Avatar] Failed to delete avatars for story ${storyId}:`, error);
  }
}
