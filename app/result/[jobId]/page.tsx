"use client";

// ========================================
// ForeverStory.ai Result Page - 3-Tier Pricing
// Shows 30-second teaser + Basic/Premium/Deluxe options
// ========================================

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
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
  Crown,
  Copy,
  Check,
  ChevronRight,
  Lock,
  Zap,
  Film,
  Globe,
} from "lucide-react";

// ========================================
// Types & Interfaces
// ========================================

interface StoryData {
  partner1Name?: string;
  partner2Name?: string;
  coupleNames?: string;
  styleId?: string;
}

interface PricingTier {
  id: "basic" | "premium" | "deluxe";
  name: string;
  price: { india: string; global: string };
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
  deluxeNote?: string;
}

// ========================================
// Pricing Configuration
// ========================================

const PRICING_TIERS: PricingTier[] = [
  {
    id: "basic",
    name: "Basic",
    price: { india: "₹399", global: "$4.99" },
    description: "30-second animated video",
    features: [
      "30 seconds fully animated",
      "AI-generated character avatars",
      "All 24 cinematic styles",
      "1080p HD quality",
      "Instant download",
    ],
    icon: <Film className="w-6 h-6" />,
  },
  {
    id: "premium",
    name: "Premium",
    price: { india: "₹799", global: "$9.99" },
    description: "1.5-minute animated masterpiece",
    features: [
      "1.5 minutes fully animated",
      "AI-generated character avatars",
      "Lip-synced talking scenes",
      "All 24 cinematic styles",
      "HD download",
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: true,
  },
  {
    id: "deluxe",
    name: "Deluxe",
    price: { india: "₹1499", global: "$19.99" },
    description: "2.5-minute cinematic experience",
    features: [
      "2.5 minutes fully animated",
      "AI-generated character avatars",
      "Extended lip-synced scenes",
      "Premium animation quality",
      "HD download + extras",
    ],
    icon: <Sparkles className="w-6 h-6" />,
    deluxeNote: "Animation takes 10-15 minutes to generate",
  },
];

// ========================================
// Main Component
// ========================================

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [teaserUrl, setTeaserUrl] = useState<string | null>(null);
  const [fullVideoUrl, setFullVideoUrl] = useState<string | null>(null);
  const [deluxeVideoUrl, setDeluxeVideoUrl] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [paymentTier, setPaymentTier] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isIndia, setIsIndia] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Detect user location (India vs Global)
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setIsIndia(
      timezone.includes("Asia/Kolkata") ||
      timezone.includes("Asia/Calcutta") ||
      timezone.includes("Asia/Dhaka") ||
      timezone.includes("Asia/Karachi")
    );
  }, []);

  // Check for successful payment
  useEffect(() => {
    const success = searchParams.get("success");
    const tier = searchParams.get("tier");

    if (success === "true" && tier) {
      setShowCelebration(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#8B5CF6", "#EC4899", "#FBBF24"],
      });
    }
  }, [searchParams]);

  // Fetch story status
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();

          if (data.status === "completed") {
            setTeaserUrl(data.teaserUrl || data.watermarkedVideoUrl);
            setFullVideoUrl(data.videoUrl);
            setDeluxeVideoUrl(data.deluxeVideoUrl);
            setStoryData(data.storyData);
            setIsPaid(data.paid || false);
            setPaymentTier(data.paymentTier);
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

  // ========================================
  // Payment Handlers
  // ========================================

  const handlePurchase = async (tier: "basic" | "premium" | "deluxe") => {
    setProcessingPayment(true);

    try {
      if (isIndia) {
        await handleRazorpayPayment(tier);
      } else {
        await handleStripePayment(tier);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleStripePayment = async (tier: string) => {
    const response = await fetch("/api/payment/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobId,
        tier,
        currency: "usd",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      window.location.href = data.url;
    } else {
      throw new Error("Failed to create checkout session");
    }
  };

  const handleRazorpayPayment = async (tier: string) => {
    const response = await fetch("/api/payment/razorpay-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, tier }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    const data = await response.json();

    // @ts-ignore - Razorpay is loaded via script
    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "ForeverStory.ai",
      description: data.description,
      order_id: data.orderId,
      prefill: {
        name: data.prefill.name,
      },
      theme: {
        color: "#8B5CF6",
      },
      handler: async function (response: any) {
        const verifyResponse = await fetch("/api/payment/razorpay-create", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            jobId,
          }),
        });

        if (verifyResponse.ok) {
          window.location.href = `/result/${jobId}?success=true&tier=${tier}`;
        } else {
          alert("Payment verification failed");
        }
      },
    });

    rzp.open();
  };

  // ========================================
  // Other Handlers
  // ========================================

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
    let downloadUrl = fullVideoUrl;

    if (paymentTier === "deluxe" && deluxeVideoUrl) {
      downloadUrl = deluxeVideoUrl;
    }

    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `foreverstory-${jobId}-${paymentTier || "hd"}.mp4`;
    a.click();
  };

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center animated-gradient-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full"
        />
      </main>
    );
  }

  const coupleName =
    storyData?.partner1Name && storyData?.partner2Name
      ? `${storyData.partner1Name} & ${storyData.partner2Name}`
      : storyData?.coupleNames || "Your";

  // ========================================
  // Main Render
  // ========================================

  return (
    <>
      {isIndia && <Script src="https://checkout.razorpay.com/v1/checkout.js" />}

      <main className="relative min-h-screen overflow-hidden animated-gradient-bg">
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
            <span className="font-display font-semibold text-xl gradient-text">
              ForeverStory.ai
            </span>
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-4 shadow-lg"
            >
              <span className="text-4xl">🎉</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold mb-2"
            >
              <span className="gradient-text">{coupleName}'s Love Story</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              {isPaid
                ? "Your video is ready to download!"
                : "Watch your 30-second preview below"}
            </motion.p>
          </motion.div>

          {/* Video Player - Teaser or Full */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
              <div className="aspect-video relative">
                {teaserUrl && (
                  <>
                    <video
                      ref={videoRef}
                      src={isPaid && fullVideoUrl ? fullVideoUrl : teaserUrl}
                      playsInline
                      controls
                      preload="metadata"
                      controlsList={isPaid ? undefined : "nodownload"}
                      disablePictureInPicture={!isPaid}
                      className="w-full h-full object-contain"
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => {
                        const videoSrc = isPaid && fullVideoUrl ? fullVideoUrl : teaserUrl;
                        console.error("Video playback error:", e);
                        console.error("Video src:", videoSrc);
                        console.error("Video element:", e.currentTarget);
                        const errorCode = (e.currentTarget as HTMLVideoElement).error?.code;
                        const errorMessage = (e.currentTarget as HTMLVideoElement).error?.message;
                        console.error("Error code:", errorCode);
                        console.error("Error message:", errorMessage);
                        setVideoError(
                          errorMessage ||
                          `Video failed to load (Error code: ${errorCode}). Please check browser console or contact support.`
                        );
                      }}
                      onLoadedMetadata={() => {
                        console.log("Video metadata loaded successfully");
                        setVideoError(null);
                      }}
                    />

                    {/* Teaser Overlay */}
                    {!isPaid && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold text-lg mb-1">
                              Animated Preview
                            </p>
                            <p className="text-gray-300 text-sm">
                              Unlock full animated video below
                            </p>
                          </div>
                          <Lock className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Video Error Message */}
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 p-8">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        Video Playback Issue
                      </h3>
                      <p className="text-gray-300 text-sm mb-4">
                        {videoError}
                      </p>
                      <div className="space-y-2 text-xs text-gray-400">
                        <p>Try refreshing the page or contact support with job ID:</p>
                        <code className="block bg-gray-800 px-3 py-2 rounded text-purple-300">
                          {jobId}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Pricing Tiers - Only show if not paid */}
          {!isPaid && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-6xl mb-12"
            >
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 gradient-text">
                  Unlock Your Full Love Story
                </h2>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>{isIndia ? "India pricing" : "Global pricing"}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {PRICING_TIERS.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="relative"
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <GlassCard
                      className={`p-6 h-full flex flex-col ${
                        tier.popular
                          ? "border-purple-500 shadow-purple-500/30 shadow-xl"
                          : ""
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                          tier.id === "deluxe"
                            ? "bg-gradient-to-br from-purple-500 to-pink-500"
                            : tier.id === "premium"
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : "bg-gradient-to-br from-blue-400 to-indigo-500"
                        } text-white`}
                      >
                        {tier.icon}
                      </div>

                      {/* Name & Price */}
                      <h3 className="font-display text-2xl font-bold mb-2">
                        {tier.name}
                      </h3>
                      <div className="mb-2">
                        <span className="text-3xl font-bold gradient-text">
                          {isIndia ? tier.price.india : tier.price.global}
                        </span>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        {tier.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6 flex-grow">
                        {tier.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Deluxe Note */}
                      {tier.deluxeNote && (
                        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            <Zap className="w-3 h-3 inline mr-1" />
                            {tier.deluxeNote}
                          </p>
                        </div>
                      )}

                      {/* CTA Button */}
                      <Button
                        size="lg"
                        variant={tier.popular ? "glow" : "default"}
                        className="w-full"
                        onClick={() => handlePurchase(tier.id)}
                        disabled={processingPayment}
                      >
                        {processingPayment ? "Processing..." : `Get ${tier.name}`}
                      </Button>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Secure payment via
                </p>
                <div className="flex items-center justify-center gap-4">
                  {isIndia ? (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        Razorpay
                      </div>
                      <div className="text-xs text-gray-400">
                        UPI • Cards • Wallets • Net Banking
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        Stripe
                      </div>
                      <div className="text-xs text-gray-400">
                        Cards • Apple Pay • Google Pay
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Download Section - Only show if paid */}
          {isPaid && paymentTier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-2xl space-y-4"
            >
              {/* Success Message */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3 justify-center bg-green-50 dark:bg-green-900/20 py-4 px-6 rounded-2xl border border-green-200 dark:border-green-500/30"
              >
                <Sparkles className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    {paymentTier.charAt(0).toUpperCase() + paymentTier.slice(1)}{" "}
                    Unlocked!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your full video is ready
                  </p>
                </div>
              </motion.div>

              {/* Download Button */}
              <Button
                size="xl"
                variant="glow"
                className="w-full group"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                Download Your{" "}
                {paymentTier === "deluxe"
                  ? "2.5-Minute"
                  : paymentTier === "premium"
                  ? "1.5-Minute"
                  : "30-Second"}{" "}
                Animated Video
              </Button>

              {/* Deluxe Status */}
              {paymentTier === "deluxe" && !deluxeVideoUrl && (
                <GlassCard className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                        Animated video is generating...
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Your animated cartoon video is being created. This takes
                        5-10 minutes. We'll email you when it's ready!
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-2xl mt-8"
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Share2 className="w-5 h-5 text-purple-500" />
                <h3 className="font-display font-semibold">Share Your Story</h3>
              </div>

              <div className="flex justify-center gap-3">
                {[
                  {
                    name: "twitter",
                    icon: "𝕏",
                    bg: "bg-black",
                    hover: "hover:bg-gray-800",
                  },
                  {
                    name: "facebook",
                    icon: "f",
                    bg: "bg-[#1877F2]",
                    hover: "hover:bg-[#166FE5]",
                  },
                  {
                    name: "whatsapp",
                    icon: "💬",
                    bg: "bg-[#25D366]",
                    hover: "hover:bg-[#22C55E]",
                  },
                ].map((platform) => (
                  <motion.button
                    key={platform.name}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare(platform.name)}
                    className={`w-12 h-12 rounded-xl ${platform.bg} ${platform.hover} text-white flex items-center justify-center text-lg font-bold shadow-lg`}
                  >
                    {platform.icon}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="w-12 h-12 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-600 flex items-center justify-center shadow-lg"
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

          {/* Create Another */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
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
    </>
  );
}
