/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        primary: '#111111',
        accent: '#00C853',
        secondary: '#EAEAEA',
        danger: '#F44336',
        warning: '#FF9800',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Ubuntu', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.08)',
        glow: '0 0 16px rgba(0,200,83,0.25)',
        'glow-yellow': '0 0 16px rgba(255,152,0,0.35)',
      },
    },
  },
  plugins: [],
};
