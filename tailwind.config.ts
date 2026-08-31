import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta de marca "Confianza": azul moderno y accesible,
        // ni eléctrico ni "azul banco" genérico.
        brand: {
          50: "#EFF4FF",
          100: "#DCE6FF",
          200: "#B9CDFF",
          300: "#8FADFC",
          400: "#5C87F5",
          500: "#2F6FED",
          600: "#255BD1",
          700: "#1B4DBE",
          800: "#1A3F94",
          900: "#183675",
        },
        risk: {
          low: "#1D9A6C",
          medium: "#D18A1F",
          high: "#DC3545",
        },
        // Acento cálido y vivo (coral/naranja) para darle vida a la UI —
        // se usa en detalles, badges e ilustraciones, nunca reemplaza el
        // azul de marca en las acciones principales.
        accent: {
          50: "#FFF3EE",
          100: "#FFE3D5",
          200: "#FFC5A8",
          300: "#FF9E6E",
          400: "#FF7A42",
          500: "#FF5E1F",
          600: "#E84B10",
          700: "#C13D0C",
          800: "#98300F",
          900: "#7A290F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
