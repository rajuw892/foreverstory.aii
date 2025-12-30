import { StyleConfig, FormStep, SupportedLanguage, VoiceOption, MusicTrack, VideoTheme, VoiceId, MusicTrackId, VideoThemeId, CinematicStyleId, CinematicStyleConfig } from '@/types';

// ========================================
// Voice Selection Configuration (10 voices)
// ========================================

export const VOICE_OPTIONS: Record<VoiceId, VoiceOption> = {
  rachel: {
    id: 'rachel',
    name: 'Rachel',
    description: 'Warm and soothing, perfect for romantic stories',
    gender: 'female',
    accent: 'American',
    previewUrl: '/audio/voices/rachel-preview.mp3',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
  },
  drew: {
    id: 'drew',
    name: 'Drew',
    description: 'Deep and calming, great for heartfelt narration',
    gender: 'male',
    accent: 'American',
    previewUrl: '/audio/voices/drew-preview.mp3',
    elevenLabsId: '29vD33N1CtxCmqQRPOHJ',
  },
  clyde: {
    id: 'clyde',
    name: 'Clyde',
    description: 'Rich and expressive storyteller voice',
    gender: 'male',
    accent: 'American',
    previewUrl: '/audio/voices/clyde-preview.mp3',
    elevenLabsId: '2EiwWnXFnvU5JabPnv8n',
  },
  paul: {
    id: 'paul',
    name: 'Paul',
    description: 'Gentle and sincere, ideal for love stories',
    gender: 'male',
    accent: 'American',
    previewUrl: '/audio/voices/paul-preview.mp3',
    elevenLabsId: '5Q0t7uMcjvnagumLfvZi',
  },
  domi: {
    id: 'domi',
    name: 'Domi',
    description: 'Soft and melodic, adds emotional depth',
    gender: 'female',
    accent: 'American',
    previewUrl: '/audio/voices/domi-preview.mp3',
    elevenLabsId: 'AZnzlk1XvdvUeBnXmlld',
  },
  dave: {
    id: 'dave',
    name: 'Dave',
    description: 'Conversational and friendly tone',
    gender: 'male',
    accent: 'British',
    previewUrl: '/audio/voices/dave-preview.mp3',
    elevenLabsId: 'CYw3kZ02Hs0563khs1Fj',
  },
  fin: {
    id: 'fin',
    name: 'Fin',
    description: 'Youthful and enthusiastic energy',
    gender: 'male',
    accent: 'Irish',
    previewUrl: '/audio/voices/fin-preview.mp3',
    elevenLabsId: 'D38z5RcWu1voky8WS1ja',
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah',
    description: 'Elegant and sophisticated narrator',
    gender: 'female',
    accent: 'American',
    previewUrl: '/audio/voices/sarah-preview.mp3',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
  },
  antoni: {
    id: 'antoni',
    name: 'Antoni',
    description: 'Passionate and emotive delivery',
    gender: 'male',
    accent: 'American',
    previewUrl: '/audio/voices/antoni-preview.mp3',
    elevenLabsId: 'ErXwobaYiN019PkySvjV',
  },
  thomas: {
    id: 'thomas',
    name: 'Thomas',
    description: 'Classic and timeless narrator voice',
    gender: 'male',
    accent: 'British',
    previewUrl: '/audio/voices/thomas-preview.mp3',
    elevenLabsId: 'GBv7mTt0atIp3Br8iCZE',
  },
};

// ========================================
// Music Track Configuration (5 tracks)
// ========================================

