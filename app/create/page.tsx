"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/card";
import { FloatingSparkles } from "@/components/shared/FloatingSparkles";
import { useStoryForm, TOTAL_FORM_STEPS } from "@/lib/store";
import { FORM_STEPS, STYLE_CONFIGS, VOICE_OPTIONS, MUSIC_TRACKS, VIDEO_THEMES, UPLOAD_CONFIG, CINEMATIC_STYLES, STYLE_CATEGORIES } from "@/lib/constants";
import { cn, getAnonymousId, detectLanguage } from "@/lib/utils";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Mic,
  MicOff,
  Sparkles,
  Check,
  Camera,
  Palette,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  Music,
  Film,
  AlertCircle,
} from "lucide-react";
import { ArtStyle, VoiceId, MusicTrackId, VideoThemeId, CinematicStyleId } from "@/types";

const TOTAL_STEPS = TOTAL_FORM_STEPS;

const STEP_THEMES = [
  { bg: "from-pink-100 via-rose-50 to-purple-100", accent: "pink" },
  { bg: "from-purple-100 via-violet-50 to-indigo-100", accent: "purple" },
  { bg: "from-blue-100 via-cyan-50 to-teal-100", accent: "blue" },
  { bg: "from-emerald-100 via-green-50 to-teal-100", accent: "emerald" },
  { bg: "from-amber-100 via-yellow-50 to-orange-100", accent: "amber" },
  { bg: "from-rose-100 via-pink-50 to-fuchsia-100", accent: "rose" },
  { bg: "from-indigo-100 via-purple-50 to-pink-100", accent: "indigo" },
  { bg: "from-teal-100 via-cyan-50 to-blue-100", accent: "teal" },
  { bg: "from-fuchsia-100 via-pink-50 to-rose-100", accent: "fuchsia" },
  { bg: "from-violet-100 via-purple-50 to-indigo-100", accent: "violet" },
  { bg: "from-cyan-100 via-blue-50 to-indigo-100", accent: "cyan" },
  { bg: "from-orange-100 via-amber-50 to-yellow-100", accent: "orange" },
];

