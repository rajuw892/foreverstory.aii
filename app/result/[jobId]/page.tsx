"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { FloatingSparkles, FloatingHearts } from "@/components/shared/FloatingSparkles";
import confetti from "canvas-confetti";
import {
  Heart,
  Download,
  Share2,
  Sparkles,
  Play,
  Pause,
  Crown,
  Volume2,
  VolumeX,
  Maximize,
  Copy,
  Check,
  ChevronRight,
  Gift,
} from "lucide-react";

interface StoryData {
  coupleNames: string;
  artStyle: string;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(true);

  // Trigger confetti on mount
  useEffect(() => {
    if (showCelebration) {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ["#8B5CF6", "#EC4899", "#FBBF24", "#FB923C"];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Big burst at the end
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
      }, 500);

      setTimeout(() => setShowCelebration(false), duration);
    }
  }, [showCelebration]);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "completed") {
            setVideoUrl(data.watermarkedVideoUrl || data.videoUrl);
            setStoryData(data.storyData);
            setIsPaid(data.paid || false);
          } else if (data.status !== "completed") {
            router.push(`/process/${jobId}`);
          }
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [jobId, router]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/result/${jobId}`;
    const shareText = `Check out our love story animated by ForeverStory.ai! 💕`;

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!videoUrl) return;

    if (!isPaid) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `foreverstory-${jobId}-watermarked.mp4`;
      a.click();
    } else {
      const response = await fetch(`/api/download/${jobId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `foreverstory-${jobId}-hd.mp4`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center animated-gradient-bg transition-colors duration-700">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full"
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden animated-gradient-bg transition-colors duration-700">
      <FloatingSparkles count={25} />
      <FloatingHearts count={10} />

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span className="font-display font-semibold text-xl gradient-text">ForeverStory.ai</span>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4 shadow-lg shadow-purple-500/30"
          >
            <span className="text-4xl">🎉</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl md:text-4xl font-bold mb-2 dark:text-shadow-glow"
          >
            <span className="gradient-text">
              {storyData?.coupleNames ? `${storyData.coupleNames}'s` : "Your"} Love Story
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 text-lg"
          >
            Your animated video is ready to watch!
          </motion.p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md mb-8"
        >
          <div className="iphone-frame">
            <div className="video-container bg-gray-900 relative group">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Custom Controls Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 text-gray-800" />
                      ) : (
                        <Play className="w-7 h-7 text-gray-800 ml-1" />
                      )}
                    </motion.button>
                  </div>

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between">
                      <button onClick={toggleMute} className="p-2 text-white hover:text-purple-300 transition-colors">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <button onClick={handleFullscreen} className="p-2 text-white hover:text-purple-300 transition-colors">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Play button overlay when not playing */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white/90 shadow-xl flex items-center justify-center"
                      >
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                  <Play className="w-16 h-16 text-purple-400" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md space-y-4"
        >
          {!isPaid ? (
            <>
              {/* Upgrade CTA */}
              <Link href={`/checkout/${jobId}`} className="block">
                <Button size="xl" variant="glow" className="w-full group">
                  <Crown className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Get HD Without Watermark
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">$9.99</span>
                </Button>
              </Link>

              {/* Benefits */}
              <div className="flex justify-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> HD Quality
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> No Watermark
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> 4K Option
                </span>
              </div>

              {/* Free Download */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Free Preview (with watermark)
              </Button>
            </>
          ) : (
            <>
              {/* HD Download */}
              <Button size="xl" variant="glow" className="w-full group" onClick={handleDownload}>
                <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                Download HD Video
              </Button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 justify-center text-green-600 bg-green-50 py-3 rounded-xl"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Premium Unlocked!</span>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md mt-8"
        >
          <GlassCard className="p-6 dark:shadow-purple-500/20 dark:border-purple-500/20">
            <div className="flex items-center gap-2 mb-5">
              <Share2 className="w-5 h-5 text-purple-500" />
              <h3 className="font-display font-semibold text-gray-800">Share Your Story</h3>
            </div>

            <div className="flex justify-center gap-3">
              {[
                { name: "twitter", icon: "𝕏", bg: "bg-black", hover: "hover:bg-gray-800", text: "text-white" },
                { name: "facebook", icon: "f", bg: "bg-[#1877F2]", hover: "hover:bg-[#166FE5]", text: "text-white" },
                { name: "whatsapp", icon: "💬", bg: "bg-[#25D366]", hover: "hover:bg-[#22C55E]", text: "text-white" },
              ].map((platform) => (
                <motion.button
                  key={platform.name}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(platform.name)}
                  className={`w-12 h-12 rounded-xl ${platform.bg} ${platform.hover} ${platform.text} flex items-center justify-center text-lg font-bold shadow-lg transition-colors`}
                >
                  {platform.icon}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyLink}
                className="w-12 h-12 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center shadow-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </motion.button>
            </div>

            {copied && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-green-600 mt-3"
              >
                Link copied to clipboard!
              </motion.p>
            )}
          </GlassCard>
        </motion.div>

        {/* Gift Idea */}
        {!isPaid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-md mt-6"
          >
            <GlassCard className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-[#1E293B] dark:to-[#0F172A] dark:border-purple-500/20 dark:shadow-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-gray-800 mb-1">Perfect Gift Idea!</h4>
                  <p className="text-sm text-gray-600">
                    Anniversary, wedding, or just because - surprise your partner with your animated love story.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Create Another */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <Link href="/create">
            <Button variant="ghost" className="group">
              <Heart className="w-4 h-4 mr-2 fill-pink-500 text-pink-500" />
              Create Another Story
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
