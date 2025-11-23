import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        sakura: {
          50: "#fef7f7",
          100: "#fee5e9",
          200: "#fecdd6",
          300: "#fda4b8",
          400: "#fb7193",
          500: "#f43f6e",
          600: "#e11d55",
          700: "#be1248",
          800: "#9e1343",
          900: "#86143f",
        },
        ghibli: {
          sky: "#87CEEB",
          grass: "#7CB342",
          cloud: "#F5F5F5",
          sunset: "#FF7043",
          forest: "#2E7D32",
        },
        light: {
          bg: "#FFFBF5",
          surface: "#FFFFFF",
          text: "#1F2937",
        },
        dark: {
          bg: "#0F172A",
          surface: "#1E293B",
          text: "#F1F5F9",
        },
        shimmerGold: "#FCD34D",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        "glass-dark": "linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))",
        "sakura-gradient": "linear-gradient(135deg, #fda4b8 0%, #fb7193 50%, #f43f6e 100%)",
        "ghibli-gradient": "linear-gradient(135deg, #87CEEB 0%, #7CB342 50%, #FF7043 100%)",
        "magic-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f43f6e 100%)",
        "gradient-light": "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
        "gradient-dark": "linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)",
        "gradient-secondary-dark": "linear-gradient(135deg, #60A5FA 0%, #22D3EE 100%)",
        "midnight-glow": "radial-gradient(circle at 20% 20%, rgba(96,165,250,0.2), transparent 35%), radial-gradient(circle at 80% 0%, rgba(244,114,182,0.2), transparent 30%), radial-gradient(circle at 50% 80%, rgba(252,211,77,0.15), transparent 35%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-lg": "0 25px 50px -12px rgba(31, 38, 135, 0.25)",
        "glow": "0 0 40px rgba(244, 63, 110, 0.3)",
        "glow-lg": "0 0 80px rgba(244, 63, 110, 0.4)",
        "sakura": "0 10px 40px rgba(253, 164, 184, 0.4)",
        "neon": "0 0 25px rgba(167, 139, 250, 0.45)",
        "neon-strong": "0 0 40px rgba(96, 165, 250, 0.45), 0 0 60px rgba(244, 114, 182, 0.35)",
      },
      backdropBlur: {
        glass: "16px",
      },
      dropShadow: {
        "glow": "0 0 12px rgba(167, 139, 250, 0.8)",
        "pink": "0 0 10px rgba(244, 114, 182, 0.65)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-slower": "float 10s ease-in-out infinite",
        "sakura-fall": "sakuraFall 10s linear infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "gradient": "gradient 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        sakuraFall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(244, 63, 110, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(244, 63, 110, 0.8)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
