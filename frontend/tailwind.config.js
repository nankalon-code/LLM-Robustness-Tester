/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          bg: '#EFE6D5',
          card: '#FAF6EE',
          border: '#262626',
          text: '#1C1917',
          muted: '#78716C',
        },
        retro: {
          yellow: '#FFD000',
          orange: '#F95738',
          cream: '#F3ECDC',
          charcoal: '#1C1917',
          psblue: '#012456',
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'Space Mono', 'Consolas', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
