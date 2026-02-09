/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flux: {
          obsidian: '#020617',
          indigo: '#4F46E5',
          silver: '#E2E8F0',
          'indigo-light': '#6366F1',
          'indigo-dark': '#3730A3',
          'glass': 'rgba(79, 70, 229, 0.1)',
          'glass-border': 'rgba(226, 232, 240, 0.1)',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'flux-pulse': 'fluxPulse 4s ease-in-out infinite',
        'flux-glow': 'fluxGlow 3s ease-in-out infinite alternate',
        'liquid-flow': 'liquidFlow 8s ease-in-out infinite',
      },
      keyframes: {
        fluxPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        fluxGlow: {
          '0%': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(79, 70, 229, 0.6)' },
        },
        liquidFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'flux-gradient': 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #020617 100%)',
        'flux-radial': 'radial-gradient(ellipse at center, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
