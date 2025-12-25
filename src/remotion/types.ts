// ========================================
// Remotion Video Types
// ========================================

export type GhibliTheme =
  | 'cherry_blossoms'
  | 'howls_castle'
  | 'spirited_train'
  | 'totoro_bus_stop'
  | 'sky_garden'
  | 'forest_meadow'
  | 'kikis_seaside'
  | 'mononoke_forest';

export interface ThemeConfig {
  id: GhibliTheme;
  name: string;
  description: string;
  backgroundVideoUrl: string;
  particleType: 'sakura' | 'fireflies' | 'rain' | 'leaves' | 'stars' | 'bubbles' | 'sparkles' | 'snow';
  frameStyle: 'polaroid' | 'vignette' | 'soft_edges' | 'vintage';
  colorGrading: {
    saturation: number;
    brightness: number;
    contrast: number;
    temperature: number; // -1 cool to 1 warm
  };
  titleFont: string;
  accentColor: string;
}

export interface VideoCompositionProps {
  // Story content
  coupleNames: string;
  answers: {
    howMet: string;
    firstDate: string;
    iLoveYou: string;
    insideJoke: string;
    adventure: string;
    futureDream: string;
  };

  // Media
  photos: string[];
  narrationAudioUrl: string;
  backgroundMusicUrl: string;

  // Customization
  theme: GhibliTheme;
  voiceId: string;

  // Timing
  durationInFrames: number;
  fps: number;
}

export interface KenBurnsConfig {
  startScale: number;
  endScale: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // in frames
}

export interface SceneConfig {
  photoUrl: string;
  narrationText: string;
  kenBurns: KenBurnsConfig;
  startFrame: number;
  endFrame: number;
}

// Edge-TTS Voice options
export interface EdgeTTSVoice {
  id: string;
  name: string;
  shortName: string;
  gender: 'male' | 'female';
  locale: string;
  description: string;
}

export const EDGE_TTS_VOICES: EdgeTTSVoice[] = [
  {
    id: 'aria',
    name: 'Aria',
    shortName: 'en-US-AriaNeural',
    gender: 'female',
    locale: 'en-US',
    description: 'Warm and expressive, perfect for romantic stories',
  },
  {
    id: 'jenny',
    name: 'Jenny',
    shortName: 'en-US-JennyNeural',
    gender: 'female',
    locale: 'en-US',
    description: 'Clear and friendly conversational voice',
  },
  {
    id: 'guy',
    name: 'Guy',
    shortName: 'en-US-GuyNeural',
    gender: 'male',
    locale: 'en-US',
    description: 'Deep and soothing narrator voice',
  },
  {
    id: 'sara',
    name: 'Sara',
    shortName: 'en-US-SaraNeural',
    gender: 'female',
    locale: 'en-US',
    description: 'Soft and gentle storyteller',
  },
  {
    id: 'davis',
    name: 'Davis',
    shortName: 'en-US-DavisNeural',
    gender: 'male',
    locale: 'en-US',
    description: 'Calm and reassuring voice',
  },
  {
    id: 'emma',
    name: 'Emma',
    shortName: 'en-GB-SoniaNeural',
    gender: 'female',
    locale: 'en-GB',
    description: 'British accent, elegant and sophisticated',
  },
  {
    id: 'ryan',
    name: 'Ryan',
    shortName: 'en-GB-RyanNeural',
    gender: 'male',
    locale: 'en-GB',
    description: 'British accent, warm and trustworthy',
  },
  {
    id: 'natasha',
    name: 'Natasha',
    shortName: 'en-AU-NatashaNeural',
    gender: 'female',
    locale: 'en-AU',
    description: 'Australian accent, friendly and approachable',
  },
  {
    id: 'william',
    name: 'William',
    shortName: 'en-AU-WilliamNeural',
    gender: 'male',
    locale: 'en-AU',
    description: 'Australian accent, relaxed and natural',
  },
  {
    id: 'ana',
    name: 'Ana',
    shortName: 'es-ES-ElviraNeural',
    gender: 'female',
    locale: 'es-ES',
    description: 'Spanish voice, passionate and melodic',
  },
];

