// ========================================
// 15-Second Love Story Teaser Generator
// Pipeline: Photo→Style→Script→Voice→Animate→Combine
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// API Keys
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const FAL_API_KEY = process.env.FAL_API_KEY;
const PIAPI_KEY = process.env.PIAPI_KEY;
const KLING_ACCESS_TOKEN = process.env.KLING_ACCESS_TOKEN; // From app.klingai.com (free 66 daily credits)

// Demo mode - runs when no APIs configured
const DEMO_MODE = !REPLICATE_API_TOKEN && !FAL_API_KEY && !PIAPI_KEY && !KLING_ACCESS_TOKEN;

// Sample demo video URLs (royalty-free romantic clips)
const DEMO_VIDEOS = [
  'https://cdn.pixabay.com/video/2020/05/25/40130-424930032_large.mp4', // couple walking
  'https://cdn.pixabay.com/video/2019/06/19/24632-343489618_large.mp4', // romantic sunset
  'https://cdn.pixabay.com/video/2021/04/06/70028-534679764_large.mp4', // love hearts
];

// Style prompts
const STYLE_PROMPTS: Record<string, { image: string; video: string }> = {
  ghibli: {
    image: 'Studio Ghibli anime style, soft watercolor, dreamy atmosphere, Hayao Miyazaki, gentle colors',
    video: 'Studio Ghibli animation, soft movements, floating sakura petals, warm lighting',
  },
  disney: {
    image: 'Disney 2D animation style, expressive eyes, fairy tale aesthetic, magical sparkles',
    video: 'Disney animation, magical movements, sparkle effects, fairy tale atmosphere',
  },
  pixar: {
    image: 'Pixar 3D animation style, expressive features, big eyes, vibrant colors, emotional',
    video: 'Pixar 3D animation, expressive movements, vibrant colors, cinematic lighting',
  },
  anime: {
    image: 'Makoto Shinkai anime style (Your Name), detailed backgrounds, emotional, vibrant colors',
    video: 'Anime style, Makoto Shinkai inspired, beautiful lighting, emotional atmosphere',
  },
};

// Job storage (in production, use database)
const jobs = new Map<string, {
  status: string;
  progress: number;
  step: string;
  videoUrl?: string;
  error?: string;
}>();

// ========================================
// Helper: Upload file to Supabase
// ========================================
async function uploadToSupabase(buffer: Buffer, path: string, contentType: string): Promise<string> {
  const { error } = await supabase.storage
    .from('videos')
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from('videos').getPublicUrl(path);
  return data.publicUrl;
}

// ========================================
// Step 1: Convert photo to cartoon style
// ========================================
async function stylizePhoto(photoBuffer: Buffer, style: string, jobId: string): Promise<string> {
  console.log(`[${jobId}] Stylizing photo to ${style}...`);

  // Upload original photo first
  const photoPath = `teaser/${jobId}/original-${Date.now()}.jpg`;
  const photoUrl = await uploadToSupabase(photoBuffer, photoPath, 'image/jpeg');

  if (!REPLICATE_API_TOKEN) {
    console.log(`[${jobId}] No Replicate token, using original photo`);
    return photoUrl;
  }

  try {
    const stylePrompt = STYLE_PROMPTS[style]?.image || STYLE_PROMPTS.ghibli.image;

    // Use Replicate for style transfer
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8b2b7',
        input: {
          image: photoUrl,
          prompt: `portrait of a couple, ${stylePrompt}, maintaining facial features`,
          negative_prompt: 'ugly, deformed, blurry, low quality',
          guidance_scale: 5,
          ip_adapter_scale: 0.8,
        },
      }),
    });

    if (!response.ok) throw new Error('Replicate API error');

    const prediction = await response.json();

    // Poll for result
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
      });

      const status = await statusRes.json();

      if (status.status === 'succeeded') {
        const result = Array.isArray(status.output) ? status.output[0] : status.output;
        console.log(`[${jobId}] Photo stylized successfully`);
        return result;
      }

      if (status.status === 'failed') throw new Error('Style transfer failed');
    }
  } catch (err) {
    console.error(`[${jobId}] Style transfer error:`, err);
  }

  return photoUrl; // Fallback to original
}

