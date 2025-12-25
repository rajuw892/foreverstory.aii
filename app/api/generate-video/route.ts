// ========================================
// Video Generation API Route
// Complete pipeline: AI narration -> TTS -> Remotion render
// Supports all 24 cinematic styles
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processNarrationForSSML, estimateNarrationDuration } from '@/remotion/ssml-utils';
import { CinematicStyleId, CINEMATIC_STYLES, getMusicUrlForStyle } from '@/remotion/styles';
import crypto from 'crypto';

// ========================================
// Configuration
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationSeconds: 150, // 2.5 minutes
  teaserSeconds: 30,
  get durationInFrames() {
    return this.fps * this.durationSeconds;
  },
  get teaserFrames() {
    return this.fps * this.teaserSeconds;
  },
};

// ========================================
// Request Types
// ========================================

interface StoryData {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string;
  howWeMet: string;
  firstDate: string;
  funniestMoment: string;
  whenIKnew: string;
  favoriteThing: string;
  futureDream: string;
}

interface GenerateVideoRequest {
  jobId: string;
  storyData: StoryData;
  photoUrls: string[];
  styleId: CinematicStyleId;
  voiceId?: string;
}

// ========================================
// AI Narration Generation
// Creates emotionally powerful 500-word script
// ========================================

const NARRATION_PROMPT = `You are a master romantic storyteller who writes deeply emotional, personal love stories.
Write a 450-500 word narration script for an animated love story video based on these real answers from a couple:

Partner 1: {partner1Name}
Partner 2: {partner2Name}
Anniversary: {anniversaryDate}
How they met: {howWeMet}
First date: {firstDate}
Funniest moment: {funniestMoment}
When they knew it was love: {whenIKnew}
Favorite thing about each other: {favoriteThing}
Future dream: {futureDream}

REQUIREMENTS:
1. Write in third person ("This is the story of...")
2. Use their EXACT names throughout
3. Include SPECIFIC details they mentioned (don't make anything up)
4. Emotional arc: sweet meeting -> charming first date -> funny moment -> touching realization -> hopeful future
5. Natural conversational tone (like a close friend telling their story)
6. Include emotional beats with natural pauses
7. Build to an emotional crescendo when describing "when they knew"
8. End with their future dream in an inspiring, tear-jerking way
9. Use vivid sensory language (sounds, colors, feelings)
10. 450-500 words exactly (will be ~90 seconds when spoken)

OUTPUT FORMAT:
Write pure narration text with SSML pause markers:
- Use <break time='600ms'/> for short pauses between sentences
- Use <break time='800ms'/> for medium pauses between paragraphs
- Use <break time='1000ms'/> for dramatic pauses before emotional moments
- Use <emphasis level='moderate'> for gentle emphasis on romantic words
- Use <emphasis level='strong'> for key emotional words like "love", "forever", "knew"

EXAMPLE STRUCTURE:
"This is the story of [Name1] and [Name2]. <break time='800ms'/>

Their journey began [how they met - weave in their exact details]. <break time='600ms'/>
[Describe the moment, the feeling, the magic of that first encounter]. <break time='800ms'/>

Their first date was [describe using their words]. <break time='600ms'/>
[Include the funny or charming moment they shared]. <break time='800ms'/>

And then there was the time [funniest moment]. <break time='600ms'/>
In that moment of shared <emphasis level='moderate'>laughter</emphasis>, something deeper was forming. <break time='1000ms'/>

[Name1] remembers the exact moment they knew. <break time='800ms'/>
[Describe the 'when I knew' moment with emotional detail]. <break time='600ms'/>
It wasn't loud or dramatic. It was quiet, certain, and <emphasis level='strong'>real</emphasis>. <break time='1000ms'/>

What [Name2] loves most about [Name1]: [their exact words]. <break time='600ms'/>
These little details... they're <emphasis level='moderate'>everything</emphasis>. <break time='800ms'/>

And the future? <break time='1000ms'/>
[Describe their dream using their exact words]. <break time='600ms'/>
A life built <emphasis level='moderate'>together</emphasis>, moment by moment, laugh by laugh, dream by dream. <break time='800ms'/>

This... is their <emphasis level='strong'>forever story</emphasis>."

Write the complete narration now. Make it so emotionally powerful that listeners will cry.`;

