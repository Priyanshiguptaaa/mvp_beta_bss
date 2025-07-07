import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    colors: {
      // Custom purple palette
      purple: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
        950: '#2e1065',
      },
      // Custom indigo palette
      indigo: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: "#818cf8",
        500: "#6366f1",
        600: "#4f46e5",
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
        950: "#1e1b4b",
      },
      // Status colors
      green: {
        100: "#dcfce7",
        200: "#bbf7d0",
        800: "#166534",
      },
      red: {
        100: "#fee2e2",
        200: "#fecaca",
        800: "#991b1b",
      },
      amber: {
        100: "#fef3c7",
        200: "#fde68a",
        800: "#92400e",
      },
      // Base theme colors (CSS variables)
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: "hsl(var(--primary))",
      "primary-foreground": "hsl(var(--primary-foreground))",
      secondary: "hsl(var(--secondary))",
      "secondary-foreground": "hsl(var(--secondary-foreground))",
      accent: "hsl(var(--accent))",
      "accent-foreground": "hsl(var(--accent-foreground))",
      border: "hsl(var(--border))",
      transparent: "transparent",
      current: "currentColor",
      white: "#fff",
      black: "#000",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(to right, #c4b5fd, #a78bfa, #8b5cf6)",
        "indigo-gradient": "linear-gradient(to right, #818cf8, #6366f1, #4f46e5)",
        "blurple-gradient": "linear-gradient(to right, #c4b5fd, #a5b4fc, #818cf8)",
        "hero-gradient": "linear-gradient(to bottom right, #e0e7ff, #c7d2fe, #ddd6fe, #c4b5fd)",
        "card-gradient": "linear-gradient(to bottom right, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-purple-50',
    'hover:bg-purple-50',
    'bg-purple-100',
    'hover:bg-purple-100',
    'bg-purple-200',
    'hover:bg-purple-200',
    'bg-purple-500',
    'bg-purple-600',
    'hover:bg-purple-600',
    'bg-purple-700',
    'hover:bg-purple-700',
    'text-purple-900',
    'hover:text-purple-900',
    'text-purple-700',
    'bg-indigo-500',
    'bg-indigo-600',
    'bg-green-100',
    'text-green-800',
    'bg-red-100',
    'text-red-800',
    'bg-amber-100',
    'text-amber-800',
    'border-purple-100',
    'border-purple-200',
    'shadow-purple-200/40',
    // Add any other classes you use in @apply or want to guarantee
  ],
} satisfies Config

export default config 