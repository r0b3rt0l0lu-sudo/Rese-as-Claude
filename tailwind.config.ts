import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          50: "#FEFCF8",
          100: "#F9F3E7",
          200: "#F3EADA",
        },
        // Paleta de marca: azul marino editorial, oscuro y elegante.
        brand: {
          50: "#EEF0F5",
          100: "#DBDFEA",
          200: "#B2BAD1",
          300: "#818CAF",
          400: "#4B5678",
          500: "#2B3655",
          600: "#202A44",
          700: "#182036",
          800: "#131A2C",
          900: "#0D1220",
        },
        risk: {
          low: "#2F6B3E",
          medium: "#B8922A",
          high: "#8B2E2E",
        },
        // Acento dorado/mostaza — detalles, badges, botones secundarios.
        accent: {
          50: "#FBF3E0",
          100: "#F5E6C2",
          200: "#EACB84",
          300: "#DDB25A",
          400: "#C89A3C",
          500: "#B8922A",
          600: "#9C7A20",
          700: "#7D611A",
          800: "#5F4A14",
          900: "#42340E",
        },
      },
    },
  },
  plugins: [],
};
export default config;
