"use client";
import { useEffect, useState, useMemo } from "react";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingSparkles } from "@/components/shared/FloatingSparkles";
import { PROCESSING_STEPS } from "@/lib/constants";
import { Heart, Sparkles, Check, Loader2, RefreshCw, Home, X, Image as ImageIcon } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";

const MAGICAL_MESSAGES = [
  { text: "Weaving your story with magic...", emoji: "✨" },
  { text: "Painting scenes of your love...", emoji: "🎨" },
  { text: "Adding sparkles to your memories...", emoji: "💫" },
  { text: "Capturing the essence of your journey...", emoji: "🌟" },
  { text: "Creating something beautiful...", emoji: "💕" },
  { text: "Almost there, stay cozy...", emoji: "🌙" },
  { text: "Mixing in the perfect melody...", emoji: "🎵" },
  { text: "Bringing your photos to life...", emoji: "📸" },
];

const LOTTIE_URLS = {
  loading: "https://lottie.host/4db68bbd-31f6-4cd8-84eb-189571294169/fj8mCuNazY.json",
  heart: "https://lottie.host/f1e5f4f8-d6e3-4f1c-9c4c-d1e6c2f5e8d1/heart-animation.json",
  success: "https://lottie.host/5b8f82b7-9c9e-4db7-9b1e-5c8f6d4e3a2b/success-animation.json",
};

interface RenderFrame {
  frameNumber: number;
  thumbnailUrl?: string;
  status: 'pending' | 'rendering' | 'complete';
}

