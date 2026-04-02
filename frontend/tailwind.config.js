module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#232C63',
          light: '#3d4a99',
          dark: '#1a2149',
        },
        'accent-blue': '#4f7cff',
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 10px 28px rgba(35, 44, 99, 0.12)',
      },
    },
  },
  plugins: [],
};
