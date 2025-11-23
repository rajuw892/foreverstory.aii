// BullMQ Worker for Video Generation Pipeline
// This file should be run as a separate process: npx ts-node lib/queue/worker.ts

import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { generateScript } from '../ai/script-generator';
import { stylizeAllPhotos, generateAllSceneImages } from '../ai/image-generator';
import { generateVoiceover } from '../ai/voice-generator';
import { generateAllSceneVideos } from '../ai/video-generator';
import { StoryFormData, GeneratedScript } from '@/types';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface JobPayload {
  storyId: string;
  storyData: StoryFormData;
  photoUrls: string[];
}

// Update story status in Supabase
async function updateStoryStatus(
  storyId: string,
  status: string,
  progress: number,
  currentStep: string,
  additionalData?: Record<string, any>
) {
  const updateData: Record<string, any> = {
    status,
    progress,
    current_step: currentStep,
    updated_at: new Date().toISOString(),
    ...additionalData,
  };

  const { error } = await supabase
    .from('stories')
    .update(updateData)
    .eq('id', storyId);

  if (error) {
    console.error('Failed to update story status:', error);
  }
}

// Upload file to Supabase Storage
async function uploadToStorage(
  bucket: string,
  path: string,
  data: Buffer | ArrayBuffer,
  contentType: string
): Promise<string> {
  const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}

// Main processing pipeline
async function processStory(payload: JobPayload): Promise<void> {
  const { storyId, storyData, photoUrls } = payload;

  console.log(`Starting processing for story: ${storyId}`);

  try {
    // Step 1: Generate Script with Claude
    await updateStoryStatus(storyId, 'processing_script', 10, 'Writing your magical story...');

    const script = await generateScript(storyData);
    console.log(`Script generated: ${script.title}`);

    await supabase
      .from('stories')
      .update({ script })
      .eq('id', storyId);

    // Step 2: Stylize Photos
    await updateStoryStatus(storyId, 'generating_characters', 25, 'Creating your characters...');

    const stylizedPhotos = await stylizeAllPhotos(photoUrls, storyData.artStyle);
    console.log(`Stylized ${stylizedPhotos.length} photos`);

    await supabase
      .from('stories')
      .update({ character_images: stylizedPhotos })
      .eq('id', storyId);

    // Step 3: Generate Scene Images
    await updateStoryStatus(storyId, 'creating_scenes', 45, 'Drawing beautiful scenes...');

    const sceneImages = await generateAllSceneImages(
      script.scenes,
      storyData.artStyle,
      `romantic couple, ${storyData.coupleNames}`
    );
    console.log(`Generated ${sceneImages.length} scene images`);

    await supabase
      .from('stories')
      .update({ scene_images: sceneImages })
      .eq('id', storyId);

    // Step 4: Generate Scene Videos (optional - can skip for MVP)
    await updateStoryStatus(storyId, 'generating_video', 60, 'Bringing scenes to life...');

    // For MVP, we'll use images directly instead of generating videos
    // Uncomment below for full video generation:
    /*
    const scenePrompts = script.scenes.map(s => s.visualDescription);
    const sceneVideos = await generateAllSceneVideos(sceneImages, scenePrompts, 5);
    console.log(`Generated ${sceneVideos.length} scene videos`);

    await supabase
      .from('stories')
      .update({ scene_videos: sceneVideos })
      .eq('id', storyId);
    */

    // Step 5: Generate Voiceover
    await updateStoryStatus(storyId, 'adding_voice', 80, 'Adding emotional narration...');

    const voiceoverBuffer = await generateVoiceover(script.scenes, storyData.language);
    const voiceoverPath = `${storyId}/voiceover.mp3`;
    const voiceoverUrl = await uploadToStorage('audio', voiceoverPath, voiceoverBuffer, 'audio/mpeg');
    console.log(`Voiceover uploaded: ${voiceoverUrl}`);

    await supabase
      .from('stories')
      .update({ voiceover_url: voiceoverUrl })
      .eq('id', storyId);

    // Step 6: Compile Final Video
    await updateStoryStatus(storyId, 'compiling', 90, 'Final magical touches...');

    // For MVP: Create a simple video URL combining scenes
    // In production, use Remotion or FFmpeg for proper video compilation
    const videoUrl = await createSimpleVideo(storyId, sceneImages, voiceoverUrl, storyData.coupleNames);
    const watermarkedVideoUrl = videoUrl; // Same for now, add watermark in production

    // Step 7: Mark as Complete
    await updateStoryStatus(storyId, 'completed', 100, 'Your story is ready!', {
      video_url: videoUrl,
      watermarked_video_url: watermarkedVideoUrl,
    });

    console.log(`Story ${storyId} completed successfully!`);

  } catch (error) {
    console.error(`Error processing story ${storyId}:`, error);

    await updateStoryStatus(storyId, 'failed', 0, 'Something went wrong', {
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

// Simple video creation (placeholder - replace with Remotion in production)
async function createSimpleVideo(
  storyId: string,
  sceneImages: string[],
  voiceoverUrl: string,
  coupleNames: string
): Promise<string> {
  // For MVP: Return a placeholder or first scene image
  // In production, use Remotion Cloud Run for proper video rendering

  // Create a manifest file that can be used by a video player
  const videoManifest = {
    type: 'slideshow',
    scenes: sceneImages.map((url, index) => ({
      image: url,
      duration: 15,
      order: index,
    })),
    audio: voiceoverUrl,
    title: coupleNames,
    watermark: 'ForeverStory.ai',
  };

  const manifestPath = `${storyId}/manifest.json`;
  await uploadToStorage(
    'videos',
    manifestPath,
    Buffer.from(JSON.stringify(videoManifest)),
    'application/json'
  );

  // Return the first scene as video URL for now
  return sceneImages[0] || '';
}

// Worker loop
async function startWorker() {
  console.log('Video generation worker started');

  while (true) {
    try {
      // Pop job from Redis queue (blocking)
      const jobData = await redis.rpop('video_jobs');

      if (jobData) {
        const payload: JobPayload = typeof jobData === 'string'
          ? JSON.parse(jobData)
          : jobData as JobPayload;

        console.log(`Processing job for story: ${payload.storyId}`);

        // Update job status in Supabase
        await supabase
          .from('job_queue')
          .update({ status: 'processing', started_at: new Date().toISOString() })
          .eq('story_id', payload.storyId);

        await processStory(payload);

        // Mark job as completed
        await supabase
          .from('job_queue')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('story_id', payload.storyId);

      } else {
        // No jobs, wait before polling again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Worker error:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Export for testing or manual execution
export { processStory, startWorker };

// Start worker if running directly
if (require.main === module) {
  startWorker().catch(console.error);
}
