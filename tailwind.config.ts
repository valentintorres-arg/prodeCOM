import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#060b1a",
          800: "#0b1427",
          700: "#0e1a35",
          600: "#132245",
        },
        gold: {
          400: "#ffd700",
          500: "#f5c400",
        },
      },
      backgroundImage: {
        "world-cup": "linear-gradient(135deg, #060b1a 0%, #0b1e42 50%, #06122e 100%)",
      },
    },
  },
  plugins: [
    // Safe-area padding utilities (pb-safe, pt-safe, etc.)
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".pb-safe": { paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" },
        ".pt-safe": { paddingTop: "env(safe-area-inset-top, 0px)" },
        ".pl-safe": { paddingLeft: "env(safe-area-inset-left, 0px)" },
        ".pr-safe": { paddingRight: "env(safe-area-inset-right, 0px)" },
        ".mb-safe": { marginBottom: "env(safe-area-inset-bottom, 0px)" },
      });
    },
  ],
};

export default config;
