/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 👈 this is the important line
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // <- Vite needs both
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: "#000000",
          dark2: "#000000",
          primary: "#22C55E",
          danger: "#EF4444",
          secondaryBlue: "#3B82F6",
          secondaryOrange: "#F97316",
          text: "#FFFFFF",
          subtext: "#D1D5DB"
        },
        gray: {
          50: '#000000',
          100: '#000000',
          200: '#000000',
          300: '#000000',
          400: '#000000',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
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
