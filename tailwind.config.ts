import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#09090b",
          secondary: "#111114",
          tertiary: "#18181b",
        },
        accent: {
          DEFAULT: "#6d5acd",
          soft: "rgba(109,90,205,0.12)",
          text: "#a78bfa",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          bright: "rgba(255,255,255,0.12)",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
