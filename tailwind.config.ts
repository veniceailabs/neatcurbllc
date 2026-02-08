import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        "neat-forest": "#016B37",
        "neat-lawn": "#23B04B",
        "neat-sky": "#4EC7EC",
        "neat-deep": "#4776BA",
        "neat-amber": "#FFB71B",
        "neat-autumn": "#F68C1E",
        "neat-action": "#EF4E23",
        "neat-ink": "#0D1B1E",
        "neat-cloud": "#F2F7F9"
      },
      fontFamily: {
        display: ["Avenir Next", "Avenir", "Sora", "sans-serif"],
        body: ["Avenir Next", "Avenir", "Sora", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(78, 199, 236, 0.25), 0 20px 50px rgba(1, 107, 55, 0.15)",
        soft: "0 16px 40px rgba(3, 12, 21, 0.12)",
        inset: "inset 0 0 0 1px rgba(255, 255, 255, 0.12)"
      },
      backgroundImage: {
        "frost-radial": "radial-gradient(circle at top left, rgba(78, 199, 236, 0.35), transparent 55%)",
        "forest-radial": "radial-gradient(circle at 30% 20%, rgba(1, 107, 55, 0.25), transparent 60%)",
        "hero-gradient": "linear-gradient(135deg, rgba(1, 107, 55, 0.15), rgba(71, 118, 186, 0.2))"
      }
    }
  },
  plugins: []
};

export default config;
