import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Legacy
        sand: "#f6f7f3",
        ink: "#17201B",
        coral: "#E6A77A",
        amber: "#E9C98B",
        mint: "#9FC8B1",
        stone: "#edf1ea",
        // Aurora — offizielle Brand-Palette (PuQ.me_Aurora_Farben.css)
        puq: {
          pink: "#FF3D7F",
          "pink-2": "#FF6B9D",
          mint: "#7DF9C4",
          "mint-2": "#00D9A6",
          lemon: "#FCD34D",
          "lemon-2": "#F59E0B",
          indigo: "#1A3A8C",
          "indigo-2": "#2D5BC8",
          deep: "#02060F",
          night: "#06101A",
          card: "#0D1F3A",
          "card-2": "#13284D",
          text: "#FFFFFF",
          muted: "#BCD0E6",
          faint: "#5C6E8C",
          deepText: "#2D3F5E",
          line: "#0D1F3A",
          "line-2": "#1A3A8C",
          danger: "#FF4757"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "ui-serif", "Georgia", "serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(23, 32, 27, 0.08)",
        "puq-glow": "0 0 32px rgba(255, 61, 127, 0.35)"
      },
      animation: {
        "slide-up": "slideUp 500ms ease-out",
        "fade-in": "fadeIn 350ms ease-out",
        "soft-pulse": "softPulse 2.8s ease-in-out infinite",
        "puq-pulse": "puqPulse 3s ease-in-out infinite",
        "puq-twinkle": "puqTwinkle 5s ease-in-out infinite",
        "puq-radar": "puqRadar 4s ease-in-out infinite"
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        softPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.88" },
          "50%": { transform: "scale(1.03)", opacity: "1" }
        },
        puqPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,61,127,0.45)" },
          "50%": { boxShadow: "0 0 0 16px rgba(255,61,127,0)" }
        },
        puqTwinkle: {
          "0%, 100%": { opacity: "0.18" },
          "50%": { opacity: "0.9" }
        },
        puqRadar: {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.4)", opacity: "0" }
        }
      },
      backgroundImage: {
        "puq-aurora":
          "radial-gradient(ellipse 80% 60% at 75% 18%, rgba(255,61,127,0.18) 0%, rgba(2,6,15,0) 60%), radial-gradient(ellipse 70% 60% at 20% 100%, rgba(45,91,200,0.18) 0%, rgba(2,6,15,0) 65%), linear-gradient(180deg, #02060F 0%, #06101A 100%)",
        "puq-card":
          "linear-gradient(180deg, rgba(13,31,58,0.96) 0%, rgba(19,40,77,0.96) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
