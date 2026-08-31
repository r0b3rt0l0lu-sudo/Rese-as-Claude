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
      },
    },
  },
  plugins: [],
};
export default config;