export default function CreatePage() {
  const router = useRouter();
  const { currentStep, formData, updateFormData, nextStep, prevStep, setCurrentStep, resetForm } = useStoryForm();
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>(formData.photos || []);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Audio playback state
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [playingMusic, setPlayingMusic] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Cinematic style category filter
  const [activeStyleCategory, setActiveStyleCategory] = useState<string | null>(null);

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const currentTheme = STEP_THEMES[(currentStep - 1) % STEP_THEMES.length];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Placeholder content for skipped questions - AI will generate creative content
  const SKIP_PLACEHOLDERS: Record<string, string> = {
    coupleNames: "[GENERATE_NAMES]",
    howMet: "[GENERATE_MEETING]",
    firstDate: "[GENERATE_FIRST_DATE]",
    iLoveYou: "[GENERATE_CONFESSION]",
    insideJoke: "[GENERATE_INSIDE_JOKE]",
    adventure: "[GENERATE_ADVENTURE]",
    futureDream: "[GENERATE_FUTURE]",
  };

  const skipCurrentQuestion = () => {
    if (currentStep <= 7) {
      const stepConfig = FORM_STEPS[currentStep - 1];
      const currentValue = formData[stepConfig.field as keyof typeof formData] as string;

      // Only set placeholder if field is empty
      if (!currentValue || currentValue.trim() === '') {
        updateFormData({ [stepConfig.field]: SKIP_PLACEHOLDERS[stepConfig.field] || '[SKIPPED]' });
      }
      nextStep();
    }
  };

  const skipToPhotos = () => {
    // Fill in all unanswered questions with placeholders for AI generation
    const updates: Record<string, string> = {};

    if (!formData.coupleNames || formData.coupleNames.trim() === '') {
      updates.coupleNames = SKIP_PLACEHOLDERS.coupleNames;
    }
    if (!formData.howMet || formData.howMet.trim() === '') {
      updates.howMet = SKIP_PLACEHOLDERS.howMet;
    }
    if (!formData.firstDate || formData.firstDate.trim() === '') {
      updates.firstDate = SKIP_PLACEHOLDERS.firstDate;
    }
    if (!formData.iLoveYou || formData.iLoveYou.trim() === '') {
      updates.iLoveYou = SKIP_PLACEHOLDERS.iLoveYou;
    }
    if (!formData.insideJoke || formData.insideJoke.trim() === '') {
      updates.insideJoke = SKIP_PLACEHOLDERS.insideJoke;
    }
    if (!formData.adventure || formData.adventure.trim() === '') {
      updates.adventure = SKIP_PLACEHOLDERS.adventure;
    }
    if (!formData.futureDream || formData.futureDream.trim() === '') {
      updates.futureDream = SKIP_PLACEHOLDERS.futureDream;
    }

    if (Object.keys(updates).length > 0) {
      updateFormData(updates);
    }
    setCurrentStep(8);
  };

  const handleReset = () => {
    resetForm();
    setUploadedPhotos([]);
    setPhotoUrls([]);
    setUploadErrors([]);
    setCurrentStep(1);
  };

  // Voice preview playback
  const playVoicePreview = (voiceId: string, previewUrl: string) => {
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(previewUrl);
    audioRef.current.onended = () => setPlayingVoice(null);
    audioRef.current.play().catch(() => {
      // Preview not available, just select the voice
      setPlayingVoice(null);
    });
    setPlayingVoice(voiceId);
  };

  // Music preview playback
  const playMusicPreview = (trackId: string, previewUrl: string) => {
    if (playingMusic === trackId) {
      musicRef.current?.pause();
      setPlayingMusic(null);
      return;
    }

    if (musicRef.current) {
      musicRef.current.pause();
    }

    musicRef.current = new Audio(previewUrl);
    musicRef.current.onended = () => setPlayingMusic(null);
    musicRef.current.play().catch(() => {
      setPlayingMusic(null);
    });
    setPlayingMusic(trackId);
  };

  // Validate image dimensions
  const validateImage = (file: File): Promise<{ valid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width < UPLOAD_CONFIG.minImageDimension || img.height < UPLOAD_CONFIG.minImageDimension) {
          resolve({
            valid: false,
            error: `Image "${file.name}" is too small. Minimum dimension is ${UPLOAD_CONFIG.minImageDimension}px.`
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => {
        resolve({ valid: false, error: `Failed to load "${file.name}". Please try a different image.` });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    const errors: string[] = [];

    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const file = rejection.file;
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        errors.push(`"${file.name}" is too large. Maximum size is 10MB.`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        errors.push(`"${file.name}" is not a valid image type. Use JPG, PNG, or WebP.`);
      }
    });

    // Validate accepted files
    const validFiles: File[] = [];
    for (const file of acceptedFiles) {
      const validation = await validateImage(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(validation.error);
      }
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
      setTimeout(() => setUploadErrors([]), 5000);
    }

    const newPhotos = [...uploadedPhotos, ...validFiles].slice(0, UPLOAD_CONFIG.maxPhotos);
    setUploadedPhotos(newPhotos);
    const urls = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoUrls(urls);
  }, [uploadedPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: UPLOAD_CONFIG.maxPhotos,
    maxSize: UPLOAD_CONFIG.maxFileSize,
  });

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    const newUrls = photoUrls.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    setPhotoUrls(newUrls);
  };

  const handleFieldChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    if (value.length > 20) {
      const detectedLang = detectLanguage(value);
      if (detectedLang !== formData.language) {
        updateFormData({ language: detectedLang as typeof formData.language });
      }
    }
  };

  const handleStyleSelect = (style: ArtStyle) => {
    updateFormData({ artStyle: style });
  };

  const handleVoiceSelect = (voiceId: VoiceId) => {
    updateFormData({ voiceId });
  };

  const handleMusicSelect = (musicTrackId: MusicTrackId) => {
    updateFormData({ musicTrackId });
  };

  const handleThemeSelect = (videoThemeId: VideoThemeId) => {
    updateFormData({ videoThemeId });
  };

  const handleCinematicStyleSelect = (cinematicStyleId: CinematicStyleId) => {
    updateFormData({ cinematicStyleId });
  };

  // Upload with retry logic
  const uploadWithRetry = async (file: File, retries = UPLOAD_CONFIG.maxRetries): Promise<string | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          return url;
        }

        // Exponential backoff
        if (attempt < retries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, UPLOAD_CONFIG.retryDelayBase * Math.pow(2, attempt))
          );
        }
      } catch (error) {
        if (attempt < retries - 1) {
          await new Promise(resolve =>
            setTimeout(resolve, UPLOAD_CONFIG.retryDelayBase * Math.pow(2, attempt))
          );
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];

      for (const photo of uploadedPhotos) {
        const url = await uploadWithRetry(photo);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      // Handle edge case: only 2 photos - we'll still proceed
      if (uploadedUrls.length < UPLOAD_CONFIG.minPhotos) {
        throw new Error("Failed to upload enough photos. Please try again.");
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: uploadedUrls,
          anonymousId: getAnonymousId(),
        }),
      });

      if (response.ok) {
        const { jobId } = await response.json();
        router.push(`/process/${jobId}`);
      } else {
        throw new Error("Failed to create story");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepContent = () => {
    // Steps 1-7: Text questions
    if (currentStep <= 7) {
      const stepConfig = FORM_STEPS[currentStep - 1];
      const fieldValue = formData[stepConfig.field as keyof typeof formData] as string;

      return (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Question Header */}
          <div className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipCurrentQuestion}
              className="absolute right-0 -top-2 text-purple-600 dark:text-[#A78BFA]"
            >
              Skip this question
            </Button>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-lg shadow-purple-500/30 mb-6"
            >
              <span className="text-4xl">{stepConfig.icon}</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3"
            >
              {stepConfig.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              {stepConfig.subtitle}
            </motion.p>
          </div>

          {/* Input Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {currentStep === 1 ? (
              <Input
                value={fieldValue || ""}
                onChange={(e) => handleFieldChange(stepConfig.field, e.target.value)}
                placeholder={stepConfig.placeholder}
                maxLength={stepConfig.maxLength}
                className="text-xl h-16 px-6 rounded-2xl border-2 border-purple-100 focus:border-purple-400 bg-white/80 backdrop-blur-sm shadow-lg dark:bg-gray-800/80 dark:border-purple-500/30"
              />
            ) : (
              <Textarea
                value={fieldValue || ""}
                onChange={(e) => handleFieldChange(stepConfig.field, e.target.value)}
                placeholder={stepConfig.placeholder}
                maxLength={stepConfig.maxLength}
                className="min-h-[180px] text-lg p-6 rounded-2xl border-2 border-purple-100 focus:border-purple-400 bg-white/80 backdrop-blur-sm shadow-lg resize-none dark:bg-gray-800/80 dark:border-purple-500/30"
              />
            )}

            {stepConfig.voiceEnabled && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleRecording}
                className={cn(
                  "absolute right-4 top-4 p-3 rounded-xl transition-all shadow-lg",
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300"
                )}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
            )}
          </motion.div>

          {/* Character Count */}
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              {isRecording && (
                <span className="flex items-center gap-2 text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recording...
                </span>
              )}
            </div>
            <span className={cn(
              "font-medium transition-colors",
              (fieldValue || "").length > stepConfig.maxLength * 0.9
                ? "text-amber-500"
                : "text-gray-400"
            )}>
              {(fieldValue || "").length} / {stepConfig.maxLength}
            </span>
          </div>
        </motion.div>
      );
    }

    // Step 8: Photo Upload
    if (currentStep === 8) {
      return (
        <motion.div
          key="photos"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-secondary shadow-lg shadow-orange-500/30 mb-6"
            >
              <Camera className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3"
            >
              Share Your Photos
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              Add 2-8 photos of you and your partner
            </motion.p>
          </div>

          {/* Upload Errors */}
          <AnimatePresence>
            {uploadErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-900/20 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {uploadErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 dark:bg-[#111827]/60 dark:border-purple-400/30 dark:hover:bg-[#1E293B]/80 dark:hover:border-purple-300/60",
                isDragActive
                  ? "border-purple-400 bg-purple-50 scale-[1.02] dark:bg-[#1E293B] dark:border-purple-300/60"
                  : "border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 bg-white/50 dark:bg-[#1E293B]/60"
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
              >
                <Upload className={cn(
                  "w-16 h-16 mx-auto mb-4 transition-colors",
                  isDragActive ? "text-purple-500" : "text-purple-300"
                )} />
              </motion.div>
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-2 font-medium">
                {isDragActive ? "Drop your photos here!" : "Drag & drop photos or click to browse"}
              </p>
              <p className="text-sm text-gray-400">JPG, PNG or WebP (max 10MB each, min 500px)</p>
            </div>
          </motion.div>

          {photoUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-4"
            >
              {photoUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg"
                >
                  <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-white text-xs">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    i < photoUrls.length ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-sm font-medium ml-2",
              photoUrls.length < 2 ? "text-amber-500" : "text-gray-500 dark:text-gray-400"
            )}>
              {photoUrls.length}/8 photos {photoUrls.length < 2 && "(min 2)"}
            </span>
          </div>
        </motion.div>
      );
    }

    // Step 9: Voice Selection
    if (currentStep === 9) {
      return (
        <motion.div
          key="voice"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-6"
            >
              <Volume2 className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3"
            >
              Choose Your Narrator
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              Select the voice that will tell your love story
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {Object.values(VOICE_OPTIONS).map((voice, index) => (
              <motion.button
                key={voice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index + 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVoiceSelect(voice.id)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4",
                  formData.voiceId === voice.id
                    ? "border-indigo-400 bg-indigo-50 shadow-lg shadow-indigo-500/20 dark:bg-indigo-900/30 dark:border-indigo-500"
                    : "border-gray-100 bg-white/70 hover:border-indigo-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-400/50"
                )}
              >
                {/* Play button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoicePreview(voice.id, voice.previewUrl);
                  }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                    playingVoice === voice.id
                      ? "bg-indigo-500 text-white"
                      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
                  )}
                >
                  {playingVoice === voice.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{voice.name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      voice.gender === 'female'
                        ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    )}>
                      {voice.gender}
                    </span>
                    <span className="text-xs text-gray-400">{voice.accent}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{voice.description}</p>
                </div>

                {formData.voiceId === voice.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      );
    }

    // Step 10: Music Selection
    if (currentStep === 10) {
      return (
        <motion.div
          key="music"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30 mb-6"
            >
              <Music className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3"
            >
              Set the Mood
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              Choose the background music for your video
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {Object.values(MUSIC_TRACKS).map((track, index) => (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index + 0.5 }}
                whileHover={{ scale: 1.01, x: 5 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleMusicSelect(track.id)}
                className={cn(
                  "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4",
                  formData.musicTrackId === track.id
                    ? "border-pink-400 bg-pink-50 shadow-lg shadow-pink-500/20 dark:bg-pink-900/20 dark:border-pink-500"
                    : "border-gray-100 bg-white/70 hover:border-pink-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-pink-400/50"
                )}
              >
                {/* Play button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playMusicPreview(track.id, track.previewUrl);
                  }}
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                    playingMusic === track.id
                      ? "bg-pink-500 text-white"
                      : "bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300"
                  )}
                >
                  {playingMusic === track.id ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">{track.name}</h3>
                    <span className="text-sm text-gray-400">{track.duration}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{track.description}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {track.mood}
                  </span>
                </div>

                {formData.musicTrackId === track.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      );
    }

    // Step 11: Cinematic Style Selection (24 styles) - Full Width Cards with Dropdown
    if (currentStep === 11) {
      const filteredStyles = Object.values(CINEMATIC_STYLES).filter(
        style => !activeStyleCategory || style.category === activeStyleCategory
      );
      const selectedStyle = CINEMATIC_STYLES[formData.cinematicStyleId];
      const styleCount = filteredStyles.length;

      return (
        <motion.div
          key="cinematic-style"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-4"
            >
              <Film className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2"
            >
              Pick Your Movie Style
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-sm"
            >
              Choose from 24 cinematic styles inspired by your favorite movies
            </motion.p>
          </div>

          {/* Category Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                🎞️
              </span>
              <select
                value={activeStyleCategory || ""}
                onChange={(e) => setActiveStyleCategory(e.target.value || null)}
                className="w-full appearance-none pl-10 pr-10 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-medium text-center cursor-pointer focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-all shadow-sm"
                aria-label="Filter cinematic styles"
              >
                <option value="">All Styles (24)</option>
                {STYLE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-5 h-5 text-purple-400 rotate-90" />
              </div>
            </div>
          </motion.div>

          {/* Styles List - Full Width Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700"
          >
            {styleCount === 0 && (
              <div className="w-full rounded-2xl border border-dashed border-purple-300/60 dark:border-purple-500/40 bg-white/70 dark:bg-[#0f172a]/70 p-6 text-center text-sm text-gray-500 dark:text-gray-300">
                No styles in this category. Choose another filter to see options.
              </div>
            )}
            {filteredStyles.map((style, index) => {
              const isSelected = formData.cinematicStyleId === style.id;
              const displayEmoji = /[^\x00-\x7F]/.test(style.emoji) ? style.emoji : "🎬";
              return (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(0.03 * index, 0.3) }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleCinematicStyleSelect(style.id)}
                  className={cn(
                    "w-full relative rounded-2xl overflow-hidden transition-all duration-200 text-left",
                    isSelected
                      ? "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg shadow-purple-500/25"
                      : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-purple-300 dark:hover:ring-purple-500"
                  )}
                >
                  {/* Gradient Background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${style.gradient.join(', ')})`,
                    }}
                  />

                  {/* Dark Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

                  {/* Content */}
                  <div className="relative flex items-center gap-4 p-4">
                    {/* Emoji */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-3xl">{displayEmoji}</span>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-base truncate">
                        {style.name}
                      </h3>
                      <p className="text-white/75 text-sm mt-0.5 line-clamp-2">
                        {style.description}
                      </p>
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 capitalize">
                        {style.category}
                      </span>
                    </div>

                    {/* Selected Indicator */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg z-20"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-white/40" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Style Count */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredStyles.length} styles available
              {activeStyleCategory && (
                <button
                  onClick={() => setActiveStyleCategory(null)}
                  className="ml-2 text-purple-500 hover:text-purple-600 font-medium"
                >
                  View all 24
                </button>
              )}
            </p>
            {selectedStyle && (
              <div className="mx-auto max-w-xl rounded-2xl overflow-hidden ring-1 ring-purple-200 dark:ring-purple-500/30 shadow-lg">
                <div
                  className="h-32 relative"
                  style={{ background: `linear-gradient(135deg, ${selectedStyle.gradient.join(', ')})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                        {selectedStyle.emoji}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-semibold">{selectedStyle.name}</p>
                        <p className="text-white/80 text-xs line-clamp-2">{selectedStyle.description}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    return null;
  };

  const canProceed = () => {
    if (currentStep <= 7) {
      const stepConfig = FORM_STEPS[currentStep - 1];
      const value = formData[stepConfig.field as keyof typeof formData] as string;
      return value && value.trim().length > 0;
    }
    if (currentStep === 8) {
      return photoUrls.length >= UPLOAD_CONFIG.minPhotos;
    }
    if (currentStep === 9) {
      return !!formData.voiceId;
    }
    if (currentStep === 10) {
      return !!formData.musicTrackId;
    }
    if (currentStep === 11) {
      // Step 11 is now the 24 cinematic styles
      return !!formData.cinematicStyleId;
    }
    return true;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBF5] dark:bg-[#0F172A] text-gray-900 dark:text-[#F1F5F9] transition-colors duration-700">
      {/* Animated Background */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={cn(
          "fixed inset-0 bg-gradient-to-br transition-all duration-1000 dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#1E293B]",
          currentTheme.bg
        )}
      />

      <FloatingSparkles count={20} />

      <div className="relative z-10 min-h-screen flex flex-col px-4 py-6 md:py-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto w-full mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass"
            >
              <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              <span className="font-display font-semibold gradient-text">ForeverStory.ai</span>
            </motion.button>
              <div className="flex items-center gap-3 justify-between md:justify-end w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Step {currentStep} of {TOTAL_STEPS}
                </span>
                <div className="flex items-center gap-2">
                  {currentStep <= 7 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={skipToPhotos}
                      className="text-xs sm:text-sm inline-flex items-center gap-1 glass dark:bg-[#1E293B]/80 border border-purple-200/60 dark:border-purple-500/30 shadow-sm hover:shadow-purple-500/20"
                    >
                      <Camera className="w-4 h-4 text-purple-600 dark:text-[#A78BFA]" />
                      Skip to photos
                    </Button>
                  )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs sm:text-sm inline-flex items-center gap-1 glass dark:bg-[#1E293B]/80 border border-purple-200/60 dark:border-purple-500/30 shadow-sm hover:shadow-purple-500/20"
                >
                  <RotateCcw className="w-4 h-4 text-purple-600 dark:text-[#A78BFA]" />
                  Reset & start over
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 rounded-full bg-white/50 backdrop-blur-sm overflow-hidden shadow-inner dark:bg-[#1E293B] dark:border dark:border-purple-500/10">
            <motion.div
              className="absolute inset-y-0 left-0 gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center py-4">
          <GlassCard className="w-full max-w-3xl p-8 md:p-12 dark:shadow-purple-500/20 dark:border-purple-500/20">
            <AnimatePresence mode="wait">
              {getCurrentStepContent()}
            </AnimatePresence>

            {currentStep <= 7 && (
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                <p className="text-gray-500 dark:text-gray-300">
                  Prefer not to answer? Skip all the questions and we&apos;ll craft a romantic story from your photos.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={skipToPhotos}
                  className="inline-flex items-center gap-2 glass dark:bg-[#1E293B]/80 border border-purple-200/60 dark:border-purple-500/30 shadow-sm hover:shadow-purple-500/20"
                >
                  <Camera className="w-4 h-4 text-purple-600 dark:text-[#A78BFA]" />
                  Skip questions & add photos
                </Button>
              </div>
            )}

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            className="flex justify-between items-center mt-10 pt-8 border-t border-purple-100 dark:border-purple-500/20"
            >
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={cn(
                    "group",
                    currentStep === 1 && "invisible"
                  )}
                >
                  <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-gray-500 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset form
                </Button>
              </div>

              {/* Skip + Continue buttons for question steps */}
              {currentStep <= 7 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={skipCurrentQuestion}
                    className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                  >
                    Skip
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="group"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {/* Continue button for non-question steps (8-10) */}
              {currentStep > 7 && currentStep < TOTAL_STEPS && (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="group"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              {/* Submit button for final step */}
              {currentStep === TOTAL_STEPS && (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  variant="glow"
                  className="min-w-[200px] group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Generate My Story
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </GlassCard>
        </div>

        {/* Step Indicators */}
        <div className="max-w-3xl mx-auto w-full mt-6">
          <div className="flex justify-center gap-2">
            {[...Array(TOTAL_STEPS)].map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  if (i + 1 <= currentStep) setCurrentStep(i + 1);
                }}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i + 1 === currentStep
                    ? "w-10 gradient-primary"
                    : i + 1 < currentStep
                    ? "w-2 bg-purple-400 hover:bg-purple-500 cursor-pointer"
                    : "w-2 bg-white/50 dark:bg-gray-700"
                )}
                whileHover={i + 1 < currentStep ? { scale: 1.2 } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
