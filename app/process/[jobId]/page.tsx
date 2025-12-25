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

  // Generate floating particles once after mount to avoid hydration mismatch
  const particles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 30 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      color: ['purple', 'pink', 'blue', 'yellow', 'orange'][Math.floor(Math.random() * 5)],
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
      {/* Animated floating particles background */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color === 'purple' ? '#8B5CF6' :
                                 particle.color === 'pink' ? '#EC4899' :
                                 particle.color === 'blue' ? '#3B82F6' :
                                 particle.color === 'yellow' ? '#FBBF24' :
                                 '#FB923C',
                filter: 'blur(1px)',
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/30 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-pink-500/25 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-400/15 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
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
            {/* 3D Circular Progress Ring */}
            <motion.div
              className="relative flex justify-center mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative w-52 h-52">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />

                {/* Main SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-gray-700/50"
                  />

                  {/* Animated gradient progress circle */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                    className="transition-all duration-500"
                  >
                    <animate
                      attributeName="stroke"
                      values="#8B5CF6;#EC4899;#F59E0B;#8B5CF6"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </motion.circle>
                </svg>

                {/* Center content with percentage */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl font-bold bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {Math.round(progress)}%
                  </motion.div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Processing</div>
                </div>

                {/* Orbiting sparkles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      marginLeft: '-2px',
                      marginTop: '-2px',
                    }}
                    animate={{
                      rotate: [0 + i * 45, 360 + i * 45],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <motion.div
                      className="w-1 h-1"
                      style={{
                        translateX: '100px',
                      }}
                      animate={{
                        scale: [0.5, 1.5, 0.5],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.25,
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Creating your story text */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-3xl md:text-4xl font-bold text-center mb-2"
            >
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Creating Your Story
              </span>
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
                <motion.span
                  className="text-3xl mr-2 inline-block"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {MAGICAL_MESSAGES[messageIndex].emoji}
                </motion.span>
                <span className="text-gray-700 dark:text-white/80 italic text-lg">
                  {MAGICAL_MESSAGES[messageIndex].text}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Enhanced Progress Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700 dark:text-white/70">{currentStep}</span>
                <motion.span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
              <div className="relative h-5 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden border-2 border-white/40 dark:border-white/20 shadow-inner">
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                {/* Animated shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{ width: '50%' }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center font-medium">
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

            {/* Enhanced Processing Steps */}
            <div className="space-y-3 mb-8">
              {PROCESSING_STEPS.slice(0, -1).map((step, index) => {
                const isActive = step.key === status;
                const isComplete = step.progress < progress;

                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-2 border-purple-300 dark:border-purple-500/30 shadow-lg scale-105"
                        : isComplete
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-500/30"
                        : "border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/5"
                    }`}
                  >
                    {/* Animated background for active step */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/10 to-pink-400/10"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    )}

                    <motion.div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isComplete
                          ? "bg-gradient-to-br from-green-400 to-emerald-500"
                          : isActive
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-white/20 dark:bg-white/10"
                      }`}
                      animate={isActive ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {isComplete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <span className="text-gray-500 dark:text-white/50 text-sm font-semibold">{index + 1}</span>
                      )}
                    </motion.div>

                    <div className="relative z-10 flex-1">
                      <span className={`text-base font-semibold ${
                        isActive
                          ? "text-gray-900 dark:text-white"
                          : isComplete
                          ? "text-gray-700 dark:text-white/70"
                          : "text-gray-500 dark:text-white/40"
                      }`}>
                        {step.label}
                      </span>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-gray-600 dark:text-gray-300 mt-1"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>

                    {isActive && (
                      <motion.div
                        className="relative z-10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5 text-yellow-400" />
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