export const MUSIC_TRACKS: Record<MusicTrackId, MusicTrack> = {
  romantic_piano: {
    id: 'romantic_piano',
    name: 'Romantic Piano',
    description: 'Gentle piano melody that captures the essence of love',
    duration: '3:24',
    mood: 'Tender & Intimate',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3',
    fullUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3',
  },
  gentle_strings: {
    id: 'gentle_strings',
    name: 'Gentle Strings',
    description: 'Orchestral strings that swell with emotion',
    duration: '4:12',
    mood: 'Emotional & Sweeping',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    fullUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  dreamy_acoustic: {
    id: 'dreamy_acoustic',
    name: 'Dreamy Acoustic',
    description: 'Soft acoustic guitar with ambient textures',
    duration: '3:45',
    mood: 'Warm & Nostalgic',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c9d6c62176.mp3',
    fullUrl: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_c9d6c62176.mp3',
  },
  cinematic_love: {
    id: 'cinematic_love',
    name: 'Cinematic Love',
    description: 'Epic orchestral piece perfect for your movie moment',
    duration: '4:30',
    mood: 'Grand & Romantic',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5c20c.mp3',
    fullUrl: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5c20c.mp3',
  },
  soft_orchestral: {
    id: 'soft_orchestral',
    name: 'Soft Orchestral',
    description: 'Delicate orchestral arrangement with subtle crescendos',
    duration: '3:58',
    mood: 'Elegant & Graceful',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_550758e784.mp3',
    fullUrl: 'https://cdn.pixabay.com/download/audio/2023/02/28/audio_550758e784.mp3',
  },
};

// ========================================
// Video Theme Configuration (8 themes)
// ========================================

export const VIDEO_THEMES: Record<VideoThemeId, VideoTheme> = {
  sunset_romance: {
    id: 'sunset_romance',
    name: 'Sunset Romance',
    description: 'Golden hour glow with warm orange and pink hues',
    previewVideoUrl: '/video/themes/sunset-romance-preview.mp4',
    backgroundVideoUrl: '/video/themes/sunset-romance-bg.mp4',
    thumbnailUrl: '/images/themes/sunset-romance-thumb.jpg',
    colorPalette: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFD700',
      text: '#FFFFFF',
    },
    particles: 'sparkles',
  },
  starry_night: {
    id: 'starry_night',
    name: 'Starry Night',
    description: 'Magical night sky filled with twinkling stars',
    previewVideoUrl: '/video/themes/starry-night-preview.mp4',
    backgroundVideoUrl: '/video/themes/starry-night-bg.mp4',
    thumbnailUrl: '/images/themes/starry-night-thumb.jpg',
    colorPalette: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#e94560',
      text: '#FFFFFF',
    },
    particles: 'stars',
  },
  cherry_blossom: {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    description: 'Soft pink petals floating in a spring breeze',
    previewVideoUrl: '/video/themes/cherry-blossom-preview.mp4',
    backgroundVideoUrl: '/video/themes/cherry-blossom-bg.mp4',
    thumbnailUrl: '/images/themes/cherry-blossom-thumb.jpg',
    colorPalette: {
      primary: '#FFB7C5',
      secondary: '#FF69B4',
      accent: '#FFC0CB',
      text: '#2D2D2D',
    },
    particles: 'petals',
  },
  ocean_waves: {
    id: 'ocean_waves',
    name: 'Ocean Waves',
    description: 'Serene beach with gentle waves and ocean breeze',
    previewVideoUrl: '/video/themes/ocean-waves-preview.mp4',
    backgroundVideoUrl: '/video/themes/ocean-waves-bg.mp4',
    thumbnailUrl: '/images/themes/ocean-waves-thumb.jpg',
    colorPalette: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      text: '#FFFFFF',
    },
    particles: 'sparkles',
  },
  golden_autumn: {
    id: 'golden_autumn',
    name: 'Golden Autumn',
    description: 'Warm fall colors with rustling golden leaves',
    previewVideoUrl: '/video/themes/golden-autumn-preview.mp4',
    backgroundVideoUrl: '/video/themes/golden-autumn-bg.mp4',
    thumbnailUrl: '/images/themes/golden-autumn-thumb.jpg',
    colorPalette: {
      primary: '#D4A373',
      secondary: '#CCD5AE',
      accent: '#E9EDC9',
      text: '#2D2D2D',
    },
    particles: 'petals',
  },
  winter_wonderland: {
    id: 'winter_wonderland',
    name: 'Winter Wonderland',
    description: 'Magical snowy landscape with soft falling snow',
    previewVideoUrl: '/video/themes/winter-wonderland-preview.mp4',
    backgroundVideoUrl: '/video/themes/winter-wonderland-bg.mp4',
    thumbnailUrl: '/images/themes/winter-wonderland-thumb.jpg',
    colorPalette: {
      primary: '#A8DADC',
      secondary: '#457B9D',
      accent: '#F1FAEE',
      text: '#1D3557',
    },
    particles: 'snow',
  },
  tropical_paradise: {
    id: 'tropical_paradise',
    name: 'Tropical Paradise',
    description: 'Vibrant tropical colors with lush greenery',
    previewVideoUrl: '/video/themes/tropical-paradise-preview.mp4',
    backgroundVideoUrl: '/video/themes/tropical-paradise-bg.mp4',
    thumbnailUrl: '/images/themes/tropical-paradise-thumb.jpg',
    colorPalette: {
      primary: '#2D6A4F',
      secondary: '#40916C',
      accent: '#95D5B2',
      text: '#FFFFFF',
    },
    particles: 'fireflies',
  },
  city_lights: {
    id: 'city_lights',
    name: 'City Lights',
    description: 'Urban romance with glowing bokeh city lights',
    previewVideoUrl: '/video/themes/city-lights-preview.mp4',
    backgroundVideoUrl: '/video/themes/city-lights-bg.mp4',
    thumbnailUrl: '/images/themes/city-lights-thumb.jpg',
    colorPalette: {
      primary: '#2B2D42',
      secondary: '#8D99AE',
      accent: '#EF233C',
      text: '#FFFFFF',
    },
    particles: 'sparkles',
  },
};

