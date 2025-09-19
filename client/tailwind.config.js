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
        
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
