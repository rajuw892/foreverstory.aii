// ========================================
// Lip Sync Service
// Makes avatars speak using SadTalker/Wav2Lip
// ========================================

import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';

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
// Types
// ========================================

export interface LipSyncInput {
  faceImageUrl: string;    // Avatar/face image
  audioUrl: string;        // Narration audio
  enhanceQuality?: boolean;
}

export interface LipSyncResult {
  success: boolean;
  videoUrl: string;
  duration: number;
  provider: 'sadtalker' | 'wav2lip' | 'hedra';
  generationTimeMs: number;
  error?: string;
}

export interface TalkingHeadClip {
  clipId: string;
  personIndex: number;
  videoUrl: string;
  audioUrl: string;
  duration: number;
}

// ========================================
// Model Configuration (ALL FREE-TIER FRIENDLY)
// ========================================

type ReplicateModel = `${string}/${string}:${string}`;

// PRIMARY (FREE): SadTalker - Best for realistic talking heads, has free tier
const SADTALKER_MODEL: ReplicateModel =
  'cjwbw/sadtalker:3aa3dac9353cc4d6bd62a8f95957bd844003b401ca4e4a9b33baa574c549d376';

// SECONDARY (FREE): Wav2Lip - Good for lip sync on existing videos, has free tier
const WAV2LIP_MODEL: ReplicateModel =
  'devxpy/wav2lip:8d65e3f4f4298520e079198b493c25adfc43c058ffec924f2aefc8010ed25eef';

// ========================================
// SadTalker Lip Sync
// ========================================

/**
 * Generate talking head video using SadTalker
 * Best for high-quality lip sync on static images
 */
export async function generateWithSadTalker(
  input: LipSyncInput
): Promise<LipSyncResult> {
  const startTime = Date.now();

  console.log('[LipSync] Starting SadTalker generation...');

  try {
    const output = await replicate.run(SADTALKER_MODEL, {
      input: {
        source_image: input.faceImageUrl,
        driven_audio: input.audioUrl,
        enhancer: input.enhanceQuality ? 'gfpgan' : undefined,
        preprocess: 'crop', // Crop to face for better results
        still_mode: false,  // Allow head movement
        use_ref_video: false,
        pose_style: 0,      // Natural pose
        batch_size: 2,
        expression_scale: 1.0,
        input_yaw: null,
        input_pitch: null,
        input_roll: null,
      },
    });

    const generationTimeMs = Date.now() - startTime;

    if (output && typeof output === 'string') {
      console.log(`[LipSync] SadTalker complete in ${generationTimeMs}ms`);

      return {
        success: true,
        videoUrl: output,
        duration: 0, // Will be determined by audio length
        provider: 'sadtalker',
        generationTimeMs,
      };
    }

    throw new Error('No output from SadTalker');
  } catch (error) {
    console.error('[LipSync] SadTalker error:', error);
    throw error;
  }
}

// ========================================
// Wav2Lip Lip Sync
// ========================================

/**
 * Generate lip sync using Wav2Lip
 * Good for adding lip sync to existing videos
 */
export async function generateWithWav2Lip(
  videoUrl: string,
  audioUrl: string
): Promise<LipSyncResult> {
  const startTime = Date.now();

  console.log('[LipSync] Starting Wav2Lip generation...');

  try {
    const output = await replicate.run(WAV2LIP_MODEL, {
      input: {
        face: videoUrl,
        audio: audioUrl,
        fps: 25,
        pads: '0 10 0 0',
        smooth: true,
        resize_factor: 1,
      },
    });

    const generationTimeMs = Date.now() - startTime;

    if (output && typeof output === 'string') {
      console.log(`[LipSync] Wav2Lip complete in ${generationTimeMs}ms`);

      return {
        success: true,
        videoUrl: output,
        duration: 0,
        provider: 'wav2lip',
        generationTimeMs,
      };
    }

    throw new Error('No output from Wav2Lip');
  } catch (error) {
    console.error('[LipSync] Wav2Lip error:', error);
    throw error;
  }
}

// ========================================
// Main Lip Sync Function
// ========================================

/**
 * Generate talking head with automatic provider selection
 */