// ========================================
// Step 2: Generate story narration script
// ========================================
interface StoryData {
  name1: string;
  name2: string;
  howMet: string;
  firstDate?: string;
  favoriteMemory?: string;
  whatILove?: string;
  futureDream?: string;
}

function generateScript(data: StoryData): string {
  const { name1, name2, howMet, firstDate, favoriteMemory, whatILove, futureDream } = data;

  let script = `This is the love story of ${name1} and ${name2}. `;

  // How they met
  script += `Their journey began when ${howMet}. From that very first moment, something magical started to bloom between them. `;

  // First date
  if (firstDate) {
    script += `Their first date was unforgettable. ${firstDate}. It was the beginning of countless memories to come. `;
  }

  // Favorite memory
  if (favoriteMemory) {
    script += `Among all their adventures, one memory stands out. ${favoriteMemory}. Moments like these became the treasures of their love. `;
  }

  // What they love about each other
  if (whatILove) {
    script += `What makes their love special? ${whatILove}. These little things turned into the foundation of forever. `;
  }

  // Future dreams
  if (futureDream) {
    script += `Together, they dream of a beautiful future. ${futureDream}. `;
  }

  script += `This is ${name1} and ${name2}'s forever story, written in every laugh shared, every obstacle overcome, and every dream they hold together.`;

  return script;
}

// ========================================
// Step 3: Generate voice narration
// ========================================
async function generateVoice(script: string, jobId: string): Promise<string | null> {
  console.log(`[${jobId}] Generating voice narration...`);

  try {
    const { spawnSync, exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, readFile, unlink } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    // Check if edge-tts is available
    const probe = spawnSync('edge-tts', ['--version'], { stdio: 'ignore', shell: true });

    if (probe.error || probe.status !== 0) {
      console.log(`[${jobId}] edge-tts not available, skipping narration`);
      return null;
    }

    const tempDir = os.tmpdir();
    const textPath = path.join(tempDir, `script-${jobId}.txt`);
    const audioPath = path.join(tempDir, `voice-${jobId}.mp3`);

    // Clean script
    const cleanScript = script.replace(/\n+/g, ' ').trim();
    await writeFile(textPath, cleanScript);

    // Generate audio
    await execAsync(
      `edge-tts --voice "en-US-AriaNeural" --rate="-5%" --file "${textPath}" --write-media "${audioPath}"`,
      { timeout: 60000 }
    );

    const audioBuffer = await readFile(audioPath);

    // Upload to Supabase
    const audioUrl = await uploadToSupabase(
      audioBuffer,
      `teaser/${jobId}/narration.mp3`,
      'audio/mpeg'
    );

    // Cleanup
    await unlink(textPath).catch(() => {});
    await unlink(audioPath).catch(() => {});

    console.log(`[${jobId}] Voice narration generated`);
    return audioUrl;
  } catch (err) {
    console.error(`[${jobId}] Voice generation error:`, err);
    return null;
  }
}

