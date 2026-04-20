/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0b0d",
        surface: "#15171c",
        primary: {
          light: "#2cdaba",
          DEFAULT: "#00c39a",
          dark: "#008b6e",
        },
        danger: "#ff4c4c",
        muted: "#8f9fb3",
      },
    },
  },
  plugins: [],
};
