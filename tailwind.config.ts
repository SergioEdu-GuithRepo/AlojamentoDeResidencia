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
        mrc: {
          espresso: "#0E281E",      // Deep Forest Green (Hero & Dark Overlays)
          espressoDark: "#081A13",  // Deeper Forest Shade
          terracotta: "#1A4734",    // Rich Botanical Emerald Green (Split Panels, Footer, Primary Accents)
          coral: "#3A7D5E",         // Emerald Sage Accent (+ buttons & highlights)
          blush: "#EDF4F0",         // Soft Sage Linen (Light Split Panels & Inquiry Section)
          blushDark: "#CCE0D5",     // Crisp Sage Border
          cream: "#F8FBF9",         // Soft Alabaster Green-White
          charcoal: "#0A1E15",      // High-Contrast Deep Forest Ink for Body Text
          muted: "#3B5B4D",         // High-Contrast Muted Forest for Labels & Subtitles
        },
      },
      fontFamily: {
        sans: [
          '"Avenir Next"',
          '"Futura"',
          '"Helvetica Neue"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        serif: [
          '"Didot"',
          '"Bodoni MT"',
          '"Cormorant Garamond"',
          '"Playfair Display"',
          "Georgia",
          "serif",
        ],
      },
      letterSpacing: {
        editorial: "0.16em",
        wideEditorial: "0.22em",
        ultraWide: "0.28em",
      },
    },
  },
  plugins: [],
};
export default config;