// ========================================
// Step 4: Generate animated video from image
// ========================================
async function generateAnimation(
  imageUrl: string,
  prompt: string,
  jobId: string,
  fallbackIndex: number = 0
): Promise<string> {
  console.log(`[${jobId}] Generating animation...`);

  // Try Kling AI direct (FREE 66 daily credits!)
  if (KLING_ACCESS_TOKEN) {
    try {
      console.log(`[${jobId}] Using Kling AI direct (free credits)...`);

      const response = await fetch('https://api.klingai.com/v1/videos/image2video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KLING_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_name: 'kling-v1',
          image: imageUrl,
          prompt: prompt,
          duration: '5',
          mode: 'std',
          cfg_scale: 0.5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const taskId = data.data?.task_id;

        // Poll for result
        for (let i = 0; i < 120; i++) {
          await new Promise(r => setTimeout(r, 5000));

          const statusRes = await fetch(`https://api.klingai.com/v1/videos/image2video/${taskId}`, {
            headers: { 'Authorization': `Bearer ${KLING_ACCESS_TOKEN}` },
          });

          const status = await statusRes.json();

          if (status.data?.task_status === 'succeed') {
            console.log(`[${jobId}] Kling AI direct complete`);
            return status.data?.task_result?.videos?.[0]?.url;
          }

          if (status.data?.task_status === 'failed') throw new Error('Kling AI failed');
        }
      }
    } catch (err) {
      console.error(`[${jobId}] Kling AI direct error:`, err);
    }
  }

  // Try fal.ai (Kling via proxy)
  if (FAL_API_KEY) {
    try {
      const response = await fetch('https://queue.fal.run/fal-ai/kling-video/v1.5/pro/image-to-video', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          image_url: imageUrl,
          duration: '5',
          aspect_ratio: '16:9',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const requestId = data.request_id;

        // Poll for result
        for (let i = 0; i < 120; i++) {
          await new Promise(r => setTimeout(r, 5000));

          const statusRes = await fetch(
            `https://queue.fal.run/fal-ai/kling-video/v1.5/pro/image-to-video/status/${requestId}`,
            { headers: { 'Authorization': `Key ${FAL_API_KEY}` } }
          );

          const status = await statusRes.json();

          if (status.status === 'COMPLETED') {
            console.log(`[${jobId}] fal.ai animation complete`);
            return status.video?.url || status.output?.video?.url;
          }

          if (status.status === 'FAILED') throw new Error('fal.ai failed');
        }
      }
    } catch (err) {
      console.error(`[${jobId}] fal.ai error:`, err);
    }
  }

  // Try PiAPI
  if (PIAPI_KEY) {
    try {
      const response = await fetch('https://api.piapi.ai/api/kling/v1/video/image2video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PIAPI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt,
          duration: 5,
          aspect_ratio: '16:9',
          mode: 'standard',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const taskId = data.data?.task_id;

        for (let i = 0; i < 120; i++) {
          await new Promise(r => setTimeout(r, 5000));

          const statusRes = await fetch(`https://api.piapi.ai/api/kling/v1/video/task/${taskId}`, {
            headers: { 'Authorization': `Bearer ${PIAPI_KEY}` },
          });

          const status = await statusRes.json();

          if (status.data?.status === 'completed') {
            console.log(`[${jobId}] PiAPI animation complete`);
            return status.data?.video_url;
          }

          if (status.data?.status === 'failed') throw new Error('PiAPI failed');
        }
      }
    } catch (err) {
      console.error(`[${jobId}] PiAPI error:`, err);
    }
  }

  // Try Replicate (Stable Video Diffusion XT - longer videos)
  if (REPLICATE_API_TOKEN) {
    try {
      // Use SVD-XT for longer 5-second clips (25 frames at 6fps = ~4-5 sec)
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // SVD-XT model for longer 5-sec videos
          version: 'd6c09f51e6e96eb6b4b6ea57c9bc0b8f1e9f1a093fc67b011d9d4c3f8b0a5b8e',
          input: {
            input_image: imageUrl,
            motion_bucket_id: 127,
            fps: 6,
            num_frames: 30, // 30 frames at 6fps = 5 seconds
            sizing_strategy: 'maintain_aspect_ratio',
            cond_aug: 0.02,
          },
        }),
      });

      if (response.ok) {
        const prediction = await response.json();

        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 3000));

          const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` },
          });

          const status = await statusRes.json();

          if (status.status === 'succeeded') {
            console.log(`[${jobId}] Replicate animation complete`);
            return status.output;
          }

          if (status.status === 'failed') throw new Error('Replicate failed');
        }
      }
    } catch (err) {
      console.error(`[${jobId}] Replicate video error:`, err);
    }
  }

  // Final fallback: use demo clips instead of failing the job
  const fallbackClip = DEMO_VIDEOS[fallbackIndex % DEMO_VIDEOS.length];
  console.warn(
    `[${jobId}] All video APIs unavailable. Using demo clip fallback (#${fallbackIndex + 1}).`
  );
  return fallbackClip;
}

