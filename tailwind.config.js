/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./test.html",
    "./{app,calculator,models,translations}.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
