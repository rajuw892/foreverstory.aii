// ========================================
// Scene Generation Prompts
// Creates animated backgrounds for each story moment
// ========================================

import { CinematicStyleId } from '@/types';

// Story scene types
export type SceneType =
  | 'meeting'      // How they met
  | 'first_date'   // First date
  | 'funny_moment' // Funniest moment
  | 'love_moment'  // When they knew it was love
  | 'adventure'    // Their adventure together
  | 'future_dream' // Their future dream
  | 'opening'      // Opening scene
  | 'closing';     // Closing scene

export interface ScenePromptConfig {
  sceneType: SceneType;
  basePrompt: string;
  emotionalTone: string;
  cameraMovement: string;
  lighting: string;
}

// Base scene prompts for each story moment
export const SCENE_BASE_PROMPTS: Record<SceneType, ScenePromptConfig> = {
  opening: {
    sceneType: 'opening',
    basePrompt: 'romantic establishing shot, beautiful landscape, sunset colors, cinematic wide shot, love story beginning',
    emotionalTone: 'hopeful, magical, anticipation',
    cameraMovement: 'slow zoom in, gentle pan',
    lighting: 'golden hour, warm sunlight',
  },
  meeting: {
    sceneType: 'meeting',
    basePrompt: 'two people meeting for the first time, fate bringing them together, magical first encounter, romantic atmosphere',
    emotionalTone: 'nervous excitement, destiny, spark',
    cameraMovement: 'slow motion approach, focus pull',
    lighting: 'soft diffused light, romantic glow',
  },
  first_date: {
    sceneType: 'first_date',
    basePrompt: 'romantic first date scene, couple enjoying time together, intimate setting, butterflies in stomach',
    emotionalTone: 'nervous, hopeful, romantic',
    cameraMovement: 'gentle orbit, close-ups',
    lighting: 'warm ambient light, candle glow',
  },
  funny_moment: {
    sceneType: 'funny_moment',
    basePrompt: 'couple laughing together, joyful moment, shared humor, genuine happiness',
    emotionalTone: 'joy, laughter, connection',
    cameraMovement: 'dynamic, playful movement',
    lighting: 'bright, cheerful lighting',
  },
  love_moment: {
    sceneType: 'love_moment',
    basePrompt: 'intimate emotional moment, realization of love, deep connection, tender scene',
    emotionalTone: 'profound love, certainty, vulnerability',
    cameraMovement: 'slow intimate push in, soft focus',
    lighting: 'ethereal soft light, heavenly glow',
  },
  adventure: {
    sceneType: 'adventure',
    basePrompt: 'couple on adventure together, exploring the world, shared experiences, creating memories',
    emotionalTone: 'excitement, freedom, togetherness',
    cameraMovement: 'sweeping wide shots, dynamic tracking',
    lighting: 'natural outdoor light, epic scale',
  },
  future_dream: {
    sceneType: 'future_dream',
    basePrompt: 'couple dreaming of future together, vision of life ahead, hopeful aspirations, forever together',
    emotionalTone: 'hope, dreams, eternal love',
    cameraMovement: 'slow dreamy float, ascending',
    lighting: 'dreamy soft focus, heavenly rays',
  },
  closing: {
    sceneType: 'closing',
    basePrompt: 'couple silhouette, romantic ending, forever together, sunset or starry night, love eternal',
    emotionalTone: 'eternal love, contentment, happily ever after',
    cameraMovement: 'slow pull back, wide establishing',
    lighting: 'golden hour or starlight, romantic',
  },
};

// Style-specific scene modifiers
export interface StyleSceneModifier {
  styleId: CinematicStyleId;
  environmentPrefix: string;
  colorPalette: string;
  atmosphereEffects: string;
  artStyleKeywords: string;
}

