// ========================================
// Movie Composer Service
// Orchestrates all components into a complete animated short movie
// ========================================

import { createClient } from '@supabase/supabase-js';
import { CinematicStyleId } from '@/types';
import { generateAvatarsForStory } from './avatar-generator';
import { generateAllScenes, SceneImage, prepareScenesForAnimation } from './scene-generator';
import { animateAllScenes, AnimationClip, AnimationInput } from './clip-animator';
import { generateTalkingHeads, TalkingHeadClip } from './lip-sync';
import { getSceneSequence, SceneType } from '@/config/scene-prompts';

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

export interface MovieConfig {
  storyId: string;
  styleId: CinematicStyleId;
  photoUrls: string[];
  storyData: {
    partner1Name: string;
    partner2Name: string;
    howMet: string;
    firstDate: string;
    funnyMoment: string;
    loveMoment: string;
    adventure: string;
    futureDream: string;
  };
  narrationAudioUrl: string;
  musicUrl: string;
  targetDuration: number; // in seconds
}

export interface MovieResult {
  success: boolean;
  movieUrl: string;
  teaserUrl: string;
  duration: number;
  generationTimeMs: number;
  components: {
    avatars: string[];
    scenes: string[];
    animatedClips: string[];
    talkingHeads: string[];
  };
  error?: string;
}

export interface MovieProgress {
  phase: string;
  progress: number;
  message: string;
}

// ========================================
// Movie Composition Pipeline
// ========================================

/**
 * Main function to create a complete animated movie
 */
export async function createAnimatedMovie(
  config: MovieConfig,
  onProgress?: (progress: MovieProgress) => Promise<void>
): Promise<MovieResult> {
  const startTime = Date.now();
  const { storyId, styleId, photoUrls, storyData, narrationAudioUrl, musicUrl, targetDuration } = config;

  console.log(`\n========================================`);
  console.log(`[Movie] Starting animated movie creation for story ${storyId}`);
  console.log(`[Movie] Style: ${styleId}, Duration: ${targetDuration}s`);
  console.log(`========================================\n`);

  try {
    // ========================================
    // Phase 1: Generate Character Avatars
    // ========================================
    await onProgress?.({
      phase: 'avatars',
      progress: 5,
      message: 'Creating your animated characters...',
    });

    console.log('[Movie] Phase 1: Generating avatars...');
    const avatarResult = await generateAvatarsForStory(photoUrls, styleId, storyId);

    const avatarUrls = avatarResult.success
      ? avatarResult.avatars.map(a => a.stylizedAvatarUrls[styleId]).filter(Boolean) as string[]
      : photoUrls.slice(0, 2); // Fallback to original photos

    console.log(`[Movie] Avatars ready: ${avatarUrls.length}`);

    // ========================================
    // Phase 2: Generate Scene Backgrounds
    // ========================================
    await onProgress?.({
      phase: 'scenes',
      progress: 15,
      message: 'Creating beautiful scene backgrounds...',
    });

    console.log('[Movie] Phase 2: Generating scenes...');
    const sceneResult = await generateAllScenes(styleId, storyId, {
      howMet: storyData.howMet,
      firstDate: storyData.firstDate,
      funnyMoment: storyData.funnyMoment,
      loveMoment: storyData.loveMoment,
      adventure: storyData.adventure,
      futureDream: storyData.futureDream,
    });

    const sceneUrls = sceneResult.scenes.map(s => s.imageUrl);
    console.log(`[Movie] Scenes ready: ${sceneUrls.length}`);

    // ========================================
    // Phase 3: Generate Talking Head (Lip Sync)
    // ========================================
    await onProgress?.({
      phase: 'lipsync',
      progress: 30,
      message: 'Making your characters speak...',
    });

    console.log('[Movie] Phase 3: Generating talking heads...');
    const talkingHeads = await generateTalkingHeads(
      avatarUrls,
      narrationAudioUrl,
      storyId
    );

    const talkingHeadUrls = talkingHeads.map(t => t.videoUrl);
    console.log(`[Movie] Talking heads ready: ${talkingHeadUrls.length}`);

    // ========================================
    // Phase 4: Animate Scenes
    // ========================================
    await onProgress?.({
      phase: 'animation',
      progress: 45,
      message: 'Bringing scenes to life with animation...',
    });

    console.log('[Movie] Phase 4: Animating scenes...');

    // Prepare animation inputs
    const clipDuration = Math.floor(targetDuration / sceneResult.scenes.length);
    const animationInputs: AnimationInput[] = sceneResult.scenes.map(scene => ({
      imageUrl: scene.imageUrl,
      sceneType: scene.sceneType,
      styleId,
      storyContext: getStoryContext(scene.sceneType, storyData),
      duration: clipDuration,
    }));

    const animationResult = await animateAllScenes(
      animationInputs,
      storyId,
      async (progress, message) => {
        await onProgress?.({
          phase: 'animation',
          progress: 45 + Math.floor(progress * 0.3),
          message,
        });
      }
    );

    const animatedClipUrls = animationResult.clips.map(c => c.videoUrl);
    console.log(`[Movie] Animated clips ready: ${animatedClipUrls.length}`);

    // ========================================
    // Phase 5: Compose Final Movie
    // ========================================
    await onProgress?.({
      phase: 'composing',
      progress: 80,
      message: 'Composing your animated movie...',
    });

    console.log('[Movie] Phase 5: Composing final movie...');

    const movieUrl = await composeMovie({
      storyId,
      animatedClips: animationResult.clips,
      talkingHeads,
      narrationAudioUrl,
      musicUrl,
      targetDuration,
    });

    // ========================================
    // Phase 6: Create Teaser
    // ========================================
    await onProgress?.({
      phase: 'teaser',
      progress: 95,
      message: 'Creating movie teaser...',
    });

    console.log('[Movie] Phase 6: Creating teaser...');
    const teaserUrl = await createTeaser(movieUrl, storyId);

    // ========================================
    // Complete
    // ========================================
    const generationTimeMs = Date.now() - startTime;

    await onProgress?.({
      phase: 'complete',
      progress: 100,
      message: 'Your animated movie is ready!',
    });

    console.log(`\n========================================`);
    console.log(`[Movie] Movie creation complete!`);
    console.log(`[Movie] Duration: ${targetDuration}s`);
    console.log(`[Movie] Generation time: ${generationTimeMs}ms`);
    console.log(`========================================\n`);

    // Save to database
    await saveMovieData(storyId, {
      movieUrl,
      teaserUrl,
      avatarUrls,
      sceneUrls,
      animatedClipUrls,
      talkingHeadUrls,
    });

    return {
      success: true,
      movieUrl,
      teaserUrl,
      duration: targetDuration,
      generationTimeMs,
      components: {
        avatars: avatarUrls,
        scenes: sceneUrls,
        animatedClips: animatedClipUrls,
        talkingHeads: talkingHeadUrls,
      },
    };

  } catch (error) {
    console.error('[Movie] Creation failed:', error);

    return {
      success: false,
      movieUrl: '',
      teaserUrl: '',
      duration: 0,
      generationTimeMs: Date.now() - startTime,
      components: {
        avatars: [],
        scenes: [],
        animatedClips: [],
        talkingHeads: [],
      },
      error: error instanceof Error ? error.message : 'Movie creation failed',
    };
  }
}

