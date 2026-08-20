/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#090D16",
        slate: "#0F172A",
        amber: {
          DEFAULT: "#F59E0B",
        },
        crimson: "#EF4444",
        teal: "#14B8A6",
        glass: "rgba(255, 255, 255, 0.06)",
        "glass-border": "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        "glow-amber": "0 0 24px rgba(245, 158, 11, 0.35)",
        "glow-crimson": "0 0 24px rgba(239, 68, 68, 0.35)",
      },
    },
  },
  plugins: [],
};