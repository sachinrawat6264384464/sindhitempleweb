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
        saffron: {
          50: "#fff9eb",
          100: "#feefc7",
          200: "#fddc8a",
          300: "#fcc44d",
          400: "#fbac1d",
          500: "#f58c0b",
          600: "#d96906",
          700: "#b44808",
          800: "#92370e",
          900: "#782e0f",
        },
        amrapur: {
          50: "#fffaf4",
          100: "#fef4e8",
          200: "#fde5cb",
          300: "#f9d5a6",
          400: "#f4be77",
          500: "#e69e46",
          600: "#c77a28",
          700: "#9f591d",
          800: "#7b4219",
          900: "#552c11",
          950: "#381c09",
        },
        devotional: {
          parchment: "#FBF9F5",
          sand: "#F4EFE6",
          border: "#E7DFD3",
          ink: "#231F1C",
          muted: "#665E55",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Noto Serif Devanagari'", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
