/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        'hud-bg': '#0a1014',
        'hud-bg-secondary': '#101820',
        'hud-border': '#274358',
        'hud-text': '#c3d8e8',
        'hud-text-secondary': '#7b95a8',
        'hud-accent': '#00e0e0',
        'hud-accent-secondary': '#00a0a0',
        'hud-green': '#32ff7e',
        'hud-red': '#ff4d4d',
      },
      boxShadow: {
        'hud': '0 0 15px rgba(0, 224, 224, 0.3)',
        'hud-inner': 'inset 0 0 10px rgba(0, 224, 224, 0.2)',
      }
    },
  },
  plugins: [],
}