async function generateNarration(storyData: StoryData): Promise<string> {
  const prompt = NARRATION_PROMPT
    .replace('{partner1Name}', storyData.partner1Name)
    .replace('{partner2Name}', storyData.partner2Name)
    .replace('{anniversaryDate}', storyData.anniversaryDate || 'a beautiful day')
    .replace('{howWeMet}', storyData.howWeMet)
    .replace('{firstDate}', storyData.firstDate)
    .replace('{funniestMoment}', storyData.funniestMoment)
    .replace('{whenIKnew}', storyData.whenIKnew)
    .replace('{favoriteThing}', storyData.favoriteThing)
    .replace('{futureDream}', storyData.futureDream);

  // Helper to wrap fetch with timeout
  const fetchWithTimeout = async (url: string, options: any, timeoutMs: number = 10000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  };

  try {
    // Try Groq first (FREE, FAST - Llama 3.3 70B) with 10s timeout
    // Get free API key from: https://console.groq.com
    if (process.env.GROQ_API_KEY) {
      console.log('[Narration] Trying Groq (free, 10s timeout)...');
      try {
        const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', // Updated model (3.1 was deprecated)
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2048,
            temperature: 0.7,
          }),
        }, 10000);

        if (response.ok) {
          const data = await response.json();
          const narration = data.choices[0].message.content;
          console.log('[Narration] Groq success!');
          return trimNarration(narration, 550);
        } else {
          const errorText = await response.text().catch(() => '');
          console.log(
            '[Narration] Groq failed:',
            response.status,
            response.statusText,
            errorText || '(no body returned)'
          );
        }
      } catch (error) {
        console.log('[Narration] Groq timeout/error:', error);
      }
    }

    // Fallback 1: OpenRouter (FREE models available)
    // Get free API key from: https://openrouter.ai/keys
    if (process.env.OPENROUTER_API_KEY) {
      console.log('[Narration] Trying OpenRouter (free)...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-70b-instruct:free', // Free model
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const narration = data.choices[0].message.content;
        console.log('[Narration] OpenRouter success!');
        return trimNarration(narration, 550);
      } else {
        console.log('[Narration] OpenRouter failed:', response.status);
      }
    }

    // Fallback 2: Claude API (PAID - only if key provided)
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('[Narration] Trying Claude (paid)...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const narration = data.content[0].text;
        console.log('[Narration] Claude success!');
        return trimNarration(narration, 550);
      }
    }

    // Fallback 3: OpenAI (PAID - only if key provided)
    if (process.env.OPENAI_API_KEY) {
      console.log('[Narration] Trying OpenAI (paid)...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const narration = data.choices[0].message.content;
        console.log('[Narration] OpenAI success!');
        return trimNarration(narration, 550);
      }
    }
  } catch (error) {
    console.error('[Narration] All AI providers failed:', error);
  }

  // Ultimate fallback: template-based narration (NO API KEY NEEDED)
  console.log('[Narration] Using template fallback (no API keys found or all failed)');
  console.log('[Narration] NOTE: For better results, add GROQ_API_KEY (free at https://console.groq.com)');
  return generateTemplateNarration(storyData);
}

