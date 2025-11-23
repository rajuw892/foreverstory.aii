// Video generation using Kling AI or Runway (fallback)

interface KlingVideoInput {
  image: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
}

interface VideoGenerationResult {
  videoUrl: string;
  provider: 'kling' | 'runway';
}

// Kling AI API for image-to-video
export async function generateVideoWithKling(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  const apiKey = process.env.KLING_API_KEY;
  const apiSecret = process.env.KLING_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Kling API credentials not configured');
  }

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
        aspect_ratio: '9:16',
        cfg_scale: 0.5,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Kling API error:', errorText);
      throw new Error('Failed to create Kling video task');
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      throw new Error('No task ID returned from Kling');
    }

    // Poll for completion
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

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

        if (statusData.data?.task_status === 'succeed') {
          videoUrl = statusData.data?.task_result?.videos?.[0]?.url;
        } else if (statusData.data?.task_status === 'failed') {
          throw new Error('Kling video generation failed');
        }
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Kling video generation timed out');
    }

    return videoUrl;
  } catch (error) {
    console.error('Kling video generation error:', error);
    throw error;
  }
}

// Runway Gen-3 Alpha Turbo as fallback
export async function generateVideoWithRunway(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error('Runway API key not configured');
  }

  try {
    // Create image-to-video task
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
        duration: duration,
        ratio: '9:16',
        watermark: false,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Runway API error:', errorText);
      throw new Error('Failed to create Runway video task');
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    if (!taskId) {
      throw new Error('No task ID returned from Runway');
    }

    // Poll for completion
    let videoUrl: string | null = null;
    let attempts = 0;
    const maxAttempts = 60;

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
        } else if (statusData.status === 'FAILED') {
          throw new Error('Runway video generation failed');
        }
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Runway video generation timed out');
    }

    return videoUrl;
  } catch (error) {
    console.error('Runway video generation error:', error);
    throw error;
  }
}

// Generate video with fallback
export async function generateSceneVideo(
  imageUrl: string,
  prompt: string,
  duration: number = 5
): Promise<VideoGenerationResult> {
  // Try Kling first
  try {
    const videoUrl = await generateVideoWithKling(imageUrl, prompt, duration);
    return { videoUrl, provider: 'kling' };
  } catch (klingError) {
    console.log('Kling failed, trying Runway fallback:', klingError);

    // Fallback to Runway
    try {
      const videoUrl = await generateVideoWithRunway(imageUrl, prompt, duration);
      return { videoUrl, provider: 'runway' };
    } catch (runwayError) {
      console.error('Both video providers failed:', runwayError);
      throw new Error('Video generation failed with all providers');
    }
  }
}

// Generate all scene videos
export async function generateAllSceneVideos(
  sceneImages: string[],
  scenePrompts: string[],
  duration: number = 5
): Promise<string[]> {
  const videoUrls: string[] = [];

  for (let i = 0; i < sceneImages.length; i++) {
    try {
      const result = await generateSceneVideo(
        sceneImages[i],
        scenePrompts[i],
        duration
      );
      videoUrls.push(result.videoUrl);
      console.log(`Scene ${i + 1} video generated via ${result.provider}`);
    } catch (error) {
      console.error(`Failed to generate video for scene ${i + 1}:`, error);
      throw error;
    }
  }

  return videoUrls;
}
