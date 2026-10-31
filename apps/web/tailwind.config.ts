import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./posts/**/*.mdx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: "#000000",
        darkGray: "#181823",
        primary: "#5221E6",
        danger: "#dc3545",
        dracula: "#282a36",
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0px" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    fontFamily: {
      josefin: ["Josefin Sans", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
    },
  },
  plugins: [typography, animate],
};
export default config;
