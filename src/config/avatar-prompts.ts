// ========================================
// Avatar Generation Prompts for All 24 Cinematic Styles
// ========================================

import { CinematicStyleId } from '@/types';

export interface AvatarStyleConfig {
  styleId: CinematicStyleId;
  avatarPrompt: string;
  negativePrompt: string;
  modelId: string;
  settings: {
    identityStrength: number;
    styleStrength: number;
    guidanceScale: number;
    numInferenceSteps: number;
  };
}

// Replicate model identifiers
type ReplicateModel = `${string}/${string}:${string}`;

// ========================================
// FREE-TIER FRIENDLY MODELS (Prioritized)
// ========================================

// PRIMARY (FREE): Face-to-Many - Great for stylized avatars, has generous free tier
export const FACE_TO_MANY_MODEL: ReplicateModel =
  'fofr/face-to-many:a07f252abbbd832009640b27f063ea52d87d7a23a185ca165bec23b5adc8deaf';

// SECONDARY (FREE): Face-to-Sticker - Another free-tier friendly option
export const FACE_TO_STICKER_MODEL: ReplicateModel =
  'fofr/face-to-sticker:764d4827ea159608a07cdde8ddf1c6000019627571f37b78ea6a2e73b29fa4e1';

// FALLBACK (PAID): InstantID - Higher quality but more expensive
export const INSTANT_ID_MODEL: ReplicateModel =
  'zsxkib/instant-id:2a2e8915d4a3c4c42db77bd7a7d04af0e46d07b7e3f22c0475e1de17dc8ad45e';

// FALLBACK 2 (PAID): IP-Adapter - Only use if others fail
export const IP_ADAPTER_MODEL: ReplicateModel =
  'lucataco/ip-adapter-faceid:37bb90e3b53e6c095cd8bdeeba6e0b8f25a26b9e3389123a79a2c0bcccc86c23';

// ========================================
// Complete 24-Style Avatar Configuration
// ========================================

