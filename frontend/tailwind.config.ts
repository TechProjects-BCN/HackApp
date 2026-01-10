import type { Config } from "tailwindcss";

export default {
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
        surface: {
          DEFAULT: "var(--surface-1)",
          border: "var(--surface-border)",
        },
        input: {
          bg: "var(--input-bg)",
          border: "var(--input-border)",
          placeholder: "var(--input-placeholder)",
          text: "var(--input-text)",
          ring: "var(--input-ring)",
        },
        primary: {
          from: "var(--primary-from)",
          to: "var(--primary-to)",
        },
        accent: {
          blue: "var(--accent-blue)",
          violet: "var(--accent-violet)",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
