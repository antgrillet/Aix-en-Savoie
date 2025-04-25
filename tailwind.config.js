/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./save.html",
    "./*.html",
    "./src/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mont: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
