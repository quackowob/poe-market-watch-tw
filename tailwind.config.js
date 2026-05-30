/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ember: "#f59e0b",
        night: "#080b12",
        panel: "#111827",
        line: "#243044"
      }
    }
  },
  plugins: []
};