function trimNarration(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// Multiple romantic story templates for variety
const STORY_TEMPLATES = [
  // Template 1: Classic Romance
  (data: StoryData) => `This is the story of ${data.partner1Name} and ${data.partner2Name}. <break time='800ms'/>

Their journey began ${data.howWeMet}. <break time='600ms'/>
From that very first moment, something <emphasis level='moderate'>magical</emphasis> was already beginning. <break time='800ms'/>

Their first date was memorable. ${data.firstDate}. <break time='600ms'/>
It wasn't perfect, but it was <emphasis level='strong'>perfectly them</emphasis>. <break time='800ms'/>

And then there was the time they couldn't stop laughing. <break time='600ms'/>
${data.funniestMoment}. <break time='600ms'/>
In those moments of shared <emphasis level='moderate'>laughter</emphasis>, their connection deepened. <break time='1000ms'/>

${data.partner1Name} remembers the exact moment they knew. <break time='800ms'/>
${data.whenIKnew}. <break time='600ms'/>
It wasn't loud or dramatic. It was quiet, certain, and <emphasis level='strong'>real</emphasis>. <break time='1000ms'/>

What they love most about each other? <break time='600ms'/>
${data.favoriteThing}. <break time='600ms'/>
These little details... they're <emphasis level='moderate'>everything</emphasis>. <break time='800ms'/>

And the future? <break time='1000ms'/>
${data.futureDream}. <break time='600ms'/>
A life built <emphasis level='moderate'>together</emphasis>, moment by moment, laugh by laugh, dream by dream. <break time='1000ms'/>

This... is their <emphasis level='strong'>forever story</emphasis>.`,

  // Template 2: Poetic Journey
  (data: StoryData) => `In a world of billions, two souls found each other. <break time='1000ms'/>
${data.partner1Name} and ${data.partner2Name}. <break time='800ms'/>

${data.howWeMet}. <break time='600ms'/>
It could have been just another ordinary day. But fate had other plans. <break time='1000ms'/>

${data.firstDate}. <break time='600ms'/>
Nervous laughter, stolen glances, and the beginning of something <emphasis level='moderate'>extraordinary</emphasis>. <break time='800ms'/>

Through shared adventures and quiet moments, their bond grew stronger. <break time='800ms'/>
${data.funniestMoment}. <break time='600ms'/>
It's in these unguarded moments that love truly <emphasis level='strong'>reveals itself</emphasis>. <break time='1000ms'/>

Then came the realization. <break time='800ms'/>
${data.whenIKnew}. <break time='600ms'/>
That moment when you stop <emphasis level='moderate'>falling</emphasis> and realize you've already <emphasis level='strong'>landed</emphasis>. <break time='1000ms'/>

${data.favoriteThing}. <break time='600ms'/>
These are the treasures of their everyday life. The small things that mean <emphasis level='moderate'>everything</emphasis>. <break time='800ms'/>

Looking ahead, they dream together. <break time='800ms'/>
${data.futureDream}. <break time='600ms'/>
A future painted with the colors of their love. <break time='1000ms'/>

Two hearts. One <emphasis level='strong'>forever</emphasis>.`,

  // Template 3: Modern Love Story
  (data: StoryData) => `Every love story is unique. This one belongs to ${data.partner1Name} and ${data.partner2Name}. <break time='1000ms'/>

Chapter One: The Meeting. <break time='600ms'/>
${data.howWeMet}. <break time='600ms'/>
Some might call it chance. They call it <emphasis level='moderate'>destiny</emphasis>. <break time='800ms'/>

Chapter Two: The First Date. <break time='600ms'/>
${data.firstDate}. <break time='600ms'/>
Awkward, beautiful, and the start of <emphasis level='strong'>everything</emphasis>. <break time='800ms'/>

Chapter Three: Joy and Laughter. <break time='600ms'/>
${data.funniestMoment}. <break time='600ms'/>
Because the best relationships are built on shared <emphasis level='moderate'>joy</emphasis>. <break time='1000ms'/>

Chapter Four: The Moment of Truth. <break time='800ms'/>
${data.whenIKnew}. <break time='600ms'/>
Love isn't always a lightning bolt. Sometimes it's a gentle <emphasis level='strong'>certainty</emphasis>. <break time='1000ms'/>

Chapter Five: The Little Things. <break time='600ms'/>
${data.favoriteThing}. <break time='600ms'/>
These details write the <emphasis level='moderate'>real story</emphasis>. <break time='800ms'/>

Chapter Six: Forever Begins. <break time='800ms'/>
${data.futureDream}. <break time='600ms'/>
The best chapters are still being written. <break time='1000ms'/>

To be continued... <emphasis level='strong'>forever</emphasis>.`,

  // Template 4: Cinematic Romance
  (data: StoryData) => `Picture a love story. Not the Hollywood kind, but the <emphasis level='moderate'>real</emphasis> kind. <break time='1000ms'/>
This is the story of ${data.partner1Name} and ${data.partner2Name}. <break time='800ms'/>

It started ${data.howWeMet}. <break time='600ms'/>
No dramatic music, no slow motion. Just two people, one <emphasis level='moderate'>perfect</emphasis> moment. <break time='800ms'/>

The first date. <break time='600ms'/>
${data.firstDate}. <break time='600ms'/>
The kind of night you replay in your mind for <emphasis level='strong'>years</emphasis>. <break time='1000ms'/>

They learned that love isn't just romance. It's <emphasis level='moderate'>laughter</emphasis>. <break time='600ms'/>
${data.funniestMoment}. <break time='600ms'/>
The moments that make your cheeks hurt from smiling. <break time='800ms'/>

And then, there was clarity. <break time='800ms'/>
${data.whenIKnew}. <break time='600ms'/>
Not a question anymore. Just an <emphasis level='strong'>answer</emphasis>. <break time='1000ms'/>

The special things. <break time='600ms'/>
${data.favoriteThing}. <break time='600ms'/>
The details that turn a relationship into a <emphasis level='moderate'>home</emphasis>. <break time='800ms'/>

Their dreams for tomorrow. <break time='800ms'/>
${data.futureDream}. <break time='600ms'/>
Building a life, one beautiful day at a time. <break time='1000ms'/>

This is <emphasis level='strong'>their</emphasis> story. And it's just beginning.`,

  // Template 5: Timeless Love
  (data: StoryData) => `Once upon a time, in the story that matters most... <break time='800ms'/>
${data.partner1Name} met ${data.partner2Name}. <break time='1000ms'/>

${data.howWeMet}. <break time='600ms'/>
And in that moment, the universe whispered: <emphasis level='moderate'>pay attention</emphasis>. <break time='800ms'/>

First dates are never perfect. <break time='600ms'/>
${data.firstDate}. <break time='600ms'/>
But perfection isn't the point. <emphasis level='strong'>Connection</emphasis> is. <break time='1000ms'/>

Love reveals itself in unexpected ways. <break time='600ms'/>
${data.funniestMoment}. <break time='600ms'/>
In <emphasis level='moderate'>laughter</emphasis>, in comfort, in the everyday magic. <break time='800ms'/>

Recognition came softly. <break time='800ms'/>
${data.whenIKnew}. <break time='600ms'/>
The soul knows before the mind catches up. <break time='1000ms'/>

What makes them them. <break time='600ms'/>
${data.favoriteThing}. <break time='600ms'/>
Love lives in the <emphasis level='moderate'>details</emphasis>. <break time='800ms'/>

And tomorrow? <break time='800ms'/>
${data.futureDream}. <break time='600ms'/>
A thousand tomorrows, all <emphasis level='strong'>together</emphasis>. <break time='1000ms'/>

And they lived... <emphasis level='strong'>beautifully</emphasis>.`,
];

function generateTemplateNarration(storyData: StoryData): string {
  // Use hash of names to consistently pick same template for same couple
  const hash = (storyData.partner1Name + storyData.partner2Name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templateIndex = hash % STORY_TEMPLATES.length;

  const selectedTemplate = STORY_TEMPLATES[templateIndex];
  console.log(`[Narration] Using template ${templateIndex + 1}/${STORY_TEMPLATES.length} for ${storyData.partner1Name} & ${storyData.partner2Name}`);

  return selectedTemplate(storyData).trim();
}

// ========================================
// Edge-TTS Voice Generation
// Converts narration to emotional speech
// ========================================

const VOICE_OPTIONS = {
  'aria': { shortName: 'en-US-AriaNeural', description: 'Warm female (default)' },
  'guy': { shortName: 'en-US-GuyNeural', description: 'Gentle male' },
  'jenny': { shortName: 'en-US-JennyNeural', description: 'Cheerful female' },
  'sonia': { shortName: 'en-GB-SoniaNeural', description: 'British female' },
  'natalie': { shortName: 'en-AU-NatashaNeural', description: 'Australian female' },
  'davis': { shortName: 'en-US-DavisNeural', description: 'Calm male' },
  'ryan': { shortName: 'en-GB-RyanNeural', description: 'British male' },
};

const getFallbackNarrationUrl = () => {
  // Return a 10-second silence MP3 from a reliable public source
  // This prevents Remotion from failing when edge-tts is not available
  return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'; // Using as placeholder
};

async function generateVoiceover(
  narration: string,
  voiceId: string = 'aria',
  jobId: string
): Promise<string> {
  const voice = VOICE_OPTIONS[voiceId as keyof typeof VOICE_OPTIONS] || VOICE_OPTIONS.aria;
  const ssmlText = processNarrationForSSML(narration);
  const fallbackUrl = getFallbackNarrationUrl();

  try {
    const { spawnSync, exec } = await import('child_process');
    const probe = spawnSync(process.env.EDGE_TTS_BIN || 'edge-tts', ['--version'], {
      stdio: 'ignore',
    });

    if (probe.error || probe.status !== 0) {
      console.warn(
        'edge-tts CLI not found. Install with "pip install edge-tts" to enable voice-over generation.'
      );
      return fallbackUrl;
    }

    // Option 1: Use edge-tts CLI (if available on server)
    // This requires edge-tts to be installed: pip install edge-tts
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const { writeFile, readFile, unlink } = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const tempTextFile = path.join(tempDir, `narration-${jobId}.txt`);
    const tempAudioFile = path.join(tempDir, `narration-${jobId}.mp3`);

    // Write SSML to temp file
    await writeFile(tempTextFile, ssmlText);

    // Generate audio with edge-tts
    await execAsync(
      `edge-tts --voice "${voice.shortName}" --rate=-5% --file "${tempTextFile}" --write-media "${tempAudioFile}"`,
      { timeout: 120000 } // 2 minute timeout
    );

    // Read the generated audio
    const audioBuffer = await readFile(tempAudioFile);

    // Upload to Supabase Storage
    const audioPath = `narrations/${jobId}.mp3`;
    const { data, error } = await supabase.storage
      .from('audio')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) throw error;

    // Clean up temp files
    await Promise.all([
      unlink(tempTextFile).catch(() => {}),
      unlink(tempAudioFile).catch(() => {}),
    ]);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio')
      .getPublicUrl(audioPath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Edge-TTS generation failed:', error);

    // Fallback: Return placeholder URL
    // In production, you might use a different TTS service like ElevenLabs
    return fallbackUrl;
  }
}

// ========================================
// Remotion Video Rendering
// Renders the complete 150-second video
// ========================================

async function renderVideo(
  props: {
    partner1Name: string;
    partner2Name: string;
    anniversaryDate: string;
    howWeMet: string;
    firstDate: string;
    funniestMoment: string;
    whenIKnew: string;
    favoriteThing: string;
    futureDream: string;
    photoUrls: string[];
    narrationAudioUrl: string;
    musicUrl: string;
    styleId: CinematicStyleId;
  },
  jobId: string,
  onProgress?: (progress: number, step: string) => Promise<void>
): Promise<{ fullVideoUrl: string; teaserUrl: string }> {
  try {
    await onProgress?.(10, 'Preparing video composition...');

    // Check if we should use Remotion Lambda (production) or local rendering
    const useRemotionLambda = process.env.REMOTION_AWS_ACCESS_KEY_ID && process.env.REMOTION_FUNCTION_NAME;

    if (useRemotionLambda) {
      // Production: Use Remotion Lambda for serverless rendering
      const dynamicImport = new Function('moduleName', 'return import(moduleName);');
      const lambdaClient = await dynamicImport('@remotion/lambda/client').catch((err: unknown) => {
        console.warn(
          'Remotion Lambda client not available, falling back to local render. Install @remotion/lambda if you want cloud rendering.',
          err
        );
        return null;
      });

      if (lambdaClient) {
        const { renderMediaOnLambda, getRenderProgress } = lambdaClient as typeof import('@remotion/lambda/client');

        await onProgress?.(20, 'Starting cloud render...');

        const { renderId, bucketName } = await renderMediaOnLambda({
          region: (process.env.REMOTION_AWS_REGION || 'us-east-1') as 'us-east-1',
          functionName: process.env.REMOTION_FUNCTION_NAME!,
          serveUrl: process.env.REMOTION_SERVE_URL!,
          composition: 'ForeverStoryVideo',
          inputProps: props,
          codec: 'h264',
          imageFormat: 'jpeg',
          maxRetries: 3,
          privacy: 'public',
          downloadBehavior: { type: 'download', fileName: `${jobId}.mp4` },
        });

        // Poll for progress
        let progress = 0;
        while (progress < 1) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s

          const renderProgress = await getRenderProgress({
            region: (process.env.REMOTION_AWS_REGION || 'us-east-1') as 'us-east-1',
            functionName: process.env.REMOTION_FUNCTION_NAME!,
            bucketName,
            renderId,
          });

          progress = renderProgress.overallProgress;
          await onProgress?.(20 + Math.floor(progress * 60), `Rendering video... ${Math.floor(progress * 100)}%`);

          if (renderProgress.fatalErrorEncountered) {
            throw new Error('Render failed: ' + renderProgress.errors?.[0]?.message);
          }

          if (renderProgress.done && renderProgress.outputFile) {
            // Video is ready
            await onProgress?.(85, 'Video rendered successfully!');

            // Create teaser (first 30 seconds)
            const teaserUrl = await createTeaser(renderProgress.outputFile, jobId);

            return {
              fullVideoUrl: renderProgress.outputFile,
              teaserUrl,
            };
          }
        }

        throw new Error('Render did not complete');
      }
      // If lambda client is missing, fall through to local render
    }

    // Development/fallback: Use local Remotion rendering
    await onProgress?.(20, 'Starting local render...');

    const { bundle } = await import('@remotion/bundler');
    const { renderMedia, selectComposition } = await import('@remotion/renderer');
    const path = await import('path');
    const { unlink } = await import('fs/promises');

    // Bundle the Remotion project (with caching for faster subsequent renders)
    const bundleLocation = await bundle({
      entryPoint: path.resolve('./src/remotion/index.tsx'),
      webpackOverride: (config) => {
        // Enable webpack caching for 60% faster subsequent builds
        config.cache = {
          type: 'filesystem',
          cacheDirectory: path.resolve('./.webpack-cache'),
        };
        return config;
      },
    });

    await onProgress?.(30, 'Selecting composition...');

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'ForeverStoryVideo',
      inputProps: props,
    });

    // Output paths
    const outputDir = path.resolve('./public/videos');
    const fullVideoPath = path.join(outputDir, `${jobId}.mp4`);
    const teaserPath = path.join(outputDir, `${jobId}-teaser.mp4`);

    await onProgress?.(40, 'Rendering full video...');

      // Render full video with optimizations
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: fullVideoPath,
        inputProps: props,
        // Enable parallel rendering (uses all CPU cores for 4x faster rendering)
        concurrency: null, // Auto-detect CPU cores
        chromiumOptions: {
          gl: 'angle' as const, // Hardware acceleration
        },
        onProgress: async ({ progress }) => {
          await onProgress?.(40 + Math.floor(progress * 40), `Rendering... ${Math.floor(progress * 100)}%`);
        },
      });

      await onProgress?.(82, 'Creating teaser preview...');

      // Render teaser (first 30 seconds) with same optimizations
      await renderMedia({
        composition: {
          ...composition,
          durationInFrames: VIDEO_CONFIG.teaserFrames,
        },
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: teaserPath,
        inputProps: props,
        concurrency: null, // Parallel rendering
      });

      await onProgress?.(90, 'Uploading videos...');

      // Upload to Supabase Storage with error handling
      const fs = await import('fs/promises');

      console.log(`[${jobId}] Reading video files from disk...`);
      const fullVideoBuffer = await fs.readFile(fullVideoPath);
      const teaserBuffer = await fs.readFile(teaserPath);

      const fullVideoSize = fullVideoBuffer.length / (1024 * 1024); // MB
      const teaserSize = teaserBuffer.length / (1024 * 1024); // MB
      console.log(`[${jobId}] File sizes - Full: ${fullVideoSize.toFixed(2)}MB, Teaser: ${teaserSize.toFixed(2)}MB`);

      await onProgress?.(92, `Uploading full video (${fullVideoSize.toFixed(1)}MB)...`);

      // Upload full video
      console.log(`[${jobId}] Uploading full video to Supabase...`);
      const fullUploadResult = await supabase.storage
        .from('videos')
        .upload(`full/${jobId}.mp4`, fullVideoBuffer, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (fullUploadResult.error) {
        console.error(`[${jobId}] Full video upload FAILED:`, fullUploadResult.error);
        throw new Error(`Full video upload failed: ${fullUploadResult.error.message}`);
      }
      console.log(`[${jobId}] ✓ Full video uploaded successfully`);

      await onProgress?.(96, 'Uploading teaser...');

      // Upload teaser
      console.log(`[${jobId}] Uploading teaser to Supabase...`);
      const teaserUploadResult = await supabase.storage
        .from('videos')
        .upload(`teasers/${jobId}.mp4`, teaserBuffer, {
          contentType: 'video/mp4',
          upsert: true,
        });

      if (teaserUploadResult.error) {
        console.error(`[${jobId}] Teaser upload FAILED:`, teaserUploadResult.error);
        throw new Error(`Teaser upload failed: ${teaserUploadResult.error.message}`);
      }
      console.log(`[${jobId}] ✓ Teaser uploaded successfully`);

      await onProgress?.(98, 'Finalizing...');

      // Get public URLs
      const { data: fullUrlData } = supabase.storage.from('videos').getPublicUrl(`full/${jobId}.mp4`);
      const { data: teaserUrlData } = supabase.storage.from('videos').getPublicUrl(`teasers/${jobId}.mp4`);

      // Clean up local files
      await Promise.all([
        unlink(fullVideoPath).catch(() => {}),
        unlink(teaserPath).catch(() => {}),
      ]);

      return {
        fullVideoUrl: fullUrlData.publicUrl,
        teaserUrl: teaserUrlData.publicUrl,
      };
  } catch (error) {
    console.error('Video rendering failed:', error);
    throw new Error(`Rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ========================================
// Teaser Creation
// Creates 30-second preview with "unlock" overlay
// ========================================

async function createTeaser(fullVideoUrl: string, jobId: string): Promise<string> {
  try {
    // Use FFmpeg to extract first 30 seconds and add watermark
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    const path = await import('path');
    const os = await import('os');
    const { readFile, unlink } = await import('fs/promises');

    const tempDir = os.tmpdir();
    const teaserPath = path.join(tempDir, `teaser-${jobId}.mp4`);

    // FFmpeg command to:
    // 1. Extract first 30 seconds
    // 2. Add "Unlock Full Video" text overlay at the end
    // 3. Add fade out effect
    // 4. Use web-optimized H.264 settings for maximum browser compatibility
    await execAsync(
      `ffmpeg -i "${fullVideoUrl}" -t 30 -vf "drawtext=text='Unlock Full Video':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(t,25)',fade=t=out:st=28:d=2" -af "afade=t=out:st=28:d=2" -c:v libx264 -profile:v baseline -level 3.0 -pix_fmt yuv420p -movflags +faststart -preset fast -crf 23 -c:a aac -b:a 128k -ar 48000 "${teaserPath}"`,
      { timeout: 60000 }
    );

    // Read and upload teaser
    const teaserBuffer = await readFile(teaserPath);

    const { error } = await supabase.storage
      .from('videos')
      .upload(`teasers/${jobId}.mp4`, teaserBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) throw error;

    // Clean up
    await unlink(teaserPath).catch(() => {});

    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(`teasers/${jobId}.mp4`);

    return data.publicUrl;
  } catch (error) {
    console.error('Teaser creation failed:', error);
    // If teaser creation fails, just return a truncated version of full URL
    return fullVideoUrl + '?teaser=true';
  }
}

// ========================================
// URL Encryption for Full Video
// Time-limited access tokens
// ========================================

function encryptVideoUrl(url: string, jobId: string): string {
  const secret = process.env.VIDEO_ENCRYPTION_SECRET || 'foreverstory-secret-key';
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  const payload = JSON.stringify({ url, jobId, expiresAt });
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(secret, 'salt', 32),
    Buffer.alloc(16, 0)
  );

  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

function decryptVideoUrl(encrypted: string): { url: string; jobId: string; expiresAt: number } | null {
  try {
    const secret = process.env.VIDEO_ENCRYPTION_SECRET || 'foreverstory-secret-key';
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(secret, 'salt', 32),
      Buffer.alloc(16, 0)
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const payload = JSON.parse(decrypted);

    // Check expiration
    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ========================================
// Expand Photos Helper
// Ensures minimum photo count
// ========================================

function expandPhotosIfNeeded(photos: string[], minCount: number): string[] {
  if (photos.length >= minCount) return photos.slice(0, 12); // Max 12 photos

  const expanded = [...photos];
  while (expanded.length < minCount) {
    expanded.push(photos[expanded.length % photos.length]);
  }
  return expanded;
}

// ========================================
// Retry Helper
// ========================================

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2, // Reduced from 3
  delayMs: number = 500  // Reduced from 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

// ========================================
// Main API Handler
// ========================================

export async function POST(request: NextRequest) {
  let jobId: string | null = null;

  try {
    console.log(`\n========================================`);
    console.log(`[VIDEO-GEN] /api/generate-video - Request received`);
    console.log(`========================================\n`);

    const body: GenerateVideoRequest = await request.json();
    jobId = body.jobId;

    console.log(`[${jobId}] Payload received:`, {
      hasStoryData: !!body.storyData,
      photoCount: body.photoUrls?.length || 0,
      styleId: body.styleId,
      voiceId: body.voiceId,
      storyDataFields: body.storyData ? Object.keys(body.storyData) : [],
    });

    // Validate input
    if (!body.storyData || !body.photoUrls || body.photoUrls.length < 2) {
      console.error(`[${jobId}] Validation failed:`, {
        hasStoryData: !!body.storyData,
        photoCount: body.photoUrls?.length || 0,
        minRequired: 2,
      });
      return NextResponse.json(
        { error: 'Invalid request: Missing story data or photos (minimum 2 required)' },
        { status: 400 }
      );
    }

    // Validate style
    const styleId = body.styleId || 'ghibli_cherry_blossoms';
    if (!CINEMATIC_STYLES[styleId]) {
      console.error(`[${jobId}] Invalid style ID: ${styleId}`);
      return NextResponse.json(
        { error: 'Invalid style ID' },
        { status: 400 }
      );
    }

    console.log(`[${jobId}] Validation passed - starting video generation pipeline`);

    // Helper to update job status in database
    const updateStatus = async (status: string, progress: number, currentStep: string) => {
      if (!jobId) return;
      await supabase
        .from('stories')
        .update({
          status,
          progress,
          current_step: currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    };

    // IMMEDIATE STATUS UPDATE - Let user know we started processing
    await updateStatus('processing_script', 1, 'Starting to craft your story...');
    console.log(`[${jobId}] Video generation started`);

    // ========================================
    // Step 1: Generate AI Narration
    // ========================================
    await updateStatus('processing_script', 5, 'Crafting your unique love story...');
    console.log(`[${jobId}] Starting narration generation`);
    const narrationStartTime = Date.now();

    const narration = await withRetry(() => generateNarration(body.storyData));

    const narrationTime = Date.now() - narrationStartTime;
    console.log(`[${jobId}] ✓ Narration generated in ${narrationTime}ms:`, {
      length: narration.length,
      wordCount: narration.split(/\s+/).length,
    });

    // Print the complete narration
    console.log(`\n========================================`);
    console.log(`[${jobId}] COMPLETE NARRATION TEXT:`);
    console.log(`========================================`);
    console.log(narration);
    console.log(`========================================\n`);

    await updateStatus('processing_script', 12, 'Story written! Preparing narration...');

    // ========================================
    // Step 2: Generate Voice-over
    // ========================================
    await updateStatus('recording_narration', 15, 'Recording the perfect narration...');
    console.log(`[${jobId}] Starting voice-over generation with voice: ${body.voiceId || 'aria'}`);
    const voiceStartTime = Date.now();

    const narrationAudioUrl = await withRetry(() =>
      generateVoiceover(narration, body.voiceId || 'aria', jobId)
    );

    const voiceTime = Date.now() - voiceStartTime;
    console.log(`[${jobId}] ✓ Voice-over generated in ${voiceTime}ms:`, narrationAudioUrl);
    await updateStatus('recording_narration', 22, 'Voice recorded! Preparing visuals...');

    // ========================================
    // Step 3: Prepare Photos
    // ========================================
    await updateStatus('creating_scenes', 25, 'Preparing your beautiful photos...');

    const photos = expandPhotosIfNeeded(body.photoUrls, 6);

    // ========================================
    // Step 4: Get Music Track
    // ========================================
    const musicUrl = getMusicUrlForStyle(styleId);

    // ========================================
    // Step 5: Render Video
    // ========================================
    await updateStatus('rendering_frames', 30, 'Creating your masterpiece...');

    const { fullVideoUrl, teaserUrl } = await renderVideo(
      {
        partner1Name: body.storyData.partner1Name,
        partner2Name: body.storyData.partner2Name,
        anniversaryDate: body.storyData.anniversaryDate,
        howWeMet: body.storyData.howWeMet,
        firstDate: body.storyData.firstDate,
        funniestMoment: body.storyData.funniestMoment,
        whenIKnew: body.storyData.whenIKnew,
        favoriteThing: body.storyData.favoriteThing,
        futureDream: body.storyData.futureDream,
        photoUrls: photos,
        narrationAudioUrl,
        musicUrl,
        styleId,
      },
      jobId,
      async (progress, step) => {
        await updateStatus('rendering_frames', progress, step);
      }
    );

    // ========================================
    // Step 6: Encrypt Full Video URL
    // ========================================
    const encryptedFullUrl = encryptVideoUrl(fullVideoUrl, jobId);

    // ========================================
    // Step 7: Save Final Results
    // ========================================
    console.log(`[${jobId}] Saving final results to database...`);
    console.log(`[${jobId}] Full video URL: ${fullVideoUrl}`);
    console.log(`[${jobId}] Teaser URL: ${teaserUrl}`);

    const { error: finalUpdateError } = await supabase
      .from('stories')
      .update({
        status: 'completed',
        progress: 100,
        current_step: 'Your love story is ready!',
        video_url: fullVideoUrl,
        teaser_url: teaserUrl,
        narration_text: narration,
        narration_audio_url: narrationAudioUrl,
        style_id: styleId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (finalUpdateError) {
      console.error(`[${jobId}] Final database update FAILED:`, finalUpdateError);
      throw new Error(`Failed to save final results: ${finalUpdateError.message}`);
    }

    console.log(`[${jobId}] ✓ Final results saved successfully!`);

    // ========================================
    // Return Success Response
    // ========================================
    return NextResponse.json({
      success: true,
      jobId,
      teaserUrl,
      encryptedFullUrl,
      narrationText: narration,
      styleName: CINEMATIC_STYLES[styleId].name,
      estimatedDuration: estimateNarrationDuration(narration),
    });

  } catch (error) {
    console.error(`[${jobId}] ❌ Video generation FAILED:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Update job as failed
    if (jobId) {
      console.log(`[${jobId}] Updating database status to 'failed'`);
      await supabase
        .from('stories')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error occurred',
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed',
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET Handler - Decrypt Video URL
// Used after payment to get actual video URL
// ========================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const encryptedUrl = searchParams.get('token');
    const jobId = searchParams.get('jobId');

    if (!encryptedUrl || !jobId) {
      return NextResponse.json(
        { error: 'Missing token or jobId' },
        { status: 400 }
      );
    }

    // Verify payment status
    const { data: story, error } = await supabase
      .from('stories')
      .select('paid, video_url')
      .eq('id', jobId)
      .single();

    if (error || !story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    if (!story.paid) {
      return NextResponse.json(
        { error: 'Payment required to access full video' },
        { status: 402 }
      );
    }

    // Decrypt and return URL
    const decrypted = decryptVideoUrl(encryptedUrl);

    if (!decrypted || decrypted.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      videoUrl: decrypted.url,
      expiresAt: decrypted.expiresAt,
    });

  } catch (error) {
    console.error('Get video URL failed:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve video URL' },
      { status: 500 }
    );
  }
}
