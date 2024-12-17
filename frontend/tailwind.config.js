/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  extend: {
    colors: {
      // Customize these colors according to your design system
      primary: {
        DEFAULT: "hsl(220.9 39.3% 11%)",
        foreground: "hsl(210 20% 98%)",
      },
      secondary: {
        DEFAULT: "hsl(215 25% 27%)", 
        foreground: "hsl(210 20% 98%)",
      },
      destructive: {
        DEFAULT: "hsl(0 84.2% 60.2%)",
        foreground: "hsl(210 20% 98%)",
      },
    }
  },
  plugins: [],
}