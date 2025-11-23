import { StyleConfig, FormStep, SupportedLanguage } from '@/types';

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
// ========================================

export const PRICING = {
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
// Processing Steps
// ========================================

export const PROCESSING_STEPS = [
  { key: 'queued', label: 'Preparing...', progress: 5 },
  { key: 'processing_script', label: 'Writing your story', progress: 15 },
  { key: 'generating_characters', label: 'Creating characters', progress: 30 },
  { key: 'creating_scenes', label: 'Drawing scenes', progress: 50 },
  { key: 'generating_video', label: 'Animating scenes', progress: 70 },
  { key: 'adding_voice', label: 'Adding narration', progress: 85 },
  { key: 'compiling', label: 'Final touches', progress: 95 },
  { key: 'completed', label: 'Complete!', progress: 100 },
];
