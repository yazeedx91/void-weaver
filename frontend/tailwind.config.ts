import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // RTL-friendly logical properties
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-ibm-plex-sans-arabic)', 'system-ui', 'sans-serif'],
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
  // RTL support for logical properties
  corePlugins: {
    preflight: true,
  },
};

export default config;
