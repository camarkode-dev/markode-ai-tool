import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderColor: theme => ({
        DEFAULT: "var(--border)",
        card: "var(--card-foreground)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar-border)",
      }),
      backgroundColor: theme => ({
        DEFAULT: "var(--background)",
        card: "var(--card)",
        popover: "var(--popover)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        destructive: "var(--destructive)",
        sidebar: "var(--sidebar)",
      }),
      textColor: theme => ({
        DEFAULT: "var(--foreground)",
        card: "var(--card-foreground)",
        popover: "var(--popover-foreground)",
        primary: "var(--primary-foreground)",
        secondary: "var(--secondary-foreground)",
        muted: "var(--muted-foreground)",
        accent: "var(--accent-foreground)",
        destructive: "var(--destructive-foreground)",
        sidebar: "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent-foreground)",
      }),
      fontFamily: {
        sans: ["var(--font-sans)"],
        arabic: ["var(--font-arabic)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