// ========================================
// Art Style Configurations
// ========================================

export const STYLE_CONFIGS: Record<string, StyleConfig> = {
  ghibli: {
    id: 'ghibli',
    name: 'Studio Ghibli',
    description: 'Soft, dreamy watercolor style with magical landscapes',
    replicateModel: 'fofr/sdxl-ghibli-style',
    promptPrefix: 'Studio Ghibli anime style, soft watercolor, dreamy atmosphere,',
    promptSuffix: ', by Hayao Miyazaki, warm lighting, pastoral scenery, highly detailed, magical, whimsical',
    negativePrompt: 'realistic, photo, 3d render, dark, horror, violence, nsfw',
    previewImage: '/images/styles/ghibli-preview.jpg',
    colorScheme: {
      primary: '#7CB342',
      secondary: '#87CEEB',
      accent: '#FF7043',
    },
  },
  anime: {
    id: 'anime',
    name: 'Classic Anime',
    description: 'Beautiful Makoto Shinkai / Your Name style',
    replicateModel: 'lucataco/flux-anime',
    promptPrefix: 'Makoto Shinkai anime style, Your Name movie style, beautiful sky,',
    promptSuffix: ', cinematic lighting, lens flare, highly detailed, romantic atmosphere, vibrant colors',
    negativePrompt: 'realistic, photo, 3d render, dark, horror, violence, nsfw, low quality',
    previewImage: '/images/styles/anime-preview.jpg',
    colorScheme: {
      primary: '#E91E63',
      secondary: '#2196F3',
      accent: '#FF9800',
    },
  },
  pixar: {
    id: 'pixar',
    name: 'Pixar',
    description: '3D animated movie style with expressive characters',
    replicateModel: 'cjwbw/pixar-style-lora',
    promptPrefix: 'Pixar 3D animation style, Disney Pixar movie,',
    promptSuffix: ', expressive characters, warm lighting, highly detailed, family friendly, beautiful scenery',
    negativePrompt: 'realistic, photo, 2d, anime, dark, horror, violence, nsfw',
    previewImage: '/images/styles/pixar-preview.jpg',
    colorScheme: {
      primary: '#FF5722',
      secondary: '#4CAF50',
      accent: '#9C27B0',
    },
  },
  disney: {
    id: 'disney',
    name: 'Disney Princess',
    description: 'Magical fairytale princess animation style',
    replicateModel: 'nerdyrodent/disney-princess-diffusion',
    promptPrefix: 'Disney princess animation style, fairytale,',
    promptSuffix: ', magical sparkles, beautiful, enchanting, romantic, highly detailed, dreamy lighting',
    negativePrompt: 'realistic, photo, 3d render, dark, horror, violence, nsfw, anime',
    previewImage: '/images/styles/disney-preview.jpg',
    colorScheme: {
      primary: '#9C27B0',
      secondary: '#E91E63',
      accent: '#FFD700',
    },
  },
  arcane: {
    id: 'arcane',
    name: 'Arcane',
    description: 'Stylized League of Legends cinematic look',
    replicateModel: 'lucataco/arcane-diffusion',
    promptPrefix: 'Arcane Netflix series style, League of Legends cinematic,',
    promptSuffix: ', stylized, painterly, dramatic lighting, detailed, epic, cinematic composition',
    negativePrompt: 'realistic, photo, anime, cartoon, bright, happy, nsfw',
    previewImage: '/images/styles/arcane-preview.jpg',
    colorScheme: {
      primary: '#3F51B5',
      secondary: '#FF5722',
      accent: '#00BCD4',
    },
  },
};

