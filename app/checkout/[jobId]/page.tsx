"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { FloatingSparkles } from "@/components/shared/FloatingSparkles";
import { Heart, Shield, Check, Sparkles, ArrowLeft, CreditCard, Lock, Zap } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { text: "HD + 4K video quality", icon: "🎬" },
  { text: "No watermark", icon: "✨" },
  { text: "Lifetime access", icon: "♾️" },
  { text: "Download unlimited times", icon: "📥" },
  { text: "Share anywhere", icon: "🌍" },
];

export default function CheckoutPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState<"usd" | "inr">("usd");

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (response.ok) {
          const data = await response.json();
          if (data.country === "IN") {
            setCurrency("inr");
          }
        }
      } catch {
        // Default to USD
      }
    };
    detectCurrency();
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, currency }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const price = currency === "inr" ? "Rs 1,799" : "$9.99";

  return (
    <main className="relative min-h-screen overflow-hidden animated-gradient-bg transition-colors duration-700">
      <FloatingSparkles count={20} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Back Link */}
        <Link
          href={`/result/${jobId}`}
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full glass text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to video</span>
        </Link>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
          <span className="font-display font-semibold text-xl gradient-text">ForeverStory.ai</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 md:p-10 dark:shadow-purple-500/20 dark:border-purple-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-white font-medium mb-5 shadow-lg shadow-purple-500/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Premium Upgrade</span>
              </motion.div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
                Unlock Your <span className="gradient-text">Forever Story</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Remove the watermark and get crystal-clear HD quality
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-baseline gap-2"
              >
                <span className="font-display text-5xl md:text-6xl font-bold gradient-text">{price}</span>
                <span className="text-gray-400 text-lg">one-time</span>
              </motion.div>

              {/* Currency Toggle */}
              <div className="flex justify-center gap-2 mt-5">
                {[
                  { id: "usd", label: "USD ($)" },
                  { id: "inr", label: "INR (Rs)" },
                ].map((curr) => (
                  <motion.button
                    key={curr.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrency(curr.id as "usd" | "inr")}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      currency === curr.id
                        ? "gradient-primary text-white shadow-lg shadow-purple-500/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {curr.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {FEATURES.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/50 hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{feature.text}</span>
                  <Check className="w-5 h-5 text-green-500 ml-auto" />
                </motion.li>
              ))}
            </ul>

            {/* Checkout Button */}
            <Button
              size="xl"
              variant="glow"
              className="w-full group"
              onClick={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Pay {price} Now
                </>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Instant access</span>
              </div>
            </div>

            {/* Stripe Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">Powered by</span>
              <span className="font-semibold text-gray-600 dark:text-gray-300">Stripe</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Refund Policy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm max-w-sm"
        >
          Not satisfied? Contact us within 24 hours for a full refund. No questions asked.
        </motion.p>
      </div>
    </main>
  );
}
