"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { FloatingSparkles, FloatingHearts } from "@/components/shared/FloatingSparkles";
import confetti from "canvas-confetti";
import { Heart, Download, Sparkles, Check, Share2, Film, ChevronRight, Play, Copy } from "lucide-react";

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<"hd" | "4k" | null>(null);
  const [copied, setCopied] = useState(false);

  // Celebration confetti on load
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#EC4899", "#FBBF24", "#10B981"],
    });
  }, []);

  useEffect(() => {
    const verifyPurchase = async () => {
      try {
        const response = await fetch(`/api/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.paid && data.videoUrl) {
            setVideoUrl(data.videoUrl);
          } else if (!data.paid) {
            router.push(`/result/${jobId}`);
          }
        }
      } catch (error) {
        console.error("Error verifying purchase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPurchase();
  }, [jobId, router]);

  const handleDownload = async (quality: "hd" | "4k") => {
    setIsDownloading(quality);

    try {
      const response = await fetch(`/api/download/${jobId}?quality=${quality}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `foreverstory-${jobId}-${quality}.mp4`;
        a.click();
        URL.revokeObjectURL(url);

        // Success confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10B981", "#8B5CF6"],
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <FloatingHearts count={8} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span className="font-display font-semibold text-xl gradient-text">ForeverStory.ai</span>
        </motion.div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 md:p-10 dark:shadow-purple-500/20 dark:border-purple-500/20">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Thank You! 🎉
              </h1>
              <p className="text-gray-500 text-lg">
                Your premium video is ready for download
              </p>
            </motion.div>

            {/* Video Preview */}
            {videoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <div className="iphone-frame">
                  <div className="video-container bg-gray-900">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Download Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Button
                size="xl"
                variant="glow"
                className="w-full group"
                onClick={() => handleDownload("hd")}
                disabled={isDownloading !== null}
              >
                {isDownloading === "hd" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                    Download HD (1080p)
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full group"
                onClick={() => handleDownload("4k")}
                disabled={isDownloading !== null}
              >
                {isDownloading === "4k" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Download 4K Ultra HD (2160p)
                  </>
                )}
              </Button>
            </motion.div>

            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mt-6 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50"
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-600">Premium Access Unlocked</span>
            </motion.div>

            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500 text-center mb-4">
                Share your love story with the world
              </p>
              <div className="flex justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>

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
