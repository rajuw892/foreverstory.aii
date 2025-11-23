"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={`group relative inline-flex items-center justify-center rounded-full p-3 backdrop-blur-xl border transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A78BFA] shadow-[0_0_24px_rgba(167,139,250,0.25)] border-white/30 dark:border-purple-400/30 bg-white/70 dark:bg-[#1E293B]/70 text-gray-800 dark:text-[#F1F5F9] ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A78BFA]/30 via-transparent to-[#F472B6]/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative"
          >
            <Moon className="h-6 w-6 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative"
          >
            <Sun className="h-6 w-6 text-amber-400 drop-shadow-[0_0_14px_rgba(252,211,77,0.85)]" />
            <motion.span
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur">
          {label}
        </div>
      </div>
    </motion.button>
  );
}
