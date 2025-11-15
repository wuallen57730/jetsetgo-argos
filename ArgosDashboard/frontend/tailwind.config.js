// 檔案名稱: frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(48 96% 89%)", // 淺黃色背景 (HSL: 接近 48度色相的黃色)
          foreground: "hsl(48 96% 25%)", // 深黃色文字 (確保文字清晰)
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        status: {
          green: "#36b37e",
          orange: "#ffab00",
          red: "#ff5630",
        },
        jade: "#006462",
        teal: "#004341",
        "light-teal": "#cce0df",
        "accent-red": "#fa5538",
        "background-light": "#f6f8f7",
        "background-dark": "#101a1a",
        "inventory-bg": "#0A1012",
        "inventory-header": "#141C1F",
        "inventory-border": "#2C3538",
        "inventory-hover": "#3B474B",
        "inventory-text": "#99A3A6",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
