module.exports = {
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  purge: [
    "./renderer/pages/**/*.js",
    "./renderer/pages/**/*.jsx",
    "./renderer/components/**/*.js",
    "./renderer/components/**/*.jsx",
  ],
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