export const AVATAR_STYLE_CONFIGS: Record<CinematicStyleId, AvatarStyleConfig> = {
  // ========================================
  // ANIMATION STYLES (8)
  // ========================================

  ghibli_cherry_blossoms: {
    styleId: 'ghibli_cherry_blossoms',
    avatarPrompt:
      'Studio Ghibli anime portrait, soft watercolor style, Hayao Miyazaki character design, gentle expressive eyes, warm loving expression, pastel pink colors, hand-drawn anime aesthetic, sakura cherry blossom theme, romantic couple character, beautiful detailed face, soft lighting',
    negativePrompt:
      'realistic, photorealistic, 3D render, harsh lines, dark, horror, deformed, ugly, bad anatomy, extra limbs, blurry, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.7,
      styleStrength: 0.8,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  howls_castle_night: {
    styleId: 'howls_castle_night',
    avatarPrompt:
      'Studio Ghibli anime portrait, Howls Moving Castle movie style, magical night atmosphere, starlit background, mysterious and romantic expression, soft anime features, ethereal blue glow, hand-drawn animation quality, elegant character design, moonlight illumination',
    negativePrompt:
      'realistic, photorealistic, 3D, dark horror, deformed, ugly, low quality, bad anatomy',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.7,
      styleStrength: 0.8,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  disney_castle_fireworks: {
    styleId: 'disney_castle_fireworks',
    avatarPrompt:
      'Disney 2D animation style portrait, classic Disney princess prince character, large expressive eyes, magical sparkles around face, fairytale aesthetic, royal enchanting appearance, golden fireworks reflection, warm magical lighting, perfect Disney animation quality',
    negativePrompt:
      'realistic, photorealistic, 3D Pixar, anime, dark, horror, deformed, ugly, bad proportions',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.65,
      styleStrength: 0.85,
      guidanceScale: 8,
      numInferenceSteps: 30,
    },
  },

  tangled_lanterns: {
    styleId: 'tangled_lanterns',
    avatarPrompt:
      'Disney Tangled movie style portrait, warm golden lantern glow lighting, romantic dreamy atmosphere, Disney 3D-2D hybrid animation style, expressive hopeful character, purple night sky background, magical warm mood, beautiful detailed eyes',
    negativePrompt:
      'realistic photo, dark horror, deformed, ugly, low quality, anime style',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.65,
      styleStrength: 0.85,
      guidanceScale: 8,
      numInferenceSteps: 30,
    },
  },

  pixar_up_balloons: {
    styleId: 'pixar_up_balloons',
    avatarPrompt:
      'Pixar 3D animation style portrait, Up movie inspired aesthetic, bright colorful balloons background, expressive cartoon features, big beautiful eyes, smooth skin texture, joyful loving expression, professional Pixar quality rendering, warm sunny lighting',
    negativePrompt:
      'realistic photo, 2D flat, dark, horror, deformed, ugly, anime, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.6,
      styleStrength: 0.9,
      guidanceScale: 8,
      numInferenceSteps: 35,
    },
  },

  frozen_aurora: {
    styleId: 'frozen_aurora',
    avatarPrompt:
      'Disney Frozen movie style portrait, icy blue magical aesthetic, aurora borealis northern lights background, elegant refined features, crystalline sparkle effects, magical winter atmosphere, Disney 3D animation quality, cool blue lighting with warm eyes',
    negativePrompt:
      'realistic photo, warm orange colors, dark horror, deformed, ugly, bad anatomy',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.65,
      styleStrength: 0.85,
      guidanceScale: 8,
      numInferenceSteps: 30,
    },
  },

  toy_story_clouds: {
    styleId: 'toy_story_clouds',
    avatarPrompt:
      'Pixar Toy Story style portrait, bright blue cloudy sky background, cheerful happy expression, Pixar 3D character design, vibrant saturated colors, friendly welcoming cartoon look, smooth plastic-like skin texture, perfect Pixar quality',
    negativePrompt:
      'realistic photo, dark, horror, deformed, ugly, anime, 2D flat, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.6,
      styleStrength: 0.9,
      guidanceScale: 8,
      numInferenceSteps: 35,
    },
  },

  shrek_swamp_sunset: {
    styleId: 'shrek_swamp_sunset',
    avatarPrompt:
      'DreamWorks animation style portrait, Shrek movie fairytale aesthetic, warm orange sunset colors, playful loving expression, green nature swamp background, DreamWorks 3D animation quality, magical golden hour lighting, friendly character design',
    negativePrompt:
      'realistic photo, dark horror, deformed, ugly, green skin, ogre features, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.65,
      styleStrength: 0.85,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  // ========================================
  // VINTAGE/ARTISTIC STYLES (4)
  // ========================================

  watercolor_handpainted: {
    styleId: 'watercolor_handpainted',
    avatarPrompt:
      'Watercolor portrait painting, soft hand-painted artistic aesthetic, delicate flowing brush strokes, cream textured paper background, romantic dreamy illustration style, muted pastel colors, traditional art medium, beautiful soft features',
    negativePrompt:
      'photorealistic, digital art, harsh lines, dark, horror, deformed, ugly, sharp edges',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 6,
      numInferenceSteps: 30,
    },
  },

  vintage_super8: {
    styleId: 'vintage_super8',
    avatarPrompt:
      'Vintage Super 8 film aesthetic portrait, warm sepia nostalgic tones, authentic film grain texture, 1970s photography style, soft romantic atmosphere, slight soft focus, light leaks effect, retro color grading',
    negativePrompt:
      'digital clean, modern style, cold colors, dark horror, deformed, ugly, sharp digital',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.6,
      guidanceScale: 6,
      numInferenceSteps: 25,
    },
  },

  polaroid_memories: {
    styleId: 'polaroid_memories',
    avatarPrompt:
      'Polaroid instant photo aesthetic portrait, slightly faded vintage colors, authentic instant camera look, white polaroid frame border, nostalgic 90s feel, candid natural photo style, warm soft lighting',
    negativePrompt:
      'digital HDR, overly saturated, dark, horror, deformed, ugly, sharp modern',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.85,
      styleStrength: 0.5,
      guidanceScale: 5,
      numInferenceSteps: 25,
    },
  },

  rainy_paris: {
    styleId: 'rainy_paris',
    avatarPrompt:
      'Romantic rainy Paris atmosphere portrait, moody cinematic European aesthetic, soft blue-grey tones, rain-blurred window background, soft window lighting, romantic French cafe mood, artistic photography style',
    negativePrompt:
      'bright sunny, harsh light, dark horror, deformed, ugly, cartoon anime style',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.6,
      guidanceScale: 6,
      numInferenceSteps: 30,
    },
  },

  // ========================================
  // CINEMATIC/SCI-FI STYLES (8)
  // ========================================

  star_wars_hyperspace: {
    styleId: 'star_wars_hyperspace',
    avatarPrompt:
      'Star Wars cinematic portrait, sci-fi space hero character, blue hyperspace streaks background, dramatic lens flares, epic space atmosphere, heroic confident expression, cinematic movie lighting, professional film quality',
    negativePrompt:
      'cartoon, anime, bright pastel colors, dark horror, deformed, ugly, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  marvel_cinematic: {
    styleId: 'marvel_cinematic',
    avatarPrompt:
      'Marvel Cinematic Universe style portrait, MCU superhero movie aesthetic, teal-orange cinematic color grading, dramatic heroic lighting, confident powerful expression, movie poster quality, professional film photography',
    negativePrompt:
      'cartoon, anime, bright pastel, dark horror, deformed, ugly, amateur quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.65,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  la_la_land_sunset: {
    styleId: 'la_la_land_sunset',
    avatarPrompt:
      'La La Land movie aesthetic portrait, purple-pink-orange magical sunset gradient background, dreamy Hollywood romance atmosphere, golden hour cinematic lighting, romantic loving expression, beautiful bokeh lights, movie still quality',
    negativePrompt:
      'cold colors, dark horror, deformed, ugly, anime cartoon style, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.65,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  harry_potter_great_hall: {
    styleId: 'harry_potter_great_hall',
    avatarPrompt:
      'Harry Potter movie aesthetic portrait, magical Hogwarts Great Hall atmosphere, warm candlelight glow, golden floating sparkles, mysterious castle background, wizarding world character, enchanted magical mood, cinematic film quality',
    negativePrompt:
      'modern contemporary, sci-fi, dark horror, deformed, ugly, cartoon anime style',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  notebook_rain_kiss: {
    styleId: 'notebook_rain_kiss',
    avatarPrompt:
      'The Notebook movie aesthetic portrait, dramatic romantic rain scene, intense passionate atmosphere, stormy blue-grey tones, deep emotional expression, classic romance movie cinematography, rain drops visible, professional film quality',
    negativePrompt:
      'sunny bright, cartoon, anime, dark horror, deformed, ugly, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.65,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  pride_prejudice_fields: {
    styleId: 'pride_prejudice_fields',
    avatarPrompt:
      'Pride and Prejudice movie aesthetic portrait, golden hour English countryside, period drama Regency era style, warm sepia romantic tones, elegant refined expression, flowing nature meadow background, classic romantic film quality',
    negativePrompt:
      'modern urban, dark horror, deformed, ugly, cartoon anime style, contemporary',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.6,
      guidanceScale: 6,
      numInferenceSteps: 30,
    },
  },

  interstellar_galaxy: {
    styleId: 'interstellar_galaxy',
    avatarPrompt:
      'Interstellar movie aesthetic portrait, deep space purple-blue nebula background, cosmic atmosphere, sci-fi astronaut character, epic cinematic lighting, awe-inspiring expression, galaxy stars visible, Christopher Nolan film quality',
    negativePrompt:
      'cartoon, anime, earth indoor background, dark horror, deformed, ugly, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  scifi_stardust: {
    styleId: 'scifi_stardust',
    avatarPrompt:
      'Sci-fi stardust aesthetic portrait, neon cyan particles floating, dark blue space background, futuristic character, cyberpunk influenced lighting, holographic glow effects, mysterious expression, high-tech atmosphere',
    negativePrompt:
      'nature outdoor, cartoon anime, warm colors, horror, deformed, ugly, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  // ========================================
  // FANTASY STYLES (1)
  // ========================================

  steampunk_brass: {
    styleId: 'steampunk_brass',
    avatarPrompt:
      'Steampunk portrait, brass and copper Victorian aesthetic, clockwork gear background, warm sepia bronze tones, steam wisps, industrial fantasy style, vintage goggles accessories, adventurous expression, detailed ornate design',
    negativePrompt:
      'modern clean, digital, dark horror, deformed, ugly, anime cartoon style',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.7,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },

  // ========================================
  // CULTURAL STYLES (3)
  // ========================================

  bollywood_dream: {
    styleId: 'bollywood_dream',
    avatarPrompt:
      'Bollywood movie poster aesthetic portrait, vibrant magenta pink and gold colors, glamorous star expression, marigold flower petals, traditional Indian beauty aesthetic, dramatic sparkle effects, rich saturated colors, Bollywood romance style',
    negativePrompt:
      'pale muted colors, dark horror, deformed, ugly, western plain style, low quality',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.75,
      styleStrength: 0.75,
      guidanceScale: 8,
      numInferenceSteps: 30,
    },
  },

  kdrama_cherry_blossom: {
    styleId: 'kdrama_cherry_blossom',
    avatarPrompt:
      'Korean drama aesthetic portrait, soft pastel pink cherry blossom background, romantic K-drama soft lighting, clear beautiful skin, gentle loving expression, Seoul spring atmosphere, dreamy romantic mood, Korean beauty style',
    negativePrompt:
      'dark gloomy, horror, deformed, ugly, harsh lighting, western gritty style',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.65,
      guidanceScale: 6,
      numInferenceSteps: 30,
    },
  },

  valentine_roses: {
    styleId: 'valentine_roses',
    avatarPrompt:
      'Romantic Valentine portrait, deep red rose petals background, passionate red and pink colors, romantic couple aesthetic, heart motifs subtle, soft romantic warm lighting, loving intimate expression, romantic photography style',
    negativePrompt:
      'cold blue colors, dark horror, deformed, ugly, plain empty background',
    modelId: INSTANT_ID_MODEL,
    settings: {
      identityStrength: 0.8,
      styleStrength: 0.65,
      guidanceScale: 7,
      numInferenceSteps: 30,
    },
  },
};

