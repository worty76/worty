/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        mukta: ["Mukta", "sans-serif"],
        lato: ["Lato", "sans-serif"],
        raleway: ['Raleway', "sans-serif"],
        ubuntu: ['Ubuntu', "sans-serif"],
        opensans: ['Open Sans', "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        /* Channel variables (see globals.css) so every utility built from these
           colors — bg/, text/, border/, ring/, placeholder/ — follows the theme
           toggle instead of staying hardcoded beige/dark */
        "primary-color": {
          DEFAULT: "rgb(var(--primary-bg-rgb) / <alpha-value>)",
          text: "rgb(var(--primary-bg-rgb) / <alpha-value>)",
          bg: "rgb(var(--primary-bg-rgb) / <alpha-value>)",
        },
        "secondary-color": {
          DEFAULT: "rgb(var(--primary-text-rgb) / <alpha-value>)",
          text: "rgb(var(--primary-text-rgb) / <alpha-value>)",
          bg: "rgb(var(--primary-text-rgb) / <alpha-value>)",
          border: "rgb(var(--primary-text-rgb) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class"
};
