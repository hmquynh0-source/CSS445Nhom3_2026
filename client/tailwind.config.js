/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coffee-dark': '#2C1810',
        'coffee-brown': '#4A3428',
        'coffee-cream': '#EFE3D5',
        'coffee-light': '#FDF8F3',
      }
    },
  },
  plugins: [],
}