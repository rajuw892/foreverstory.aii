// ========================================
// ForeverStory.ai - Type Definitions
// ========================================

export type StoryStatus =
  | 'queued'
  | 'uploading_photos'
  | 'processing_script'
  | 'generating_characters'
  | 'creating_scenes'
  | 'generating_video'
  | 'recording_narration'
  | 'rendering_frames'
  | 'compiling'
  | 'completed'
  | 'failed';

export type ArtStyle =
  | 'ghibli'
  | 'anime'
  | 'pixar'
  | 'disney'
  | 'arcane';

// 24 Cinematic Style IDs (matches backend)
export type CinematicStyleId =
  // Animation Styles (8)
  | 'ghibli_cherry_blossoms'
  | 'howls_castle_night'
  | 'disney_castle_fireworks'
  | 'tangled_lanterns'
  | 'pixar_up_balloons'
  | 'frozen_aurora'
  | 'toy_story_clouds'
  | 'shrek_swamp_sunset'
  // Vintage/Artistic Styles (4)
  | 'watercolor_handpainted'
  | 'vintage_super8'
  | 'polaroid_memories'
  | 'rainy_paris'
  // Cinematic/Sci-Fi Styles (8)
  | 'star_wars_hyperspace'
  | 'marvel_cinematic'
  | 'la_la_land_sunset'
  | 'harry_potter_great_hall'
  | 'notebook_rain_kiss'
  | 'pride_prejudice_fields'
  | 'interstellar_galaxy'
  | 'scifi_stardust'
  // Fantasy Styles (1)
  | 'steampunk_brass'
  // Cultural Styles (3)
  | 'bollywood_dream'
  | 'kdrama_cherry_blossom'
  | 'valentine_roses';

export type StyleCategory = 'animation' | 'vintage' | 'cinematic' | 'fantasy' | 'cultural';

export interface CinematicStyleConfig {
  id: CinematicStyleId;
  name: string;
  description: string;
  category: StyleCategory;
  emoji: string;
  gradient: string[];
  previewColor: string;
}

export type SupportedLanguage =
  | 'en' | 'hi' | 'es' | 'id' | 'pt'
  | 'ar' | 'ko' | 'tr' | 'bn' | 'vi'
  | 'fr' | 'de';

// Voice Selection Types
export type VoiceId =
  | 'rachel' | 'drew' | 'clyde' | 'paul' | 'domi'
  | 'dave' | 'fin' | 'sarah' | 'antoni' | 'thomas';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  description: string;
  gender: 'male' | 'female';
  accent: string;
  previewUrl: string;
  elevenLabsId: string;
}

// Music Selection Types
export type MusicTrackId =
  | 'romantic_piano' | 'gentle_strings' | 'dreamy_acoustic'
  | 'cinematic_love' | 'soft_orchestral';

export interface MusicTrack {
  id: MusicTrackId;
  name: string;
  description: string;
  duration: string;
  mood: string;
  previewUrl: string;
  fullUrl: string;
}

// Theme Selection Types
export type VideoThemeId =
  | 'sunset_romance' | 'starry_night' | 'cherry_blossom'
  | 'ocean_waves' | 'golden_autumn' | 'winter_wonderland'
  | 'tropical_paradise' | 'city_lights';

export interface VideoTheme {
  id: VideoThemeId;
  name: string;
  description: string;
  previewVideoUrl: string;
  backgroundVideoUrl: string;
  thumbnailUrl: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  particles?: 'sparkles' | 'hearts' | 'petals' | 'snow' | 'fireflies' | 'stars';
}

export interface StoryFormData {
  // Step 1: Names
  coupleNames: string;

  // Step 2: How you met
  howMet: string;

  // Step 3: First date
  firstDate: string;

  // Step 4: I love you
  iLoveYou: string;

  // Step 5: Inside joke
  insideJoke: string;

  // Step 6: Adventure
  adventure: string;

  // Step 7: Future dream
  futureDream: string;

  // Step 8: Photos
  photos: string[];

  // Step 9: Voice selection
  voiceId: VoiceId;

  // Step 10: Music selection
  musicTrackId: MusicTrackId;

  // Step 11: Theme selection (legacy - kept for backwards compatibility)
  videoThemeId: VideoThemeId;

  // Style selection (art style - legacy)
  artStyle: ArtStyle;

  // Step 11 (NEW): Cinematic style selection (24 styles)
  cinematicStyleId: CinematicStyleId;

  // Language (auto-detected or selected)
  language: SupportedLanguage;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  visualDescription: string;
  narration: string;
  emotionalTone: string;
  duration: number; // in seconds
}

export interface GeneratedScript {
  title: string;
  scenes: Scene[];
  totalDuration: number;
  language: SupportedLanguage;
}

export interface Story {
  id: string;
  user_id: string | null;
  status: StoryStatus;
  story_data: StoryFormData;
  script?: GeneratedScript;
  character_images?: string[];
  scene_images?: string[];
  scene_videos?: string[];
  voiceover_url?: string;
  video_url?: string;
  watermarked_video_url?: string;
  paid: boolean;
  error_message?: string;
  progress: number;
  current_step?: string;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  story_id: string;
  amount: number;
  currency: string;
  stripe_payment_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface JobPayload {
  storyId: string;
  storyData: StoryFormData;
  photoUrls: string[];
}

export interface StatusResponse {
  status: StoryStatus;
  progress: number;
  currentStep: string;
  videoUrl?: string;
  watermarkedVideoUrl?: string;
  error?: string;
}

// AI Service Types
export interface ReplicateInput {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
}

export interface KlingInput {
  image: string;
  prompt: string;
  duration: number;
  aspect_ratio: string;
}

export interface ElevenLabsInput {
  text: string;
  voice_id: string;
  model_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

// Style Configuration
export interface StyleConfig {
  id: ArtStyle;
  name: string;
  description: string;
  replicateModel: string;
  promptPrefix: string;
  promptSuffix: string;
  negativePrompt: string;
  previewImage: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Form Step Configuration
export interface FormStep {
  id: number;
  title: string;
  subtitle: string;
  field: keyof StoryFormData;
  placeholder: string;
  maxLength: number;
  icon: string;
  voiceEnabled: boolean;
}
