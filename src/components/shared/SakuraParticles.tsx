"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Petal {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

export function SakuraParticles({ count = 30 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < count; i++) {
      newPetals.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 10,
        size: 10 + Math.random() * 15,
        rotation: Math.random() * 360,
      });
    }
    setPetals(newPetals);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 0 }}
          animate={{
            y: "110vh",
            rotate: 720,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-sakura-300"
          >
            <path
              d="M12 2C12 2 14.5 6.5 14.5 9.5C14.5 12.5 12 14 12 14C12 14 9.5 12.5 9.5 9.5C9.5 6.5 12 2 12 2Z"
              fill="currentColor"
              opacity="0.8"
            />
            <path
              d="M12 14C12 14 16.5 11.5 19.5 11.5C22.5 11.5 24 14 24 14C24 14 22.5 16.5 19.5 16.5C16.5 16.5 12 14 12 14Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M12 14C12 14 7.5 11.5 4.5 11.5C1.5 11.5 0 14 0 14C0 14 1.5 16.5 4.5 16.5C7.5 16.5 12 14 12 14Z"
              fill="currentColor"
              opacity="0.6"
            />
            <path
              d="M12 14C12 14 14.5 18.5 14.5 21.5C14.5 24.5 12 26 12 26C12 26 9.5 24.5 9.5 21.5C9.5 18.5 12 14 12 14Z"
              fill="currentColor"
              opacity="0.7"
            />
            <circle cx="12" cy="14" r="2" fill="#FFB7C5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
