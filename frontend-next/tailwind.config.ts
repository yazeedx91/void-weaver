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
        // Breathing Emerald Theme
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4F46E5', // Primary emerald
          600: '#6366F1', // Bright emerald
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE55C',
          dark: '#B8860B',
        },
        obsidian: {
          DEFAULT: '#020617',
          light: '#0f172a',
          lighter: '#1e293b',
        },
        // Pearl Moonlight Theme (Sovereigness Sanctuary)
        pearl: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        moonlight: {
          DEFAULT: '#E2E8F0',
          silver: '#CBD5E1',
          dim: '#94A3B8',
        },
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
        'obsidian-gradient': 'linear-gradient(135deg, #020617 0%, #1e1b4b 100%)',
        'pearl-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      },
      animation: {
        'breathing': 'breathing 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)' },
          'to': { boxShadow: '0 0 40px rgba(79, 70, 229, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
};
export default config;