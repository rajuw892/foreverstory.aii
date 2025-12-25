import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoryFormData, ArtStyle, SupportedLanguage, VoiceId, MusicTrackId, VideoThemeId, CinematicStyleId } from '@/types';

// Total steps: 7 questions + 1 photos + 1 voice + 1 music + 1 cinematic style = 11 steps
// (Removed legacy art style step, now using 24 cinematic styles)
const TOTAL_STEPS = 11;

interface StoryFormState {
  currentStep: number;
  formData: StoryFormData;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<StoryFormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialFormData: StoryFormData = {
  coupleNames: '',
  howMet: '',
  firstDate: '',
  iLoveYou: '',
  insideJoke: '',
  adventure: '',
  futureDream: '',
  photos: [],
  voiceId: 'rachel',
  musicTrackId: 'romantic_piano',
  videoThemeId: 'sunset_romance', // Legacy - kept for compatibility
  artStyle: 'ghibli', // Legacy - kept for compatibility
  cinematicStyleId: 'ghibli_cherry_blossoms', // NEW: 24 cinematic styles
  language: 'en',
};

export const useStoryForm = create<StoryFormState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: initialFormData,
      setCurrentStep: (step) => set({ currentStep: step }),
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetForm: () =>
        set({
          currentStep: 1,
          formData: initialFormData,
        }),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),
    }),
    {
      name: 'foreverstory-form',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        formData: state.formData,
      }),
    }
  )
);

export const TOTAL_FORM_STEPS = TOTAL_STEPS;

// Job status store
interface JobState {
  jobId: string | null;
  status: string;
  progress: number;
  currentStep: string;
  videoUrl: string | null;
  watermarkedVideoUrl: string | null;
  error: string | null;
  setJobId: (id: string) => void;
  updateStatus: (data: Partial<JobState>) => void;
  reset: () => void;
}

export const useJobStore = create<JobState>()((set) => ({
  jobId: null,
  status: 'idle',
  progress: 0,
  currentStep: '',
  videoUrl: null,
  watermarkedVideoUrl: null,
  error: null,
  setJobId: (id) => set({ jobId: id }),
  updateStatus: (data) => set((state) => ({ ...state, ...data })),
  reset: () =>
    set({
      jobId: null,
      status: 'idle',
      progress: 0,
      currentStep: '',
      videoUrl: null,
      watermarkedVideoUrl: null,
      error: null,
    }),
}));
