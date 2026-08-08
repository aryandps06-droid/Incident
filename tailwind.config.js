/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#050816',
          card: '#101828',
          surface: '#152033',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          accent: '#4F8CFF',
          emergency: '#FF4D4F',
          success: '#22C55E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'orb-blue': '0 0 80px 15px rgba(79, 140, 255, 0.35)',
        'orb-red': '0 0 90px 20px rgba(255, 77, 79, 0.45)',
        'card-soft': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glow-brand': '0 0 30px rgba(79, 140, 255, 0.4)',
        'glow-red': '0 0 35px rgba(255, 77, 79, 0.45)',
      }
    },
  },
  plugins: [],
}
