/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        vinho: '#5a0f2b',
        rosa: '#f5e6ea',
        dourado: '#c9a24b',
      },
      fontFamily: {
        titulo: ['"Playfair Display"', 'serif'],
        corpo: ['"Poppins"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