// ========================================
// Form Steps Configuration
// ========================================

export const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: 'Your Names',
    subtitle: 'What should we call you two?',
    field: 'coupleNames',
    placeholder: 'e.g., "Sarah & John" or "The Johnsons"',
    maxLength: 100,
    icon: '💕',
    voiceEnabled: true,
  },
  {
    id: 2,
    title: 'How You Met',
    subtitle: 'Tell us your magical beginning',
    field: 'howMet',
    placeholder: 'We met at a coffee shop when...',
    maxLength: 300,
    icon: '✨',
    voiceEnabled: true,
  },
  {
    id: 3,
    title: 'First Date',
    subtitle: "The funniest or cutest moment",
    field: 'firstDate',
    placeholder: 'Our first date was hilarious because...',
    maxLength: 300,
    icon: '🌸',
    voiceEnabled: true,
  },
  {
    id: 4,
    title: 'I Love You',
    subtitle: 'Who said it first and how?',
    field: 'iLoveYou',
    placeholder: 'He/She said it first when...',
    maxLength: 300,
    icon: '❤️',
    voiceEnabled: true,
  },
  {
    id: 5,
    title: 'Inside Joke',
    subtitle: 'Your favorite ritual or joke',
    field: 'insideJoke',
    placeholder: 'Every morning we...',
    maxLength: 300,
    icon: '😄',
    voiceEnabled: true,
  },
  {
    id: 6,
    title: 'Adventure',
    subtitle: 'Your biggest adventure together',
    field: 'adventure',
    placeholder: 'The craziest thing we did was...',
    maxLength: 300,
    icon: '🌍',
    voiceEnabled: true,
  },
  {
    id: 7,
    title: 'Future Dream',
    subtitle: 'One dream for your future',
    field: 'futureDream',
    placeholder: 'Someday we want to...',
    maxLength: 300,
    icon: '🌟',
    voiceEnabled: true,
  },
];

// ========================================
// Language Configuration
// ========================================

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  bn: { name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
};

// ========================================
// ElevenLabs Voice Configuration
// ========================================