export const STYLE_SCENE_MODIFIERS: Record<CinematicStyleId, StyleSceneModifier> = {
  // ANIMATION STYLES
  ghibli_cherry_blossoms: {
    styleId: 'ghibli_cherry_blossoms',
    environmentPrefix: 'Studio Ghibli anime background, hand-painted watercolor style',
    colorPalette: 'soft pastel pinks, warm oranges, gentle greens',
    atmosphereEffects: 'floating cherry blossom petals, magical sparkles, gentle breeze',
    artStyleKeywords: 'Hayao Miyazaki, anime landscape, whimsical, dreamlike',
  },
  howls_castle_night: {
    styleId: 'howls_castle_night',
    environmentPrefix: 'Studio Ghibli night scene, magical castle background',
    colorPalette: 'deep blues, purple twilight, golden stars',
    atmosphereEffects: 'twinkling stars, floating embers, mystical fog',
    artStyleKeywords: 'Howl Moving Castle aesthetic, European fantasy, magical realism',
  },
  disney_castle_fireworks: {
    styleId: 'disney_castle_fireworks',
    environmentPrefix: 'Disney animated background, fairytale kingdom',
    colorPalette: 'royal blues, golden yellows, magical purples',
    atmosphereEffects: 'sparkling fireworks, fairy dust, magical glow',
    artStyleKeywords: 'Disney animation, classic fairytale, enchanted',
  },
  tangled_lanterns: {
    styleId: 'tangled_lanterns',
    environmentPrefix: 'Disney Tangled style background, floating lanterns',
    colorPalette: 'warm oranges, deep purples, golden yellows',
    atmosphereEffects: 'hundreds of floating lanterns, warm glow, night sky',
    artStyleKeywords: 'Tangled movie aesthetic, romantic night, Corona kingdom',
  },
  pixar_up_balloons: {
    styleId: 'pixar_up_balloons',
    environmentPrefix: 'Pixar 3D rendered background, adventure paradise',
    colorPalette: 'bright sky blue, rainbow balloon colors, lush greens',
    atmosphereEffects: 'colorful balloons floating, fluffy clouds, paradise falls',
    artStyleKeywords: 'Pixar Up movie, adventure, bright and cheerful',
  },
  frozen_aurora: {
    styleId: 'frozen_aurora',
    environmentPrefix: 'Disney Frozen style winter landscape',
    colorPalette: 'icy blues, aurora greens and purples, white snow',
    atmosphereEffects: 'northern lights, snowflakes, ice crystals sparkling',
    artStyleKeywords: 'Frozen movie aesthetic, Arendelle, magical winter',
  },
  toy_story_clouds: {
    styleId: 'toy_story_clouds',
    environmentPrefix: 'Pixar Toy Story style environment',
    colorPalette: 'bright blues, white clouds, warm yellows',
    atmosphereEffects: 'fluffy clouds, blue sky, cheerful atmosphere',
    artStyleKeywords: 'Pixar animation, Andys room ceiling, playful',
  },
  shrek_swamp_sunset: {
    styleId: 'shrek_swamp_sunset',
    environmentPrefix: 'DreamWorks fairytale landscape',
    colorPalette: 'warm sunset oranges, forest greens, golden light',
    atmosphereEffects: 'fireflies, sunset rays, magical forest',
    artStyleKeywords: 'Shrek movie aesthetic, Far Far Away, fairytale forest',
  },

  // VINTAGE STYLES
  watercolor_handpainted: {
    styleId: 'watercolor_handpainted',
    environmentPrefix: 'Watercolor painting background, hand-painted artistic',
    colorPalette: 'soft muted pastels, cream paper tones',
    atmosphereEffects: 'watercolor wash, paint drips, artistic brushstrokes',
    artStyleKeywords: 'traditional watercolor, impressionist, delicate art',
  },
  vintage_super8: {
    styleId: 'vintage_super8',
    environmentPrefix: '1970s vintage photograph background',
    colorPalette: 'warm sepia tones, faded colors, film grain',
    atmosphereEffects: 'film grain, light leaks, vintage vignette',
    artStyleKeywords: 'Super 8 film, 70s nostalgia, retro aesthetic',
  },
  polaroid_memories: {
    styleId: 'polaroid_memories',
    environmentPrefix: 'Polaroid instant photo aesthetic',
    colorPalette: 'slightly faded colors, white borders, nostalgic tones',
    atmosphereEffects: 'instant camera look, slight overexposure, casual feel',
    artStyleKeywords: 'Polaroid photography, candid moments, 90s memories',
  },
  rainy_paris: {
    styleId: 'rainy_paris',
    environmentPrefix: 'Rainy Paris street scene, romantic French atmosphere',
    colorPalette: 'blue-grey tones, muted colors, rain-washed streets',
    atmosphereEffects: 'rain drops, wet reflections, cozy cafe lights',
    artStyleKeywords: 'Parisian romance, French cinema, rainy ambiance',
  },

  // CINEMATIC STYLES
  star_wars_hyperspace: {
    styleId: 'star_wars_hyperspace',
    environmentPrefix: 'Star Wars sci-fi space environment',
    colorPalette: 'deep space blacks, blue hyperspace streaks, starlight',
    atmosphereEffects: 'hyperspace lines, lens flares, star field',
    artStyleKeywords: 'Star Wars aesthetic, space opera, sci-fi epic',
  },
  marvel_cinematic: {
    styleId: 'marvel_cinematic',
    environmentPrefix: 'Marvel cinematic universe style environment',
    colorPalette: 'teal and orange, dramatic contrast, heroic colors',
    atmosphereEffects: 'dramatic lighting, cinematic dust particles, epic scale',
    artStyleKeywords: 'MCU aesthetic, superhero movie, blockbuster',
  },
  la_la_land_sunset: {
    styleId: 'la_la_land_sunset',
    environmentPrefix: 'La La Land movie style Los Angeles backdrop',
    colorPalette: 'purple pink sunset, golden hour, neon city lights',
    atmosphereEffects: 'magical sunset gradient, bokeh lights, dreamy haze',
    artStyleKeywords: 'La La Land aesthetic, Hollywood romance, musical magic',
  },
  harry_potter_great_hall: {
    styleId: 'harry_potter_great_hall',
    environmentPrefix: 'Harry Potter wizarding world environment',
    colorPalette: 'warm candlelight, golden browns, magical purples',
    atmosphereEffects: 'floating candles, magical sparkles, ancient stone',
    artStyleKeywords: 'Hogwarts aesthetic, wizarding world, magical castle',
  },
  notebook_rain_kiss: {
    styleId: 'notebook_rain_kiss',
    environmentPrefix: 'The Notebook romantic drama setting',
    colorPalette: 'stormy blues and greys, rain-soaked atmosphere',
    atmosphereEffects: 'heavy rain, dramatic clouds, passionate weather',
    artStyleKeywords: 'The Notebook movie, classic romance, emotional drama',
  },
  pride_prejudice_fields: {
    styleId: 'pride_prejudice_fields',
    environmentPrefix: 'Pride and Prejudice English countryside',
    colorPalette: 'golden wheat fields, soft greens, warm sepia',
    atmosphereEffects: 'windswept grass, morning mist, golden hour',
    artStyleKeywords: 'Regency era, English romance, period drama',
  },
  interstellar_galaxy: {
    styleId: 'interstellar_galaxy',
    environmentPrefix: 'Interstellar movie cosmic environment',
    colorPalette: 'deep purples, nebula colors, cosmic blues',
    atmosphereEffects: 'nebula clouds, distant galaxies, wormhole glow',
    artStyleKeywords: 'Christopher Nolan, space epic, cosmic wonder',
  },
  scifi_stardust: {
    styleId: 'scifi_stardust',
    environmentPrefix: 'Futuristic sci-fi stardust environment',
    colorPalette: 'neon cyan, deep blue space, purple nebula',
    atmosphereEffects: 'floating particles, holographic effects, neon glow',
    artStyleKeywords: 'cyberpunk aesthetic, futuristic, neon sci-fi',
  },

  // FANTASY STYLE
  steampunk_brass: {
    styleId: 'steampunk_brass',
    environmentPrefix: 'Steampunk Victorian industrial environment',
    colorPalette: 'brass and copper tones, warm browns, sepia',
    atmosphereEffects: 'steam wisps, clockwork gears, industrial machinery',
    artStyleKeywords: 'steampunk aesthetic, Victorian fantasy, brass and gears',
  },

  // CULTURAL STYLES
  bollywood_dream: {
    styleId: 'bollywood_dream',
    environmentPrefix: 'Bollywood movie vibrant setting',
    colorPalette: 'vibrant magenta, gold, bright saturated colors',
    atmosphereEffects: 'marigold petals, sparkle effects, dance stage',
    artStyleKeywords: 'Bollywood aesthetic, Indian romance, colorful celebration',
  },
  kdrama_cherry_blossom: {
    styleId: 'kdrama_cherry_blossom',
    environmentPrefix: 'Korean drama romantic setting, Seoul spring',
    colorPalette: 'soft pastel pinks, spring greens, clean whites',
    atmosphereEffects: 'cherry blossom petals falling, soft sunlight, romantic atmosphere',
    artStyleKeywords: 'K-drama aesthetic, Korean romance, spring in Seoul',
  },
  valentine_roses: {
    styleId: 'valentine_roses',
    environmentPrefix: 'Romantic Valentine setting, rose garden',
    colorPalette: 'deep reds, passionate pinks, romantic whites',
    atmosphereEffects: 'rose petals floating, heart shapes, romantic haze',
    artStyleKeywords: 'Valentine aesthetic, passionate romance, rose garden',
  },
};

