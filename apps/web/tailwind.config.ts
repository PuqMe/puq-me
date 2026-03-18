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
        sand: "#f6f7f3",
        ink: "#17201B",
        coral: "#E6A77A",
        amber: "#E9C98B",
        mint: "#9FC8B1",
        stone: "#edf1ea"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(23, 32, 27, 0.08)"
      },
      animation: {
        "slide-up": "slideUp 500ms ease-out",
        "fade-in": "fadeIn 350ms ease-out",
        "soft-pulse": "softPulse 2.8s ease-in-out infinite"
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
        }
      }
    }
  },
  plugins: []
};

export default config;