export const ELEVENLABS_VOICES: Record<SupportedLanguage, { voiceId: string; name: string }> = {
  en: { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel' },
  hi: { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Shreya' },
  es: { voiceId: 'ODq5zmih8GrVes37Dizd', name: 'Sofia' },
  id: { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Aria' },
  pt: { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Nicole' },
  ar: { voiceId: 'iP95p4xoKVk53GoZ742B', name: 'Layla' },
  ko: { voiceId: 'cgSgspJ2msm6clMCkdW9', name: 'Yuna' },
  tr: { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Elif' },
  bn: { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Priya' },
  vi: { voiceId: 'pMsXgVXv3BLzUgSXRplE', name: 'Linh' },
  fr: { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Charlotte' },
  de: { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Emma' },
};

// ========================================
// Pricing Configuration
// All tiers are fully animated (no Ken Burns slideshow)
// ========================================

export type VideoTier = 'basic' | 'premium' | 'deluxe';

export interface TierConfig {
  id: VideoTier;
  name: string;
  duration: number; // in seconds
  durationDisplay: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

export const VIDEO_TIERS: Record<VideoTier, TierConfig> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    duration: 30,
    durationDisplay: '30 seconds',
    description: 'Perfect teaser of your love story',
    features: [
      '30 seconds fully animated video',
      'AI-generated character avatars',
      'Animated backgrounds',
      'Professional narration',
      'Style-matched music',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    duration: 90,
    durationDisplay: '1.5 minutes',
    description: 'Complete love story experience',
    features: [
      '1.5 minutes fully animated video',
      'AI-generated character avatars',
      'Multiple animated scenes',
      'Lip-synced talking heads',
      'Professional narration',
      'Style-matched music',
      'All 24 cinematic styles',
    ],
    recommended: true,
  },
  deluxe: {
    id: 'deluxe',
    name: 'Deluxe',
    duration: 150,
    durationDisplay: '2.5 minutes',
    description: 'Ultimate animated love story movie',
    features: [
      '2.5 minutes fully animated video',
      'AI-generated character avatars',
      'Extended animated scenes',
      'Lip-synced talking heads',
      'Professional narration',
      'Style-matched music',
      'All 24 cinematic styles',
      'HD download',
      'Extended story details',
    ],
  },
};

export const PRICING = {
  basic: {
    USD: { amount: 499, display: '$4.99', currency: 'usd' },
    INR: { amount: 39900, display: '₹399', currency: 'inr' },
  },
  premium: {
    USD: { amount: 999, display: '$9.99', currency: 'usd' },
    INR: { amount: 79900, display: '₹799', currency: 'inr' },
  },
  deluxe: {
    USD: { amount: 1999, display: '$19.99', currency: 'usd' },
    INR: { amount: 149900, display: '₹1499', currency: 'inr' },
  },
};

// Legacy pricing for backwards compatibility
export const LEGACY_PRICING = {
  USD: {
    amount: 999,
    display: '$9.99',
    currency: 'usd',
  },
  INR: {
    amount: 79900,
    display: '₹799',
    currency: 'inr',
  },
};

// ========================================
// Video Configuration
// ========================================

export const VIDEO_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  sceneDuration: 15, // seconds per scene
  totalScenes: 6,
  totalDuration: 90, // seconds
  watermarkOpacity: 0.3,
  watermarkPosition: 'bottom-right',
};

// ========================================
// Processing Steps (Enhanced with detailed progress)
// ========================================

export const PROCESSING_STEPS = [
  { key: 'queued', label: 'Preparing...', progress: 0, description: 'Getting everything ready' },
  { key: 'uploading_photos', label: 'Uploading photos...', progress: 10, description: 'Securely uploading your memories' },
  { key: 'processing_script', label: 'Generating your story...', progress: 20, description: 'AI is crafting your unique narrative' },
  { key: 'generating_characters', label: 'Creating characters...', progress: 30, description: 'Bringing you to life in art' },
  { key: 'creating_scenes', label: 'Drawing scenes...', progress: 40, description: 'Painting beautiful moments' },
  { key: 'recording_narration', label: 'Recording narration...', progress: 50, description: 'Adding the perfect voice' },
  { key: 'rendering_frames', label: 'Rendering video frames...', progress: 70, description: 'Creating smooth animations' },
  { key: 'compiling', label: 'Finalizing your movie...', progress: 90, description: 'Adding final touches' },
  { key: 'completed', label: 'Complete!', progress: 100, description: 'Your story is ready!' },
];

// ========================================
// Upload/Error Configuration
// ========================================

export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  minImageDimension: 500, // pixels
  maxPhotos: 8,
  minPhotos: 2,
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxRetries: 3,
  retryDelayBase: 1000, // ms, will use exponential backoff
};

export const RENDER_CONFIG = {
  maxNarrationWords: 500,
  defaultNarrationWords: 450,
  sceneDurationSeconds: 15,
  totalScenes: 6,
  renderTimeout: 300000, // 5 minutes
  lowQualityFallback: true,
};

// Download tiers aligned with video tiers
export const DOWNLOAD_TIERS = {
  basic: {
    resolution: '720p',
    width: 1280,
    height: 720,
    watermark: true,
    watermarkOpacity: 0.1,
    watermarkPosition: 'bottom-right' as const,
    watermarkText: 'ForeverStory.ai',
    format: 'mp4',
    duration: 30,
  },
  premium: {
    resolution: '1080p',
    width: 1920,
    height: 1080,
    watermark: false,
    format: 'mp4',
    duration: 90,
  },
  deluxe: {
    resolution: '1080p',
    width: 1920,
    height: 1080,
    watermark: false,
    includes4K: true,
    includesPhotosZip: true,
    includesEditableScript: true,
    format: 'mp4',
    duration: 150,
  },
};

// ========================================
// 24 Cinematic Styles Configuration
// Matches backend src/remotion/styles.ts
// ========================================

export const CINEMATIC_STYLES: Record<CinematicStyleId, CinematicStyleConfig> = {
  // Animation Styles (8)
  ghibli_cherry_blossoms: {
    id: 'ghibli_cherry_blossoms',
    name: 'Studio Ghibli Cherry Blossoms',
    description: 'Soft pink petals dancing in a gentle spring breeze',
    category: 'animation',
    emoji: '🌸',
    gradient: ['#FFE4EC', '#FFB7C5', '#FFDAB9'],
    previewColor: '#FFB7C5',
  },
  howls_castle_night: {
    id: 'howls_castle_night',
    name: "Howl's Moving Castle Night",
    description: 'Magical starlit sky with golden embers rising slowly',
    category: 'animation',
    emoji: '✨',
    gradient: ['#0D1B2A', '#1B263B', '#415A77'],
    previewColor: '#415A77',
  },
  disney_castle_fireworks: {
    id: 'disney_castle_fireworks',
    name: 'Disney Castle Fireworks',
    description: 'Royal blue gradient with magical firework bursts',
    category: 'animation',
    emoji: '🏰',
    gradient: ['#1A1A4E', '#2E2E7A', '#4A4AA6'],
    previewColor: '#4A4AA6',
  },
  tangled_lanterns: {
    id: 'tangled_lanterns',
    name: 'Tangled Lanterns Night',
    description: 'Glowing orange lanterns against a purple night sky',
    category: 'animation',
    emoji: '🏮',
    gradient: ['#1A0A2E', '#2D1B4E', '#4A2C7A'],
    previewColor: '#FFA500',
  },
  pixar_up_balloons: {
    id: 'pixar_up_balloons',
    name: 'Pixar Up Balloons',
    description: 'Bright blue sky with colorful balloons floating upward',
    category: 'animation',
    emoji: '🎈',
    gradient: ['#87CEEB', '#ADD8E6', '#E0F7FF'],
    previewColor: '#87CEEB',
  },
  frozen_aurora: {
    id: 'frozen_aurora',
    name: 'Frozen Aurora Nights',
    description: 'Icy blue gradient with aurora borealis and gentle snowflakes',
    category: 'animation',
    emoji: '❄️',
    gradient: ['#0B132B', '#1C2541', '#5BC0BE'],
    previewColor: '#5BC0BE',
  },
  toy_story_clouds: {
    id: 'toy_story_clouds',
    name: 'Toy Story Cloudy Sky',
    description: 'Light blue sky with fluffy animated clouds',
    category: 'animation',
    emoji: '☁️',
    gradient: ['#87CEEB', '#B0E0E6', '#E6F3FF'],
    previewColor: '#87CEEB',
  },
  shrek_swamp_sunset: {
    id: 'shrek_swamp_sunset',
    name: 'Shrek Swamp Sunset',
    description: 'Orange-to-green gradient with fireflies and falling leaves',
    category: 'animation',
    emoji: '🌿',
    gradient: ['#FF8C00', '#228B22', '#006400'],
    previewColor: '#228B22',
  },

  // Vintage/Artistic Styles (4)
  watercolor_handpainted: {
    id: 'watercolor_handpainted',
    name: 'Watercolor Hand-Painted',
    description: 'Soft cream with watercolor wash texture and ink blooms',
    category: 'vintage',
    emoji: '🎨',
    gradient: ['#FFF8E7', '#FAF0E6', '#FFEFD5'],
    previewColor: '#D4A574',
  },
  vintage_super8: {
    id: 'vintage_super8',
    name: 'Vintage Super 8 Film',
    description: 'Warm sepia tones with film grain and light leaks',
    category: 'vintage',
    emoji: '📽️',
    gradient: ['#D4A574', '#C4956A', '#8B7355'],
    previewColor: '#8B7355',
  },
  polaroid_memories: {
    id: 'polaroid_memories',
    name: 'Polaroid Memories',
    description: 'Clean white aesthetic with slightly faded vintage tones',
    category: 'vintage',
    emoji: '📷',
    gradient: ['#FFFFFF', '#F5F5F5', '#EBEBEB'],
    previewColor: '#E0E0E0',
  },
  rainy_paris: {
    id: 'rainy_paris',
    name: 'Rainy Paris Window',
    description: 'Blurred city lights through rain with moody atmosphere',
    category: 'vintage',
    emoji: '🌧️',
    gradient: ['#2F4F4F', '#4A6670', '#708090'],
    previewColor: '#708090',
  },

  // Cinematic/Sci-Fi Styles (8)
  star_wars_hyperspace: {
    id: 'star_wars_hyperspace',
    name: 'Star Wars Hyperspace',
    description: 'Black with blue hyperspace streaks and lens flares',
    category: 'cinematic',
    emoji: '🚀',
    gradient: ['#000000', '#000033', '#000066'],
    previewColor: '#00BFFF',
  },
  marvel_cinematic: {
    id: 'marvel_cinematic',
    name: 'Marvel Cinematic Credits',
    description: 'Dark gradient with digital particles and teal-orange look',
    category: 'cinematic',
    emoji: '🦸',
    gradient: ['#1A1A2E', '#16213E', '#0F3460'],
    previewColor: '#E94560',
  },
  la_la_land_sunset: {
    id: 'la_la_land_sunset',
    name: 'La La Land Sunset',
    description: 'Purple-pink-orange LA sunset with dreamy bokeh',
    category: 'cinematic',
    emoji: '🌅',
    gradient: ['#4A0E4E', '#C060A1', '#FFBB5C'],
    previewColor: '#C060A1',
  },
  harry_potter_great_hall: {
    id: 'harry_potter_great_hall',
    name: 'Harry Potter Great Hall',
    description: 'Dark stone ambiance with floating candles and golden sparkles',
    category: 'fantasy',
    emoji: '⚡',
    gradient: ['#1A1A1A', '#2D2D2D', '#3D3D3D'],
    previewColor: '#FFD700',
  },
  notebook_rain_kiss: {
    id: 'notebook_rain_kiss',
    name: 'The Notebook Rain Kiss',
    description: 'Stormy blue-grey with heavy rain and dramatic contrast',
    category: 'cinematic',
    emoji: '💋',
    gradient: ['#2C3E50', '#34495E', '#5D6D7E'],
    previewColor: '#5D6D7E',
  },
  pride_prejudice_fields: {
    id: 'pride_prejudice_fields',
    name: 'Pride & Prejudice Fields',
    description: 'Golden hour fields with dandelion seeds and warm period glow',
    category: 'cinematic',
    emoji: '🌾',
    gradient: ['#DAA520', '#F0E68C', '#FFFACD'],
    previewColor: '#DAA520',
  },
  interstellar_galaxy: {
    id: 'interstellar_galaxy',
    name: 'Interstellar Galaxy',
    description: 'Deep space with vibrant nebula colors and cosmic dust',
    category: 'cinematic',
    emoji: '🌌',
    gradient: ['#000000', '#1A0533', '#3D1466'],
    previewColor: '#9B59B6',
  },
  scifi_stardust: {
    id: 'scifi_stardust',
    name: 'Sci-Fi Stardust',
    description: 'Dark blue space with neon particle formations',
    category: 'cinematic',
    emoji: '💫',
    gradient: ['#0D0D1A', '#1A1A33', '#26264D'],
    previewColor: '#00FFFF',
  },

  // Fantasy Styles (1)
  steampunk_brass: {
    id: 'steampunk_brass',
    name: 'Steampunk Brass Gears',
    description: 'Brass-to-copper gradient with steam wisps and clockwork',
    category: 'fantasy',
    emoji: '⚙️',
    gradient: ['#8B4513', '#CD853F', '#D2691E'],
    previewColor: '#CD853F',
  },

  // Cultural Styles (3)
  bollywood_dream: {
    id: 'bollywood_dream',
    name: 'Bollywood Dream Sequence',
    description: 'Vibrant magenta-to-gold with marigold petals and glitter',
    category: 'cultural',
    emoji: '🪷',
    gradient: ['#C71585', '#FF1493', '#FFD700'],
    previewColor: '#FF1493',
  },
  kdrama_cherry_blossom: {
    id: 'kdrama_cherry_blossom',
    name: 'K-Drama Cherry Blossom Road',
    description: 'Soft pastel pink with romantic swirling petals',
    category: 'cultural',
    emoji: '🇰🇷',
    gradient: ['#FFE4EC', '#FFB6C1', '#FFC0CB'],
    previewColor: '#FFB6C1',
  },
  valentine_roses: {
    id: 'valentine_roses',
    name: "Valentine's Red Roses",
    description: 'Deep red-to-pink with swirling rose petals',
    category: 'cultural',
    emoji: '🌹',
    gradient: ['#8B0000', '#DC143C', '#FF69B4'],
    previewColor: '#DC143C',
  },
};

// Style categories for UI grouping
export const STYLE_CATEGORIES = [
  { id: 'animation', name: 'Animated Movie Magic', emoji: '🎬', count: 8 },
  { id: 'vintage', name: 'Vintage & Artistic', emoji: '📼', count: 4 },
  { id: 'cinematic', name: 'Cinematic Blockbusters', emoji: '🎥', count: 6 },
  { id: 'fantasy', name: 'Fantasy & Magic', emoji: '🪄', count: 2 },
  { id: 'cultural', name: 'Cultural Romance', emoji: '🌍', count: 3 },
];