export default function ProcessPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [status, setStatus] = useState("queued");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Preparing...");
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(0);
  const [currentFrame, setCurrentFrame] = useState<RenderFrame | null>(null);
  const [estimatedSeconds, setEstimatedSeconds] = useState(300); // 5 minutes default
  const [startTime] = useState(Date.now());
  const [isCancelling, setIsCancelling] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Generate star positions once after mount to avoid hydration mismatch
  const stars = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tips = [
    "Your video will be ready in about 3-5 minutes",
    "We're using AI to create custom animations for your story",
    "Each scene is uniquely generated based on your answers",
    "Feel free to keep this tab open or check back later",
    "The more photos you uploaded, the more personalized your video",
  ];

  // Calculate estimated time remaining
  useEffect(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progressRate = progress / Math.max(elapsed, 1);
    const remainingProgress = 100 - progress;

    if (progressRate > 0) {
      const secondsRemaining = remainingProgress / progressRate;
      setEstimatedSeconds((prev) => {
        const nextEstimate = Math.ceil(secondsRemaining);
        return nextEstimate !== prev ? nextEstimate : prev;
      });
    }
  }, [progress, startTime]);

  const estimatedTimeText = useMemo(() => {
    if (estimatedSeconds < 30) return "Less than 30 seconds";
    if (estimatedSeconds < 60) return "Less than a minute";
    const minutes = Math.ceil(estimatedSeconds / 60);
    return `About ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }, [estimatedSeconds]);

  // Poll for status updates
  useEffect(() => {
    let isActive = true;

    const pollStatus = async () => {
      if (!isActive) return;

      try {
        const response = await fetch(`/api/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setProgress(data.progress || 0);
          setCurrentStep(data.currentStep || "Processing...");

          // Update current frame if rendering
          if (data.currentFrame) {
            setCurrentFrame(data.currentFrame);
          }

          if (data.status === "completed") {
            setTimeout(() => router.push(`/result/${jobId}`), 1500);
          } else if (data.status === "failed") {
            setError(data.error || "Something went wrong");
          }
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [jobId, router]);

  // Rotate fun messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MAGICAL_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [tips.length]);

  // Handle cancel
  const handleCancel = async () => {
    if (isCancelling) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel? Your progress will be lost and you may need to start over."
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/cancel?jobId=${jobId}`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/create');
      } else {
        setError("Failed to cancel. Please try again.");
        setIsCancelling(false);
      }
    } catch (err) {
      setError("Failed to cancel. Please try again.");
      setIsCancelling(false);
    }
  };

  // Get progress description
  const getProgressDescription = () => {
    const step = PROCESSING_STEPS.find(s => s.key === status);
    return step?.description || "Working on your story...";
  };

  if (error) {
    return (
      <main className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-[#0F172A] dark:to-[#1a1f3a] transition-colors duration-700">
        <FloatingSparkles count={15} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="max-w-md p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
            >
              <span className="text-4xl">😢</span>
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
              Don&apos;t worry - our team has been notified. You can try again or contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/")}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={() => router.push("/create")}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-[#0F172A] dark:via-[#0F172A] dark:to-[#1a1f3a] transition-colors duration-700">
      {/* Animated stars background */}
     {/* Animated stars background */}
{isMounted && (
  <div className="absolute inset-0">
    {stars.map((star, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          left: `${star.left}%`,
          top: `${star.top}%`,
        }}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: star.duration,
          repeat: Infinity,
          delay: star.delay,
        }}
      />
    ))}
  </div>
)}

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-purple-500/30 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
          <span className="font-display text-gray-900 dark:text-white font-semibold text-xl">ForeverStory.ai</span>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="max-w-xl w-full p-8 md:p-10 glass dark:glass-dark border border-white/30 dark:border-white/10 dark:shadow-purple-500/20">
            {/* Lottie Animation */}
            <motion.div
              className="relative flex justify-center mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <Player
                  autoplay
                  loop
                  src={LOTTIE_URLS.loading}
                  style={{ height: "150px", width: "150px" }}
                />
                {/* Sparkle effects around the animation */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
                      left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 50}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Creating your story text */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-2 dark:text-shadow-glow"
            >
              Creating Your Story
            </motion.h2>

            {/* Animated message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-8"
              >
                <span className="text-2xl mr-2">{MAGICAL_MESSAGES[messageIndex].emoji}</span>
                <span className="text-gray-700 dark:text-white/70 italic">{MAGICAL_MESSAGES[messageIndex].text}</span>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-white/60">
                <span>{currentStep}</span>
                <span className="text-gray-800 dark:text-white font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="relative h-4 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden border border-white/40 dark:border-white/10">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full progress-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Shimmer effect on progress bar */}
                <motion.div
                  className="absolute inset-0 shimmer"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {getProgressDescription()}
              </p>
            </div>

            {/* Current Frame Preview (when rendering) */}
            {currentFrame && status === 'rendering_frames' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {currentFrame.thumbnailUrl ? (
                      <img
                        src={currentFrame.thumbnailUrl}
                        alt={`Frame ${currentFrame.frameNumber}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      Rendering Frame {currentFrame.frameNumber}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Creating smooth animations...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing Steps */}
            <div className="space-y-2 mb-8">
              {PROCESSING_STEPS.slice(0, -1).map((step, index) => {
                const isActive = step.key === status;
                const isComplete = step.progress < progress;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-white/80 border border-purple-200 dark:bg-white/10 dark:border-white/20"
                        : "border border-white/40 dark:border-white/10 bg-white/50 dark:bg-transparent"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-green-500"
                          : isActive
                          ? "gradient-primary pulse-glow"
                          : "bg-white/10"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <span className="text-gray-500 dark:text-white/50 text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${
                        isActive ? "text-gray-900 dark:text-white font-medium" : isComplete ? "text-gray-700 dark:text-white/60" : "text-gray-500 dark:text-white/40"
                      }`}>
                        {step.label}
                      </span>
                      {isActive && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                      )}
                    </div>
                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Estimated Time & Cancel */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-white/50 text-sm mb-1">Estimated time remaining</p>
                  <p className="text-gray-900 dark:text-white font-display font-semibold text-lg">{estimatedTimeText}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tips */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showTip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 max-w-md text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/60 shadow-md dark:bg-white/5 dark:border-white/10">
              <span className="text-yellow-300">💡</span>
              <span className="text-gray-600 dark:text-white/50 text-sm">{tips[showTip]}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-10 left-10"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl opacity-30">🌙</span>
        </motion.div>
        <motion.div
          className="absolute top-20 right-10"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-3xl opacity-30">⭐</span>
        </motion.div>
      </div>
    </main>
  );
}
