/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark: {
          50: '#f0f0fa',
          100: '#e0e0f0',
          200: '#c0c0e0',
          300: '#8888aa',
          400: '#55556a',
          500: '#2a2a3a',
          600: '#1c1c28',
          700: '#16161f',
          800: '#111118',
          900: '#0a0a0f',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#8b5cf6',
          hover: '#6d28d9',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.4s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
