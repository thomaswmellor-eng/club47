import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        gold: {
          100: '#F9F1D8',
          300: '#EAD18F',
          500: '#D4AF37',
          600: '#AA8C2C',
          700: '#806921',
        },
        midnight: '#0A0A0A',
        charcoal: '#121212',
      },
    },
  },
  plugins: [],
};

export default config;
