import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoryFormData, ArtStyle, SupportedLanguage } from '@/types';

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
  artStyle: 'ghibli',
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
          currentStep: Math.min(state.currentStep + 1, 9),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),
    }),
    {
      name: 'foreverstory-form',
    }
  )
);

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
