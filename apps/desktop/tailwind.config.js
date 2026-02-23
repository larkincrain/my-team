/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'gray-750': '#2d3748',
      },
    },
  },
  plugins: [],
};
