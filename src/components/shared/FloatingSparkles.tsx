"use client";

import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

interface FloatingSparklesProps {
  count?: number;
}

export function FloatingSparkles({ count = 30 }: FloatingSparklesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sparkles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      type: Math.random() > 0.5 ? "star" : "circle",
      color: Math.random() > 0.6
        ? "rgba(139, 92, 246, 0.6)" // purple
        : Math.random() > 0.5
          ? "rgba(236, 72, 153, 0.5)" // pink
          : "rgba(251, 191, 36, 0.5)", // gold
    }));
  }, [count, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 1, 0],
            scale: [0, 1, 0.8, 1.2, 0],
            y: [-20, -100],
            x: [0, Math.sin(sparkle.id) * 30],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {sparkle.type === "star" ? (
            <svg
              viewBox="0 0 24 24"
              fill={sparkle.color}
              className="w-full h-full"
            >
              <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
            </svg>
          ) : (
            <div
              className="w-full h-full rounded-full"
              style={{
                background: sparkle.color,
                boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingHearts({ count = 15 }: FloatingSparklesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hearts = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 20 + 15,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 10,
      color: Math.random() > 0.5 ? "#EC4899" : "#8B5CF6",
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [count, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-0"
          style={{
            left: `${heart.x}%`,
            width: heart.size,
            height: heart.size,
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: [100, -1200],
            opacity: [0, heart.opacity, heart.opacity, 0],
            x: [0, Math.sin(heart.id) * 50, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={heart.color}
            className="w-full h-full"
            style={{ opacity: heart.opacity }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
