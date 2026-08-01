/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          500: '#64748B',
          900: '#0F172A'
        },
        brand: {
          orange: '#FF5500',
          hover: '#E03A00',
          deep: '#902000'
        }
      },
      boxShadow: {
        'neu': '-6px -6px 12px #FFFFFF, 6px 6px 12px #CBD5E1',
        'neu-dark': '-6px -6px 12px #1E293B, 6px 6px 12px #060B14',
        'neu-sm': '-4px -4px 8px #FFFFFF, 4px 4px 8px #CBD5E1',
        'neu-inset': 'inset -4px -4px 8px #FFFFFF, inset 4px 4px 8px #CBD5E1',
        'neu-inset-dark': 'inset -4px -4px 8px #1E293B, inset 4px 4px 8px #060B14',
        'neu-pressed': 'inset -3px -3px 6px #FFFFFF, inset 3px 3px 6px #CBD5E1'
      },
      borderRadius: {
        'card': '20px',
        'neu': '14px'
      }
    },
  },
  plugins: [],
};
