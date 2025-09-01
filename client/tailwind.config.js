/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // <- Vite needs both
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: "#191C1F",
          dark2: "#232528",
          primary: "#22C55E",
          danger: "#EF4444",
          secondaryBlue: "#3B82F6",
          secondaryOrange: "#F97316",
          text: "#FFFFFF",
          subtext: "#D1D5DB"
        }
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