// ========================================
// Scene Generation Helper Functions
// ========================================

/**
 * Generate a complete scene prompt for a specific story moment and style
 */
export function generateScenePrompt(
  sceneType: SceneType,
  styleId: CinematicStyleId,
  storyContext?: string
): string {
  const baseScene = SCENE_BASE_PROMPTS[sceneType];
  const styleModifier = STYLE_SCENE_MODIFIERS[styleId];

  const parts = [
    styleModifier.environmentPrefix,
    baseScene.basePrompt,
    storyContext ? `scene showing: ${storyContext}` : '',
    `color palette: ${styleModifier.colorPalette}`,
    `atmosphere: ${styleModifier.atmosphereEffects}`,
    `mood: ${baseScene.emotionalTone}`,
    `lighting: ${baseScene.lighting}`,
    styleModifier.artStyleKeywords,
    'masterpiece, highly detailed, 8k quality, cinematic composition',
  ];

  return parts.filter(Boolean).join(', ');
}

/**
 * Generate negative prompt to avoid unwanted elements
 */
export function getSceneNegativePrompt(styleId: CinematicStyleId): string {
  const isAnime = ['ghibli_cherry_blossoms', 'howls_castle_night'].includes(styleId);
  const isPixar = ['pixar_up_balloons', 'toy_story_clouds', 'frozen_aurora'].includes(styleId);

  const baseNegative = 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, signature';

  if (isAnime) {
    return `${baseNegative}, photorealistic, 3D render, western cartoon`;
  } else if (isPixar) {
    return `${baseNegative}, 2D flat, anime style, sketchy`;
  } else {
    return `${baseNegative}, cartoon, anime, unrealistic`;
  }
}

/**
 * Map story data to scene sequence
 */
export function getSceneSequence(): SceneType[] {
  return [
    'opening',
    'meeting',
    'first_date',
    'funny_moment',
    'love_moment',
    'adventure',
    'future_dream',
    'closing',
  ];
}

/**
 * Get animation motion prompt for a scene
 */
export function getSceneMotionPrompt(sceneType: SceneType, styleId: CinematicStyleId): string {
  const baseScene = SCENE_BASE_PROMPTS[sceneType];
  const styleModifier = STYLE_SCENE_MODIFIERS[styleId];

  return `${baseScene.cameraMovement}, ${styleModifier.atmosphereEffects} in motion, cinematic camera movement, smooth animation`;
}
