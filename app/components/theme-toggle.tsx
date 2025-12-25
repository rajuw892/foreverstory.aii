"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-12 h-12" />; // Placeholder to prevent layout shift
  }

  // Cycle through: light -> dark -> system
  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "system") {
      return (
        <motion.div
          key="monitor"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Monitor className="h-6 w-6 text-purple-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
        </motion.div>
      );
    }
    if (theme === "dark") {
      return (
        <motion.div
          key="moon"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Moon className="h-6 w-6 text-purple-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
        </motion.div>
      );
    }
    return (
      <motion.div
        key="sun"
        initial={{ rotate: 90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: -90, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Sun className="h-6 w-6 text-amber-400 drop-shadow-[0_0_14px_rgba(252,211,77,0.85)]" />
      </motion.div>
    );
  };

  const getLabel = () => {
    if (theme === "system") return "System theme";
    if (theme === "dark") return "Dark mode";
    return "Light mode";
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className={`group relative inline-flex items-center justify-center rounded-full p-3 backdrop-blur-xl border transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A78BFA] shadow-[0_0_24px_rgba(167,139,250,0.25)] border-white/30 dark:border-purple-400/30 bg-white/70 dark:bg-[#1E293B]/70 text-gray-800 dark:text-[#F1F5F9] ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#A78BFA]/30 via-transparent to-[#F472B6]/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
      <AnimatePresence mode="wait" initial={false}>
        {getThemeIcon()}
      </AnimatePresence>

      {/* Tooltip */}
      <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
        <div className="rounded-full bg-black/70 px-3 py-1 text-xs text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur whitespace-nowrap">
          {getLabel()}
        </div>
      </div>
    </motion.button>
  );
}
