/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tint: 'var(--tint-color)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
      },
      backgroundColor: {
        app: 'var(--bg-app)',
        nav: 'var(--bg-nav)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
      },
      borderColor: {
        DEFAULT: 'var(--border-color)',
      }
    },
  },
  plugins: [],
}