export async function generateTalkingHead(
  avatarImageUrl: string,
  narrationAudioUrl: string,
  storyId: string,
  personIndex: number = 0
): Promise<TalkingHeadClip | null> {
  console.log(`[LipSync] Generating talking head for person ${personIndex}...`);

  try {
    // Use SadTalker as primary (best for static images)
    const result = await generateWithSadTalker({
      faceImageUrl: avatarImageUrl,
      audioUrl: narrationAudioUrl,
      enhanceQuality: true,
    });

    if (!result.success) {
      throw new Error(result.error || 'Lip sync failed');
    }

    // Upload to Supabase
    const storedUrl = await uploadTalkingHead(result.videoUrl, storyId, personIndex);

    return {
      clipId: `talking_${storyId}_${personIndex}_${Date.now()}`,
      personIndex,
      videoUrl: storedUrl,
      audioUrl: narrationAudioUrl,
      duration: result.duration,
    };
  } catch (error) {
    console.error(`[LipSync] Failed for person ${personIndex}:`, error);
    return null;
  }
}

/**
 * Generate talking heads for both partners
 */
export async function generateTalkingHeads(
  avatarUrls: string[],
  narrationAudioUrl: string,
  storyId: string,
  narrationSegments?: { startTime: number; endTime: number; personIndex: number }[]
): Promise<TalkingHeadClip[]> {
  const clips: TalkingHeadClip[] = [];

  console.log(`[LipSync] Generating talking heads for ${avatarUrls.length} avatars`);

  // For MVP: Generate full talking head for each avatar with full narration
  // Future: Split narration by speaker and sync accordingly

  for (let i = 0; i < Math.min(avatarUrls.length, 2); i++) {
    const clip = await generateTalkingHead(
      avatarUrls[i],
      narrationAudioUrl,
      storyId,
      i
    );

    if (clip) {
      clips.push(clip);
    }
  }

  console.log(`[LipSync] Generated ${clips.length} talking head clips`);

  return clips;
}

// ========================================
// Segment-Based Lip Sync
// For alternating between speakers
// ========================================

export interface NarrationSegment {
  startTime: number;
  endTime: number;
  text: string;
  personIndex: number; // 0 = partner1, 1 = partner2, -1 = narrator
}

/**
 * Split narration into segments for multi-speaker support
 * Future enhancement: Use speaker diarization
 */
export function createNarrationSegments(
  narrationText: string,
  totalDuration: number
): NarrationSegment[] {
  // For MVP: Single narrator
  // Future: Analyze text for dialogue and assign speakers

  const segments: NarrationSegment[] = [
    {
      startTime: 0,
      endTime: totalDuration,
      text: narrationText,
      personIndex: -1, // Narrator
    },
  ];

  return segments;
}

/**
 * Generate lip sync for specific audio segment
 * Requires audio trimming which we'll handle in movie composer
 */
export async function generateSegmentLipSync(
  avatarUrl: string,
  audioSegmentUrl: string,
  storyId: string,
  segmentIndex: number
): Promise<TalkingHeadClip | null> {
  return await generateTalkingHead(
    avatarUrl,
    audioSegmentUrl,
    storyId,
    segmentIndex
  );
}

// ========================================
// Storage
// ========================================

async function uploadTalkingHead(
  videoUrl: string,
  storyId: string,
  personIndex: number
): Promise<string> {
  try {
    const response = await fetch(videoUrl);
    const videoBuffer = Buffer.from(await response.arrayBuffer());

    const path = `talking_heads/${storyId}/person${personIndex}.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(path, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error(`[LipSync] Upload failed:`, error);
      return videoUrl;
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error(`[LipSync] Upload error:`, error);
    return videoUrl;
  }
}

// ========================================
// Quality Enhancement
// ========================================

/**
 * Enhance face quality in talking head video
 */
export async function enhanceTalkingHead(
  videoUrl: string
): Promise<string> {
  console.log('[LipSync] Enhancing talking head quality...');

  try {
    // Use GFPGAN for face enhancement
    const output = await replicate.run(
      'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
      {
        input: {
          img: videoUrl,
          version: 'v1.4',
          scale: 2,
        },
      }
    );

    if (output && typeof output === 'string') {
      console.log('[LipSync] Enhancement complete');
      return output;
    }

    return videoUrl;
  } catch (error) {
    console.error('[LipSync] Enhancement failed:', error);
    return videoUrl;
  }
}

// ========================================
// Integration Helper
// ========================================

/**
 * Complete lip sync pipeline for a story
 * 1. Take avatar images
 * 2. Generate talking heads with narration
 * 3. Return clips ready for movie composition
 */
export async function processLipSyncForStory(
  avatarUrls: string[],
  narrationAudioUrl: string,
  storyId: string,
  onProgress?: (progress: number, message: string) => Promise<void>
): Promise<TalkingHeadClip[]> {
  await onProgress?.(0, 'Starting lip sync generation...');

  const clips = await generateTalkingHeads(avatarUrls, narrationAudioUrl, storyId);

  await onProgress?.(100, 'Lip sync complete!');

  return clips;
}