// ========================================
// Helper Functions
// ========================================

export function getAvatarStyleConfig(styleId: CinematicStyleId): AvatarStyleConfig {
  return AVATAR_STYLE_CONFIGS[styleId] || AVATAR_STYLE_CONFIGS.ghibli_cherry_blossoms;
}

export function getAllStyleIds(): CinematicStyleId[] {
  return Object.keys(AVATAR_STYLE_CONFIGS) as CinematicStyleId[];
}

export function getStylesByCategory(category: 'animation' | 'vintage' | 'cinematic' | 'fantasy' | 'cultural'): CinematicStyleId[] {
  const categories: Record<string, CinematicStyleId[]> = {
    animation: [
      'ghibli_cherry_blossoms',
      'howls_castle_night',
      'disney_castle_fireworks',
      'tangled_lanterns',
      'pixar_up_balloons',
      'frozen_aurora',
      'toy_story_clouds',
      'shrek_swamp_sunset',
    ],
    vintage: [
      'watercolor_handpainted',
      'vintage_super8',
      'polaroid_memories',
      'rainy_paris',
    ],
    cinematic: [
      'star_wars_hyperspace',
      'marvel_cinematic',
      'la_la_land_sunset',
      'harry_potter_great_hall',
      'notebook_rain_kiss',
      'pride_prejudice_fields',
      'interstellar_galaxy',
      'scifi_stardust',
    ],
    fantasy: ['steampunk_brass'],
    cultural: ['bollywood_dream', 'kdrama_cherry_blossom', 'valentine_roses'],
  };

  return categories[category] || [];
}
