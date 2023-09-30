/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D1B62",
        secondary: "#354789"
      },
      height: {
        x1: "73.375rem"
      },
      width: {
        x1: "54.563rem"
      }
    },
  },
  plugins: [],
};