// Theme configurations with real free asset URLs
export const GHIBLI_THEMES: Record<GhibliTheme, ThemeConfig> = {
  cherry_blossoms: {
    id: 'cherry_blossoms',
    name: 'Whisper of the Cherry Blossoms',
    description: 'Soft pink petals dancing in a gentle spring breeze',
    backgroundVideoUrl: '/video/themes/cherry-blossoms-bg.mp4',
    particleType: 'sakura',
    frameStyle: 'soft_edges',
    colorGrading: {
      saturation: 1.1,
      brightness: 1.05,
      contrast: 0.95,
      temperature: 0.2,
    },
    titleFont: 'serif',
    accentColor: '#FFB7C5',
  },
  howls_castle: {
    id: 'howls_castle',
    name: "Howl's Moving Castle Rooftop at Night",
    description: 'Magical starlit sky with floating lights',
    backgroundVideoUrl: '/video/themes/howls-castle-bg.mp4',
    particleType: 'stars',
    frameStyle: 'vignette',
    colorGrading: {
      saturation: 1.0,
      brightness: 0.9,
      contrast: 1.1,
      temperature: -0.2,
    },
    titleFont: 'serif',
    accentColor: '#4169E1',
  },
  spirited_train: {
    id: 'spirited_train',
    name: 'Spirited Away Train on Water',
    description: 'Serene journey over an endless ocean at dusk',
    backgroundVideoUrl: '/video/themes/spirited-train-bg.mp4',
    particleType: 'sparkles',
    frameStyle: 'vintage',
    colorGrading: {
      saturation: 0.95,
      brightness: 1.0,
      contrast: 1.0,
      temperature: 0.1,
    },
    titleFont: 'serif',
    accentColor: '#87CEEB',
  },
  totoro_bus_stop: {
    id: 'totoro_bus_stop',
    name: "Totoro's Rainy Bus Stop",
    description: 'Cozy rainy evening with gentle droplets',
    backgroundVideoUrl: '/video/themes/totoro-bus-stop-bg.mp4',
    particleType: 'rain',
    frameStyle: 'soft_edges',
    colorGrading: {
      saturation: 0.9,
      brightness: 0.95,
      contrast: 1.05,
      temperature: -0.1,
    },
    titleFont: 'serif',
    accentColor: '#2E8B57',
  },
  sky_garden: {
    id: 'sky_garden',
    name: 'Castle in the Sky Floating Garden',
    description: 'Ethereal floating islands bathed in golden light',
    backgroundVideoUrl: '/video/themes/sky-garden-bg.mp4',
    particleType: 'bubbles',
    frameStyle: 'polaroid',
    colorGrading: {
      saturation: 1.15,
      brightness: 1.1,
      contrast: 0.9,
      temperature: 0.3,
    },
    titleFont: 'serif',
    accentColor: '#FFD700',
  },
  forest_meadow: {
    id: 'forest_meadow',
    name: 'My Neighbor Totoro Forest Meadow',
    description: 'Sunlit clearing in an enchanted forest',
    backgroundVideoUrl: '/video/themes/forest-meadow-bg.mp4',
    particleType: 'leaves',
    frameStyle: 'soft_edges',
    colorGrading: {
      saturation: 1.2,
      brightness: 1.05,
      contrast: 0.95,
      temperature: 0.15,
    },
    titleFont: 'serif',
    accentColor: '#90EE90',
  },
  kikis_seaside: {
    id: 'kikis_seaside',
    name: "Kiki's Delivery Service Seaside Town",
    description: 'Mediterranean coastline with warm afternoon sun',
    backgroundVideoUrl: '/video/themes/kikis-seaside-bg.mp4',
    particleType: 'sparkles',
    frameStyle: 'polaroid',
    colorGrading: {
      saturation: 1.1,
      brightness: 1.1,
      contrast: 1.0,
      temperature: 0.25,
    },
    titleFont: 'serif',
    accentColor: '#FF6347',
  },
  mononoke_forest: {
    id: 'mononoke_forest',
    name: 'Princess Mononoke Moonlit Forest',
    description: 'Mystical ancient forest under silver moonlight',
    backgroundVideoUrl: '/video/themes/mononoke-forest-bg.mp4',
    particleType: 'fireflies',
    frameStyle: 'vignette',
    colorGrading: {
      saturation: 0.95,
      brightness: 0.85,
      contrast: 1.15,
      temperature: -0.15,
    },
    titleFont: 'serif',
    accentColor: '#9370DB',
  },
};

// Background music tracks (royalty-free)
export const BACKGROUND_MUSIC = [
  {
    id: 'romantic_piano',
    name: 'Romantic Piano',
    url: '/audio/music/romantic-piano.mp3',
    duration: 180,
    mood: 'tender',
  },
  {
    id: 'gentle_strings',
    name: 'Gentle Strings',
    url: '/audio/music/gentle-strings.mp3',
    duration: 200,
    mood: 'emotional',
  },
  {
    id: 'dreamy_acoustic',
    name: 'Dreamy Acoustic',
    url: '/audio/music/dreamy-acoustic.mp3',
    duration: 190,
    mood: 'nostalgic',
  },
  {
    id: 'cinematic_love',
    name: 'Cinematic Love',
    url: '/audio/music/cinematic-love.mp3',
    duration: 210,
    mood: 'grand',
  },
  {
    id: 'soft_orchestral',
    name: 'Soft Orchestral',
    url: '/audio/music/soft-orchestral.mp3',
    duration: 195,
    mood: 'graceful',
  },
];
