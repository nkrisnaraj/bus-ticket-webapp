/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xxs: '0.625rem', // 10px
      },
      colors: {
        customGray: '#dbdbdb',
      },
      screens: {
        'xs': '340px', // min-width
      },
    },
  },
  plugins: [],
}