// ========================================
// ForeverStory.ai - Type Definitions
// ========================================

export type StoryStatus =
  | 'queued'
  | 'processing_script'
  | 'generating_characters'
  | 'creating_scenes'
  | 'generating_video'
  | 'adding_voice'
  | 'compiling'
  | 'completed'
  | 'failed';

export type ArtStyle =
  | 'ghibli'
  | 'anime'
  | 'pixar'
  | 'disney'
  | 'arcane';

export type SupportedLanguage =
  | 'en' | 'hi' | 'es' | 'id' | 'pt'
  | 'ar' | 'ko' | 'tr' | 'bn' | 'vi'
  | 'fr' | 'de';

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

  // Style selection
  artStyle: ArtStyle;

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
