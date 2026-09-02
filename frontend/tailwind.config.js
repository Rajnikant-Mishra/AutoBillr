/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-dark": "var(--primary-dark)",

        secondary: "var(--secondary)",

        background: "var(--background)",
        surface: "var(--surface)",

        text: "var(--text)",
        "text-light": "var(--text-light)",

        border: "var(--border)",
      },
fontSize: {
  xs: "var(--fs-xs)",
  sm: "var(--fs-sm)",
  base: "var(--fs-md)",
  lg: "var(--fs-lg)",
  xl: "var(--fs-xl)",
  "2xl": "var(--fs-2xl)",
},fontWeight: {
  normal: "var(--fw-normal)",
  medium: "var(--fw-medium)",
  semibold: "var(--fw-semibold)",
  bold: "var(--fw-bold)",
},
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      borderRadius: {
        xl: "12px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },

  plugins: [],
};