import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s ease-out',
      },
      colors: {
        "hp-purple": {
          50: "#F5F0FA",
          100: "#E8DFF5",
          200: "#D1BFEB",
          300: "#B89FE0",
          400: "#9E7FD6",
          500: "#6B3FA0",
          600: "#5A3589",
          700: "#482A6E",
          800: "#371F54",
          900: "#2D1054",
          DEFAULT: "#2D1054",
        },
        "hp-accent": {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          DEFAULT: "#22C55E",
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
