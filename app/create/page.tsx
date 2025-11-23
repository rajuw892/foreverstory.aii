"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FloatingSparkles } from "@/components/shared/FloatingSparkles";
import { useStoryForm } from "@/lib/store";
import { FORM_STEPS, STYLE_CONFIGS } from "@/lib/constants";
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
} from "lucide-react";
import { ArtStyle } from "@/types";

const TOTAL_STEPS = 9;

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
];

export default function CreatePage() {
  const router = useRouter();
  const { currentStep, formData, updateFormData, nextStep, prevStep, setCurrentStep } = useStoryForm();
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>(formData.photos || []);

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const currentTheme = STEP_THEMES[(currentStep - 1) % STEP_THEMES.length];

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPhotos = [...uploadedPhotos, ...acceptedFiles].slice(0, 8);
    setUploadedPhotos(newPhotos);
    const urls = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoUrls(urls);
  }, [uploadedPhotos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 8,
    maxSize: 10 * 1024 * 1024,
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];

      for (const photo of uploadedPhotos) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", photo);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          uploadedUrls.push(url);
        }
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
      alert("Something went wrong. Please try again.");
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
          <div className="text-center">
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
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3"
            >
              {stepConfig.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-lg"
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
                className="text-xl h-16 px-6 rounded-2xl border-2 border-purple-100 focus:border-purple-400 bg-white/80 backdrop-blur-sm shadow-lg"
              />
            ) : (
              <Textarea
                value={fieldValue || ""}
                onChange={(e) => handleFieldChange(stepConfig.field, e.target.value)}
                placeholder={stepConfig.placeholder}
                maxLength={stepConfig.maxLength}
                className="min-h-[180px] text-lg p-6 rounded-2xl border-2 border-purple-100 focus:border-purple-400 bg-white/80 backdrop-blur-sm shadow-lg resize-none"
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
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
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
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3"
            >
              Share Your Photos
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-lg"
            >
              Add 2-8 photos of you and your partner
            </motion.p>
          </div>

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
              <p className="text-gray-700 text-lg mb-2 font-medium">
                {isDragActive ? "Drop your photos here!" : "Drag & drop photos or click to browse"}
              </p>
              <p className="text-sm text-gray-400">JPG, PNG or WebP (max 10MB each)</p>
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
                    i < photoUrls.length ? "bg-purple-500" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            <span className={cn(
              "text-sm font-medium ml-2",
              photoUrls.length < 2 ? "text-amber-500" : "text-gray-500"
            )}>
              {photoUrls.length}/8 photos {photoUrls.length < 2 && "(min 2)"}
            </span>
          </div>
        </motion.div>
      );
    }

    // Step 9: Style Selection
    if (currentStep === 9) {
      return (
        <motion.div
          key="style"
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-6"
            >
              <Palette className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold text-gray-800 mb-3"
            >
              Choose Your Style
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-lg"
            >
              Pick the animation style for your love story
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {Object.values(STYLE_CONFIGS).map((style, index) => (
              <motion.button
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStyleSelect(style.id)}
                className={cn(
                  "relative p-5 rounded-3xl border-3 transition-all text-left overflow-hidden",
                  formData.artStyle === style.id
                    ? "border-purple-400 bg-white shadow-xl shadow-purple-500/20 dark:border-purple-400/70 dark:bg-[#1E293B] dark:shadow-purple-500/25"
                    : "border-gray-100 bg-white/70 hover:border-purple-200 hover:shadow-lg dark:border-purple-500/20 dark:bg-[#0f172a]/60 dark:hover:border-purple-300/40 dark:hover:shadow-purple-500/15"
                )}
              >
                {formData.artStyle === style.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}

                <div
                  className="w-full h-28 rounded-2xl mb-4 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${style.colorScheme.primary}, ${style.colorScheme.secondary})`,
                  }}
                >
                  <div className="absolute inset-0 shimmer" />
                </div>

                <h3 className="font-display font-semibold text-lg text-gray-800 mb-1">{style.name}</h3>
                <p className="text-sm text-gray-500">{style.description}</p>
              </motion.button>
            ))}
          </motion.div>
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
      return photoUrls.length >= 2;
    }
    if (currentStep === 9) {
      return !!formData.artStyle;
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
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass"
            >
              <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              <span className="font-display font-semibold gradient-text">ForeverStory.ai</span>
            </motion.button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
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

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            className="flex justify-between mt-10 pt-8 border-t border-purple-100"
            >
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

              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="group"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
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
                    : "w-2 bg-white/50"
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
