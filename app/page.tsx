"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { FloatingSparkles, FloatingHearts } from "@/components/shared/FloatingSparkles";
import { TypeAnimation } from "react-type-animation";
import {
  Heart,
  Sparkles,
  Play,
  Star,
  Clock,
  Zap,
  Globe,
  Languages,
  Check,
  Palette,
  Film,
  Shield,
  Diamond,
} from "lucide-react";

const DEMO_VIDEOS = [
  { id: 1, title: "Sarah & John", style: "Ghibli", gradient: "from-emerald-400 to-teal-500" },
  { id: 2, title: "Priya & Raj", style: "Anime", gradient: "from-pink-400 to-rose-500" },
  { id: 3, title: "Emma & Lucas", style: "Pixar", gradient: "from-blue-400 to-indigo-500" },
];

const TESTIMONIALS = [
  {
    name: "Jessica M.",
    location: "San Francisco, USA",
    text: "I cried watching our story. It captured every emotion perfectly! The Ghibli style felt like a dream.",
    rating: 5,
    avatar: "JM",
  },
  {
    name: "Arjun K.",
    location: "Mumbai, India",
    text: "We played this at our wedding and everyone was in tears. Worth every penny, and the Hindi narration was perfect.",
    rating: 5,
    avatar: "AK",
  },
  {
    name: "Sophie L.",
    location: "Paris, France",
    text: "It made our love story look like a magical movie. Incredible quality and so romantic!",
    rating: 5,
    avatar: "SL",
  },
];

const STEPS = [
  {
    icon: Heart,
    title: "Share Your Story",
    description: "Answer 8 tender questions about how you met, your firsts, and the moments that made you two.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Palette,
    title: "Choose Your Style",
    description: "Pick a breathtaking animation style: Ghibli, Anime, Pixar, Disney, or Arcane.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Film,
    title: "Watch AI Magic",
    description: "In minutes, your 90-second animated film is ready with narration in your language.",
    color: "from-blue-500 to-cyan-500",
  },
];

const STYLES = [
  { name: "Studio Ghibli", emoji: "🌸", desc: "Dreamy, hand-painted warmth", color: "from-emerald-400 to-teal-500" },
  { name: "Classic Anime", emoji: "🎎", desc: "Elegant Japanese romance", color: "from-pink-400 to-rose-500" },
  { name: "Pixar", emoji: "✨", desc: "Heartfelt cinematic glow", color: "from-blue-400 to-indigo-500" },
  { name: "Disney Princess", emoji: "👑", desc: "Fairytale sparkle & wonder", color: "from-purple-400 to-violet-500" },
  { name: "Arcane", emoji: "🌌", desc: "Edgy, artful storytelling", color: "from-amber-400 to-orange-500" },
];

