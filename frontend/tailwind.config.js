module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A223F',
        accent: '#00C2FF',
        purple: '#7B2FF2',
        background: '#F8FAFC',
        text: '#1A223F',
        muted: '#6B7280',
        success: '#22C55E',
        error: '#EF4444',
        border: '#E5E7EB',
        foreground: '#111827',
      },
      backgroundImage: {
        'echosys-gradient': 'linear-gradient(90deg, #7B2FF2 0%, #00C2FF 100%)',
      },
    },
  },
}