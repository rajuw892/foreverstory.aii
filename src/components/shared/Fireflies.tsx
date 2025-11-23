"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function Fireflies({ count = 20 }: { count?: number }) {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);

  useEffect(() => {
    const newFireflies: Firefly[] = [];
    for (let i = 0; i < count; i++) {
      newFireflies.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 5,
      });
    }
    setFireflies(newFireflies);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute rounded-full"
          style={{
            left: `${firefly.x}%`,
            top: `${firefly.y}%`,
            width: firefly.size,
            height: firefly.size,
            background: "radial-gradient(circle, rgba(255,223,0,1) 0%, rgba(255,223,0,0) 70%)",
            boxShadow: "0 0 20px rgba(255,223,0,0.8), 0 0 40px rgba(255,223,0,0.4)",
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5],
            x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: firefly.duration,
            delay: firefly.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
