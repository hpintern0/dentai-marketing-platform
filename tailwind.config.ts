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
        "dental-blue": {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd8ff",
          300: "#8ec0ff",
          400: "#599eff",
          500: "#3478f6",
          600: "#1e5aeb",
          700: "#1645d8",
          800: "#1839af",
          900: "#1a348a",
          DEFAULT: "#1e5aeb",
        },
        "dental-teal": {
          50: "#effefb",
          100: "#c8fff4",
          200: "#91feea",
          300: "#53f5dc",
          400: "#20e0c9",
          500: "#08c4b0",
          600: "#039e91",
          700: "#077e75",
          800: "#0b645e",
          900: "#0e524e",
          DEFAULT: "#08c4b0",
        },
        "dental-green": {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          DEFAULT: "#22c55e",
        },
        "dental-cream": {
          50: "#fefdf8",
          100: "#fdf9ec",
          200: "#faf1d0",
          300: "#f6e6a9",
          400: "#f0d47a",
          500: "#e9be4c",
          600: "#d4a233",
          700: "#b17f28",
          800: "#906427",
          900: "#765224",
          DEFAULT: "#fdf9ec",
        },
      },
    },
  },
  plugins: [],
};

export default config;