const FEATURES = [
  "Free preview with a tiny watermark",
  "HD + 4K downloads without watermark",
  "90-second cinematic length",
  "Choose from 5 romantic styles",
  "12 language narration support",
  "Lifetime access to your video",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFF7F0] via-[#FFF1F7] to-[#F2ECFF] text-gray-900 dark:from-[#0F172A] dark:via-[#0B1224] dark:to-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-700">
      <FloatingSparkles count={45} />
      <FloatingHearts count={12} />

      {/* Romantic glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-pink-200/50 blur-3xl dark:bg-[#A78BFA]/25" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl dark:bg-[#22D3EE]/20" />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-amber-100/60 blur-2xl dark:bg-[#FCD34D]/15" />
      </div>

      {/* Hero */}
      <section className="relative px-4 pt-24 pb-16 md:pt-28">
        <div className="max-w-6xl mx-auto grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/70 dark:bg-[#1E293B]/70 border border-white/50 dark:border-white/10 shadow-lg shadow-purple-500/10">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Love that lives forever</span>
            </div>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight dark:text-shadow-glow"
              >
                Turn Your Love Story{" "}
                <span className="gradient-text block md:inline">
                  <TypeAnimation
                    sequence={["into Magic", 2000, "into an Animated Film", 2000, "into a Forever Memory", 2000]}
                    wrapper="span"
                    speed={50}
                    repeat={Infinity}
                  />
                </span>
              </motion.h1>
              <p className="mt-5 text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed">
                Create a luxurious, romantic animated film of your love in 5 minutes. Choose iconic art styles, add
                narration in 12 languages, and keep the magic forever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/create">
                <Button size="xl" variant="glow" className="group text-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Create Your Story
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="secondary" className="group">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Examples
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, text: "Ready in 5 min" },
                { icon: Zap, text: "Fully automated" },
                { icon: Languages, text: "12 languages" },
                { icon: Globe, text: "50k+ couples" },
              ].map((badge, i) => (
                <GlassCard
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-[#1E293B]/80 border-white/60 dark:border-purple-500/15 shadow-sm"
                >
                  <badge.icon className="w-4 h-4 text-purple-500 dark:text-[#A78BFA]" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{badge.text}</span>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -left-6 -top-6 bg-gradient-to-br from-[#A78BFA]/25 via-[#F472B6]/25 to-[#22D3EE]/25 blur-3xl" />
            <div className="relative rounded-[32px] p-6 bg-white/80 dark:bg-[#0F172A]/80 border border-white/40 dark:border-purple-500/20 shadow-2xl shadow-purple-500/15 dark:shadow-purple-500/25">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Premium render</p>
                    <p className="font-display font-semibold">ForeverStory.ai</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]" />
                  <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_0_6px_rgba(252,211,77,0.2)]" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_0_6px_rgba(251,113,133,0.2)]" />
                </div>
              </div>

              <div className="iphone-frame">
                <div className="video-container bg-gradient-to-br from-purple-200 to-pink-200 dark:from-[#111827] dark:to-[#1E293B] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A78BFA]/70 via-transparent to-[#F472B6]/60 mix-blend-screen dark:mix-blend-lighten" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-white/90 dark:bg-[#1E293B] shadow-xl flex items-center justify-center mb-4"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Play className="w-8 h-8 text-gray-800 dark:text-white ml-1" />
                    </motion.div>
                    <h3 className="font-display text-xl font-semibold text-white drop-shadow">Preview your film</h3>
                    <p className="text-white/80 text-sm">Romantic animations with glowing gradients</p>
                  </div>
                </div>
              </div>

              <GlassCard className="mt-4 p-4 bg-white/80 dark:bg-[#111827]/80 border border-white/60 dark:border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-pink-400 flex items-center justify-center text-white shadow-neon">
                    <Diamond className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Promise of romance</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      Handcrafted glow, soft gradients, and gold accents for a premium feel.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos */}
      <section id="demo" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-script text-2xl text-pink-500 mb-2 block">See the magic</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 dark:text-shadow-glow">
              Real Love Stories, <span className="gradient-text">Animated</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
              Watch how couples turned their memories into luminous films with glowing gradients and soft romance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEMO_VIDEOS.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-4 bg-white/80 dark:bg-[#0F172A]/70 border border-white/60 dark:border-purple-500/15 shadow-lg dark:shadow-purple-500/20">
                  <div className="iphone-frame">
                    <div className="video-container cursor-pointer group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-80`} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          className="w-16 h-16 rounded-full bg-white/90 shadow-xl flex items-center justify-center mb-3"
                          whileHover={{ scale: 1.08 }}
                        >
                          <Play className="w-7 h-7 text-gray-800 ml-1" />
                        </motion.div>
                        <h3 className="font-display text-xl font-semibold text-white">{video.title}</h3>
                        <p className="text-white/80 text-sm">{video.style} Style</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-script text-2xl text-pink-500 mb-2 block">Simple process</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-shadow-glow">
              Three Steps to Your <span className="gradient-text">Forever Story</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, index) => (
              <GlassCard
                key={index}
                className="p-8 text-center relative overflow-hidden group bg-white/80 dark:bg-[#0F172A]/80 border border-white/60 dark:border-purple-500/20 shadow-lg dark:shadow-purple-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent" />
                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-neon-strong`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 relative z-10">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">{step.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Styles */}
      <section className="relative z-10 py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-script text-2xl text-pink-500 mb-2 block">Pick your aesthetic</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 dark:text-shadow-glow">
              5 Romantic <span className="gradient-text">Animation Styles</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Every style feels bespoke and premium.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STYLES.map((style, index) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="overflow-hidden group bg-white/80 dark:bg-[#0F172A]/80 border-white/60 dark:border-purple-500/20">
                  <div className={`h-36 bg-gradient-to-br ${style.color} flex items-center justify-center relative`}>
                    <span className="text-5xl transform group-hover:scale-110 transition-transform duration-500">
                      {style.emoji}
                    </span>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-display font-semibold text-lg">{style.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{style.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-script text-2xl text-pink-500 mb-2 block">Love letters</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 dark:text-shadow-glow">
              Loved by <span className="gradient-text">Couples Worldwide</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Join thousands creating luminous keepsakes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <GlassCard
                key={index}
                className="p-7 h-full bg-white/80 dark:bg-[#0F172A]/80 border-white/60 dark:border-purple-500/20 shadow-lg dark:shadow-purple-500/20"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed italic">
                  “{testimonial.text}”
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold shadow-neon">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{testimonial.location}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-10 md:p-14 text-center relative overflow-hidden bg-white/85 dark:bg-[#0F172A]/85 border border-white/60 dark:border-purple-500/25 shadow-xl dark:shadow-purple-500/25">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-gradient-to-br from-amber-400/10 to-pink-400/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <span className="font-script text-2xl text-pink-500 mb-2 block">Simple pricing</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 dark:text-shadow-glow">
                One Story, One <span className="gradient-text">Price</span>
              </h2>

              <div className="mb-10">
                <div className="inline-flex items-baseline gap-2 mb-2">
                  <span className="font-display text-6xl md:text-7xl font-bold gradient-text">$9.99</span>
                  <span className="text-gray-500 dark:text-gray-300 text-lg">/ video</span>
                </div>
                <p className="text-gray-500 dark:text-gray-300">
                  or <span className="font-semibold">Rs 1,799</span> in India
                </p>
              </div>

              <ul className="text-left max-w-md mx-auto space-y-4 mb-10">
                {FEATURES.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/create">
                <Button size="xl" variant="magic" className="w-full max-w-sm group shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Creating Free
                </Button>
              </Link>

              <p className="text-sm text-gray-500 dark:text-gray-300 mt-4">No credit card needed for preview</p>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Secure payments
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Built for romance
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block mb-8"
          >
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500 pulse-glow rounded-full" />
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 dark:text-shadow-glow">
            Your Love Story Deserves <span className="gradient-text">To Glow Forever</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Join over 50,000 couples who have transformed their memories into romantic animated keepsakes.
          </p>

          <Link href="/create">
            <Button size="xl" variant="glow" className="group shadow-purple-500/25">
              <Heart className="w-5 h-5 mr-2 fill-white group-hover:scale-125 transition-transform" />
              Create Your Forever Story
              <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-purple-100 dark:border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
              <span className="font-display font-semibold text-xl gradient-text">ForeverStory.ai</span>
            </div>

            <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-300">
              <a href="#" className="hover:text-purple-600 dark:hover:text-[#A78BFA] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-600 dark:hover:text-[#A78BFA] transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-600 dark:hover:text-[#A78BFA] transition-colors">Contact</a>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Made with <Heart className="w-4 h-4 inline text-pink-500 fill-pink-500" /> for lovers everywhere
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
