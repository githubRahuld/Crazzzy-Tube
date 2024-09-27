const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      cedarvilleCursive: ["Cedarville Cursive", "sans-serif"],
      dancing: ["Dancing Script", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
      jost: ["Jost", "sans-serif"],
      caveat: ["Caveat", "sans-serif"],
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
