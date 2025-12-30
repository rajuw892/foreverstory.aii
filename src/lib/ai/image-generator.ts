import Replicate from 'replicate';
import { ArtStyle, Scene, CinematicStyleId } from '@/types';
import { STYLE_CONFIGS } from '@/lib/constants';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Model identifier type
type ReplicateModel = `${string}/${string}:${string}`;

// Style type that accepts both legacy and new style IDs
type StyleInput = ArtStyle | CinematicStyleId | string;

// Model mappings for different styles
const STYLE_MODELS: Record<string, ReplicateModel> = {
  ghibli: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  anime: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  pixar: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  disney: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  arcane: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
};

// Map new cinematic style IDs to legacy art styles for backwards compatibility
function getBaseStyle(style: StyleInput): ArtStyle {
  if (style.startsWith('ghibli') || style.includes('ghibli')) return 'ghibli';
  if (style.startsWith('disney') || style.includes('disney') || style.includes('tangled') || style.includes('frozen')) return 'disney';
  if (style.startsWith('pixar') || style.includes('pixar') || style.includes('toy_story') || style.includes('shrek')) return 'pixar';
  if (style.includes('anime') || style.includes('kdrama')) return 'anime';
  if (style.includes('arcane') || style.includes('steampunk') || style.includes('marvel')) return 'arcane';
  // Default to ghibli for other styles
  return 'ghibli';
}

// Face stylization model
const FACE_STYLIZER_MODEL: ReplicateModel = 'fofr/face-to-sticker:764d4827ea159608a07cdde8ddf1c6000019627571f37b78ea6a2e73b29fa4e1';

export async function stylizePhoto(
  photoUrl: string,
  style: StyleInput
): Promise<string> {
  const baseStyle = getBaseStyle(style);
  const styleConfig = STYLE_CONFIGS[baseStyle];

  try {
    const output = await replicate.run(FACE_STYLIZER_MODEL, {
      input: {
        image: photoUrl,
        prompt: `${styleConfig.promptPrefix} portrait, face, character design ${styleConfig.promptSuffix}`,
        negative_prompt: styleConfig.negativePrompt,
        steps: 30,
        width: 512,
        height: 512,
      },
    });

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }

    throw new Error('No output from face stylizer');
  } catch (error) {
    console.error('Face stylization error:', error);
    return photoUrl;
  }
}

export async function generateSceneImage(
  scene: Scene,
  style: StyleInput,
  characterDescriptions?: string
): Promise<string> {
  const baseStyle = getBaseStyle(style);
  const styleConfig = STYLE_CONFIGS[baseStyle];
  const model = STYLE_MODELS[baseStyle];

  const fullPrompt = `${styleConfig.promptPrefix} ${scene.visualDescription}${
    characterDescriptions ? `, ${characterDescriptions}` : ''
  } ${styleConfig.promptSuffix}`;

  try {
    const output = await replicate.run(model, {
      input: {
        prompt: fullPrompt,
        negative_prompt: styleConfig.negativePrompt,
        width: 1080,
        height: 1920,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 30,
        scheduler: 'K_EULER',
      },
    });

    if (Array.isArray(output) && output.length > 0) {
      return output[0] as string;
    }

    throw new Error('No output from image generator');
  } catch (error) {
    console.error('Scene image generation error:', error);
    throw new Error('Failed to generate scene image');
  }
}

export async function stylizeAllPhotos(
  photoUrls: string[],
  style: StyleInput
): Promise<string[]> {
  const stylizedPhotos: string[] = [];

  for (const photoUrl of photoUrls) {
    try {
      const stylizedUrl = await stylizePhoto(photoUrl, style);
      stylizedPhotos.push(stylizedUrl);
    } catch (error) {
      console.error('Error stylizing photo:', photoUrl, error);
      stylizedPhotos.push(photoUrl);
    }
  }

  return stylizedPhotos;
}

export async function generateAllSceneImages(
  scenes: Scene[],
  style: StyleInput,
  characterDescriptions?: string
): Promise<string[]> {
  const sceneImages: string[] = [];

  for (const scene of scenes) {
    try {
      const imageUrl = await generateSceneImage(scene, style, characterDescriptions);
      sceneImages.push(imageUrl);
    } catch (error) {
      console.error('Error generating scene:', scene.sceneNumber, error);
      throw error;
    }
  }

  return sceneImages;
}
