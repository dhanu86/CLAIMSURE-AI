/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF8F5',
          100: '#F8F5F0',
          200: '#F0EAE1',
          300: '#E9DFD3',
          400: '#DFD0BF',
        },
        nude: {
          50: '#FBF7F5',
          100: '#F4ECE7',
          200: '#E8D7CD',
          300: '#DCC7B8',
          400: '#C8AD9A',
          500: '#B59682',
        },
        taupe: {
          100: '#E8E2DD',
          200: '#D1C6BD',
          300: '#BBA99B',
          400: '#A89586',
          500: '#8A7768',
          600: '#6E5C4E',
        },
        sage: {
          50: '#F4F7F3',
          100: '#E4ECE1',
          200: '#C7D9C2',
          300: '#A8B5A0',
          400: '#87977E',
          500: '#697A60',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E6',
          300: '#9E9D9A',
          500: '#5B5A56',
          700: '#343330',
          800: '#262523',
          900: '#191817',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(52, 51, 48, 0.05), 0 2px 6px -1px rgba(52, 51, 48, 0.03)',
        'soft-lg': '0 10px 30px -4px rgba(52, 51, 48, 0.08), 0 4px 12px -2px rgba(52, 51, 48, 0.04)',
        'inner-light': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