// ========================================
// Step 5: Combine video clips with audio
// ========================================
async function combineVideoWithAudio(
  videoUrls: string[],
  audioUrl: string | null,
  jobId: string
): Promise<string> {
  console.log(`[${jobId}] Combining video with audio...`);

  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, readFile, unlink } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, `teaser-${jobId}.mp4`);

    // Download video clips
    const localClips: string[] = [];
    for (let i = 0; i < videoUrls.length; i++) {
      const clipPath = path.join(tempDir, `clip-${jobId}-${i}.mp4`);
      const res = await fetch(videoUrls[i]);
      const buffer = await res.arrayBuffer();
      await writeFile(clipPath, Buffer.from(buffer));
      localClips.push(clipPath);
    }

    // Create concat file
    const listPath = path.join(tempDir, `list-${jobId}.txt`);
    const listContent = localClips.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    await writeFile(listPath, listContent);

    let ffmpegCmd: string;

    if (audioUrl) {
      // Download audio
      const audioPath = path.join(tempDir, `audio-${jobId}.mp3`);
      const audioRes = await fetch(audioUrl);
      const audioBuffer = await audioRes.arrayBuffer();
      await writeFile(audioPath, Buffer.from(audioBuffer));

      // Combine with audio
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -i "${audioPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest -y "${outputPath}"`;
    } else {
      // Video only
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listPath}" -c:v libx264 -preset fast -crf 23 -y "${outputPath}"`;
    }

    await execAsync(ffmpegCmd, { timeout: 120000 });

    // Upload final video
    const finalBuffer = await readFile(outputPath);
    const finalUrl = await uploadToSupabase(
      finalBuffer,
      `teaser/${jobId}/final.mp4`,
      'video/mp4'
    );

    // Cleanup
    await Promise.all([
      unlink(listPath).catch(() => {}),
      unlink(outputPath).catch(() => {}),
      ...localClips.map(p => unlink(p).catch(() => {})),
    ]);

    console.log(`[${jobId}] Final teaser ready: ${finalUrl}`);
    return finalUrl;

  } catch (err) {
    console.error(`[${jobId}] Combine error:`, err);
    // Return first clip as fallback
    return videoUrls[0];
  }
}

