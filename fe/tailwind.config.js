/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      poppins: ['Poppins', 'sans-serif'],
      oboto: ["Roboto", "sans-serif"]
    },
  },
  plugins: [],
};

