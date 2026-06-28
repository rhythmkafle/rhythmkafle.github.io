/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050607',
        panel: '#0b0d0f',
        parchment: '#e8e1d4',
        muted: '#8f887c',
        gold: '#c99a3e',
        'gold-muted': '#8f6b2f',
        warning: '#b4372d'
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow: '0 0 52px rgba(201, 154, 62, 0.08)'
      }
    }
  },
  plugins: []
};
