import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        farm: {
          50: "#f2fbf4",
          100: "#def5e3",
          200: "#bfe9c8",
          300: "#91d49f",
          400: "#5cbf75",
          500: "#239447",
          600: "#137538",
          700: "#0c5b2c",
          800: "#084923",
          900: "#053b1d"
        },
        gold: {
          400: "#d9a441",
          500: "#c58a19",
          600: "#a86e08"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(5,59,29,.10)"
      }
    }
  },
  plugins: []
};

export default config;