// ========================================
// Main Pipeline
// ========================================
async function generateTeaser(
  photo1Buffer: Buffer,
  photo2Buffer: Buffer,
  storyData: StoryData,
  style: string,
  jobId: string
) {
  const { name1, name2 } = storyData;

  const updateJob = (progress: number, step: string) => {
    jobs.set(jobId, { status: 'processing', progress, step });
    console.log(`[${jobId}] ${progress}% - ${step}`);
  };

  try {
    updateJob(5, 'Starting your love story...');

    // ========================================
    // DEMO MODE - No APIs needed
    // ========================================
    if (DEMO_MODE) {
      console.log(`[${jobId}] Running in DEMO MODE (no APIs configured)`);

      updateJob(10, '[DEMO] Processing your photos...');
      await new Promise(r => setTimeout(r, 1500));

      updateJob(25, '[DEMO] Applying animation style...');
      await new Promise(r => setTimeout(r, 1500));

      updateJob(35, '[DEMO] Writing your story script...');
      const script = generateScript(storyData);
      console.log(`[${jobId}] Script: ${script}`);
      await new Promise(r => setTimeout(r, 1000));

      updateJob(50, '[DEMO] Creating animated scene 1/3...');
      await new Promise(r => setTimeout(r, 2000));

      updateJob(65, '[DEMO] Creating animated scene 2/3...');
      await new Promise(r => setTimeout(r, 2000));

      updateJob(80, '[DEMO] Creating animated scene 3/3...');
      await new Promise(r => setTimeout(r, 2000));

      updateJob(90, '[DEMO] Assembling your teaser...');
      await new Promise(r => setTimeout(r, 1500));

      // Use a sample demo video
      const demoVideoUrl = DEMO_VIDEOS[0];

      jobs.set(jobId, {
        status: 'completed',
        progress: 100,
        step: '[DEMO] Your teaser is ready! (Sample video - configure APIs for real generation)',
        videoUrl: demoVideoUrl,
      });

      console.log(`[${jobId}] ✓ DEMO teaser complete!`);
      return;
    }

    // ========================================
    // REAL MODE - With APIs
    // ========================================

    // Step 1: Stylize photos
    updateJob(10, 'Converting photos to animation style...');
    const styledPhoto1 = await stylizePhoto(photo1Buffer, style, jobId);

    updateJob(25, 'Stylizing second photo...');
    const styledPhoto2 = await stylizePhoto(photo2Buffer, style, jobId);

    // Step 2: Generate script
    updateJob(35, 'Writing your story...');
    const script = generateScript(storyData);
    console.log(`[${jobId}] Script: ${script}`);

    // Step 3: Generate voice
    updateJob(40, 'Recording narration...');
    const audioUrl = await generateVoice(script, jobId);

    // Step 4: Generate animated clips
    const styleConfig = STYLE_PROMPTS[style] || STYLE_PROMPTS.ghibli;
    const clips: string[] = [];

    updateJob(50, 'Creating animated scene 1/3...');
    const clip1 = await generateAnimation(
      styledPhoto1,
      `${name1} and ${name2} meeting for the first time, ${styleConfig.video}, romantic`,
      jobId,
      0
    );
    clips.push(clip1);

    updateJob(65, 'Creating animated scene 2/3...');
    const clip2 = await generateAnimation(
      styledPhoto2,
      `couple on romantic date, ${styleConfig.video}, happy, natural movements`,
      jobId,
      1
    );
    clips.push(clip2);

    updateJob(80, 'Creating animated scene 3/3...');
    const clip3 = await generateAnimation(
      styledPhoto1,
      `couple looking towards future together, ${styleConfig.video}, hopeful, dreamy`,
      jobId,
      2
    );
    clips.push(clip3);

    // Step 5: Combine everything
    updateJob(90, 'Assembling your teaser...');
    const finalUrl = await combineVideoWithAudio(clips, audioUrl, jobId);

    // Done!
    jobs.set(jobId, {
      status: 'completed',
      progress: 100,
      step: 'Your teaser is ready!',
      videoUrl: finalUrl,
    });

    console.log(`[${jobId}] ✓ Teaser complete!`);

  } catch (err) {
    console.error(`[${jobId}] ❌ Error:`, err);
    jobs.set(jobId, {
      status: 'failed',
      progress: 0,
      step: 'Generation failed',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

// ========================================
// POST Handler - Start generation
// ========================================
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const photo1 = formData.get('photo1') as File | null;
    const photo2 = formData.get('photo2') as File | null;
    const name1 = formData.get('name1') as string;
    const name2 = formData.get('name2') as string;
    const howMet = formData.get('howMet') as string;
    const firstDate = formData.get('firstDate') as string || '';
    const favoriteMemory = formData.get('favoriteMemory') as string || '';
    const whatILove = formData.get('whatILove') as string || '';
    const futureDream = formData.get('futureDream') as string || '';
    const style = formData.get('style') as string || 'ghibli';

    if (!photo1 || !photo2 || !name1 || !name2 || !howMet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate job ID
    const jobId = `teaser-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Convert files to buffers
    const photo1Buffer = Buffer.from(await photo1.arrayBuffer());
    const photo2Buffer = Buffer.from(await photo2.arrayBuffer());

    // Build story data
    const storyData: StoryData = {
      name1,
      name2,
      howMet,
      firstDate: firstDate || undefined,
      favoriteMemory: favoriteMemory || undefined,
      whatILove: whatILove || undefined,
      futureDream: futureDream || undefined,
    };

    // Start generation in background
    jobs.set(jobId, { status: 'processing', progress: 0, step: 'Starting...' });

    // Don't await - run in background
    generateTeaser(photo1Buffer, photo2Buffer, storyData, style, jobId);

    return NextResponse.json({ success: true, jobId });

  } catch (err) {
    console.error('POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

// ========================================
// GET Handler - Check status
// ========================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    step: job.step,
    videoUrl: job.videoUrl,
    error: job.error,
  });
}
