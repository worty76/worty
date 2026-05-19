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
        "primary-color": {
          DEFAULT: "rgb(38, 34, 35)",
          text: "rgb(221, 198, 182)",
          bg: "rgb(38, 34, 35)",
        },
        "secondary-color": {
          DEFAULT: "rgb(221, 198, 182)",
          text: "rgb(221, 198, 182)",
          bg: "rgb(221, 198, 182)",
          border: "rgb(221, 198, 182)",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class"
};
