/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        surface: '#FFFFFF',
        background: '#F9FAFB',
        'biz-wonton': '#F97316',
        'biz-esteh': '#14B8A6',
        'biz-dimsum': '#F43F5E',
        'biz-sembako': '#22C55E',
      },
    },
  },
  plugins: [],
}
