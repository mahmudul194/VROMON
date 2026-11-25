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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        vromon: {
          bg: '#e5f0e0',
          canvas: '#f0fdec',
          leaf: '#f6faf3',
          pill: '#d5e6cf',
          border: '#c1c9bb',
          primary: '#2f6b2f',
          deep: '#145219',
          accent: '#5d9253',
          olive: '#557945',
          amber: '#ffcb3d',
          dark: '#1f2a1f',
          ink: '#131e14',
          muted: '#41493e',
          over: '#f28c28',
          danger: '#c62828',
        },
      },
      boxShadow: {
        ambient: '0 20px 60px rgba(31, 42, 31, 0.09)',
        soft: '0 8px 28px rgba(31, 42, 31, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