// ========================================
// Movie Composition (FFmpeg)
// ========================================

interface ComposeConfig {
  storyId: string;
  animatedClips: AnimationClip[];
  talkingHeads: TalkingHeadClip[];
  narrationAudioUrl: string;
  musicUrl: string;
  targetDuration: number;
}

async function composeMovie(config: ComposeConfig): Promise<string> {
  console.log('[Movie] Composing movie with FFmpeg...');

  try {
    return await composeWithFFmpeg(config);
  } catch (error) {
    console.error('[Movie] Composition failed:', error);
    throw error;
  }
}

/**
 * Compose movie using FFmpeg (fallback)
 */
async function composeWithFFmpeg(config: ComposeConfig): Promise<string> {
  console.log('[Movie] Using FFmpeg for composition...');

  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  const { writeFile, readFile, unlink, mkdir } = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');

  const tempDir = path.join(os.tmpdir(), `movie_${config.storyId}`);
  await mkdir(tempDir, { recursive: true });

  try {
    // Download all clips
    const clipPaths: string[] = [];
    for (let i = 0; i < config.animatedClips.length; i++) {
      const clip = config.animatedClips[i];
      const clipPath = path.join(tempDir, `clip_${i}.mp4`);
      const response = await fetch(clip.videoUrl);
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(clipPath, buffer);
      clipPaths.push(clipPath);
    }

    // Download audio files
    const narrationPath = path.join(tempDir, 'narration.mp3');
    const musicPath = path.join(tempDir, 'music.mp3');

    const narrationResponse = await fetch(config.narrationAudioUrl);
    await writeFile(narrationPath, Buffer.from(await narrationResponse.arrayBuffer()));

    if (config.musicUrl) {
      const musicResponse = await fetch(config.musicUrl);
      await writeFile(musicPath, Buffer.from(await musicResponse.arrayBuffer()));
    }

    // Create concat file
    const concatFilePath = path.join(tempDir, 'concat.txt');
    const concatContent = clipPaths.map(p => `file '${p}'`).join('\n');
    await writeFile(concatFilePath, concatContent);

    // Concatenate videos
    const combinedVideoPath = path.join(tempDir, 'combined.mp4');
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${combinedVideoPath}"`,
      { timeout: 300000 }
    );

    // Mix audio (narration at 80%, music at 20%)
    const outputPath = path.join(tempDir, 'final.mp4');

    if (config.musicUrl) {
      await execAsync(
        `ffmpeg -i "${combinedVideoPath}" -i "${narrationPath}" -i "${musicPath}" ` +
        `-filter_complex "[1:a]volume=0.8[a1];[2:a]volume=0.2[a2];[a1][a2]amix=inputs=2:duration=first[aout]" ` +
        `-map 0:v -map "[aout]" -c:v libx264 -c:a aac -shortest "${outputPath}"`,
        { timeout: 300000 }
      );
    } else {
      await execAsync(
        `ffmpeg -i "${combinedVideoPath}" -i "${narrationPath}" ` +
        `-c:v libx264 -c:a aac -shortest "${outputPath}"`,
        { timeout: 300000 }
      );
    }

    // Upload to Supabase
    const videoBuffer = await readFile(outputPath);
    const storagePath = `movies/${config.storyId}/final.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(storagePath, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(storagePath);
    return data.publicUrl;

  } finally {
    // Cleanup temp directory
    const { rm } = await import('fs/promises');
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

// ========================================
// Teaser Creation
// ========================================

async function createTeaser(movieUrl: string, storyId: string): Promise<string> {
  console.log('[Movie] Creating teaser (first 30 seconds)...');

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, readFile, unlink } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const moviePath = path.join(tempDir, `movie_${storyId}.mp4`);
    const teaserPath = path.join(tempDir, `teaser_${storyId}.mp4`);

    // Download movie
    const response = await fetch(movieUrl);
    await writeFile(moviePath, Buffer.from(await response.arrayBuffer()));

    // Extract first 30 seconds with fade out
    await execAsync(
      `ffmpeg -i "${moviePath}" -t 30 ` +
      `-vf "fade=t=out:st=28:d=2,drawtext=text='Watch Full Movie':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(t,25)'" ` +
      `-af "afade=t=out:st=28:d=2" ` +
      `-c:v libx264 -c:a aac "${teaserPath}"`,
      { timeout: 120000 }
    );

    // Upload teaser
    const teaserBuffer = await readFile(teaserPath);
    const storagePath = `movies/${storyId}/teaser.mp4`;

    const { error } = await supabase.storage
      .from('videos')
      .upload(storagePath, teaserBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    // Cleanup
    await Promise.all([
      unlink(moviePath).catch(() => {}),
      unlink(teaserPath).catch(() => {}),
    ]);

    if (error) {
      console.error('[Movie] Teaser upload failed:', error);
      return movieUrl; // Fallback to full movie
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(storagePath);
    return data.publicUrl;

  } catch (error) {
    console.error('[Movie] Teaser creation failed:', error);
    return movieUrl; // Fallback
  }
}

// ========================================
// Helper Functions
// ========================================

function getStoryContext(sceneType: SceneType, storyData: any): string {
  const contexts: Record<SceneType, string> = {
    opening: 'romantic love story beginning',
    meeting: storyData.howMet || 'couple meeting for the first time',
    first_date: storyData.firstDate || 'romantic first date',
    funny_moment: storyData.funnyMoment || 'couple laughing together',
    love_moment: storyData.loveMoment || 'moment of realizing love',
    adventure: storyData.adventure || 'couple on an adventure',
    future_dream: storyData.futureDream || 'dreaming of future together',
    closing: 'happily ever after, forever love',
  };

  return contexts[sceneType];
}

async function saveMovieData(
  storyId: string,
  data: {
    movieUrl: string;
    teaserUrl: string;
    avatarUrls: string[];
    sceneUrls: string[];
    animatedClipUrls: string[];
    talkingHeadUrls: string[];
  }
): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .update({
      deluxe_video_url: data.movieUrl,
      teaser_url: data.teaserUrl,
      character_images: data.avatarUrls,
      scene_images: data.sceneUrls,
      scene_videos: data.animatedClipUrls,
      movie_data: JSON.stringify({
        talkingHeads: data.talkingHeadUrls,
        animatedClips: data.animatedClipUrls,
        generatedAt: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', storyId);

  if (error) {
    console.error('[Movie] Failed to save movie data:', error);
  }
}

// ========================================
// Quick Movie Generation
// Simplified version for faster results
// ========================================

/**
 * Quick animated movie (uses fewer animations, faster generation)
 */
export async function createQuickMovie(
  config: MovieConfig,
  onProgress?: (progress: MovieProgress) => Promise<void>
): Promise<MovieResult> {
  // Use only 4 key scenes instead of 8
  const quickConfig = {
    ...config,
    // Will generate fewer scenes/animations for speed
  };

  return createAnimatedMovie(quickConfig, onProgress);
}
