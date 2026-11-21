/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          0: '#EEF2FF',
          50: '#E0E7FF',
          100: '#C7D2FE',
          500: '#2447F9',
          600: '#1A38D4',
        },
        secondary: {
          0: '#E7F7F6',
          50: '#C6F6E2',
          500: '#00BA9D',
          600: '#009B83',
        },
        typography: {
          0: '#FFFFFF',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          900: '#0C102A',
        },
        background: {
          0: '#FFFFFF',
          50: '#F8FAFC',
          100: '#F1F5F9',
          900: '#0C102A',
        },
        outline: {
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
        },
      },
    },
  },
  plugins: [],
};
