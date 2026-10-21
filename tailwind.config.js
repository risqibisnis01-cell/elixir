/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#d4af37",
          500: "#c5a059",
          600: "#aa8844",
        },
        royal: {
          bg: "#0d0d0d",
          card: "#161616",
        },
      },
      fontFamily: {
        display: ['"Belgan Aesthetic"', 'serif'],
        body: ['"Metropolis"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
