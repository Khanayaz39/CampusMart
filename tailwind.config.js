/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/**/*.html",
    "./public/js/**/*.js"
  ],
  corePlugins: {
    preflight: false,
    container: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          light: '#818CF8',
          dark: '#3730A3',
        },
        secondary: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        accent: '#F59E0B',
        surface: '#F1F5F9',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        border: '#E2E8F0',
        background: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.12)',
        soft: '0 10px 30px rgba(0, 0, 0, 0.08)',
        panel: '0 4px 20px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
