import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Galatasaray-inspired romantic palette
        gs: {
          red: "#E8002D",
          "red-dark": "#B5001F",
          "red-light": "#FF1A47",
          gold: "#FFD700",
          "gold-dark": "#F0C000",
          "gold-light": "#FFE566",
        },
        dark: {
          950: "#080811",
          900: "#0D0D1A",
          800: "#131327",
          700: "#1A1A35",
          600: "#222242",
          500: "#2A2A55",
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.10)",
          "border-strong": "rgba(255,255,255,0.18)",
          red: "rgba(232, 0, 45, 0.15)",
          gold: "rgba(255, 215, 0, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-romantic": "linear-gradient(135deg, #E8002D 0%, #FFD700 100%)",
        "gradient-dark": "linear-gradient(180deg, #0D0D1A 0%, #131327 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(232,0,45,0.15) 0%, rgba(255,215,0,0.08) 100%)",
        "gradient-hero": "radial-gradient(ellipse at top, #1A0A10 0%, #0D0D1A 60%, #080811 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
        "glass-lg": "0 16px 48px 0 rgba(0, 0, 0, 0.5)",
        red: "0 0 20px rgba(232, 0, 45, 0.3)",
        gold: "0 0 20px rgba(255, 215, 0, 0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%": { boxShadow: "0 0 10px rgba(232,0,45,0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(232,0,45,0.6)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
