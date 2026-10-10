/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
          DEFAULT: 'rgb(var(--primary-rgb) / <alpha-value>)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary-rgb) / <alpha-value>)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
        },
        accent: 'var(--accent)',
        surface: 'var(--surface)',
        danger: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        border: 'var(--border)',
        background: 'var(--background)',
        card: 'var(--card-bg)',
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
        card: 'var(--shadow-lg)',
        soft: 'var(--shadow-md)',
        panel: 'var(--shadow-sm)',
      },
    },
  },
  plugins: [],
};
