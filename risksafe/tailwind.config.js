/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#1E2A3B',
        'sidebar-hover': '#273548',
        'sidebar-active': '#2E3F56',
        critical: '#EF4444',
        high: '#F97316',
        medium: '#EAB308',
        low: '#22C55E',
        background: '#F1F5F9',
      },
    },
  },
  plugins: [],
}
