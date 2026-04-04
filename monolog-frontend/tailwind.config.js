/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tp: "var(--tp)",
        tm: "var(--tm)",
        td: "var(--td)",
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        orange: "var(--orange)",
        "orange-dark": "var(--orange-dark)",
        primary: {
          DEFAULT: "var(--orange)",
          hover: "var(--orange-dark)",
          light: "rgba(242, 101, 34, 0.2)",
          container: "rgba(242, 101, 34, 0.1)",
          on: "#FFFFFF",
        },
        surface: {
          DEFAULT: "var(--bg)",
          alt: "var(--bg2)",
          muted: "var(--dash-bg)",
          on: "var(--tp)",
          variant: "var(--card-bg)",
          onVariant: "var(--tm)",
        },
        accent: "var(--orange)",
        border: "var(--card-border)",
        outline: "var(--card-border)",
        error: {
          DEFAULT: "#FF4D4D",
          container: "rgba(255, 77, 77, 0.1)",
          on: "#FFFFFF",
        },
        text: {
          DEFAULT: "var(--tp)",
          muted: "var(--tm)",
          faint: "var(--td)",
        },
      },
      fontSize: {
        "display-large": [
          "3.5625rem",
          { lineHeight: "4rem", letterSpacing: "-0.015625rem" },
        ],
        "display-medium": [
          "2.8125rem",
          { lineHeight: "3.25rem", letterSpacing: "0" },
        ],
        "display-small": [
          "2.25rem",
          { lineHeight: "2.75rem", letterSpacing: "0" },
        ],
        "headline-large": [
          "2rem",
          { lineHeight: "2.5rem", letterSpacing: "0" },
        ],
        "headline-medium": [
          "1.75rem",
          { lineHeight: "2.25rem", letterSpacing: "0" },
        ],
        "headline-small": [
          "1.5rem",
          { lineHeight: "2rem", letterSpacing: "0" },
        ],
        "title-large": [
          "1.375rem",
          { lineHeight: "1.75rem", letterSpacing: "0" },
        ],
        "title-medium": [
          "1rem",
          { lineHeight: "1.5rem", letterSpacing: "0.009375rem" },
        ],
        "title-small": [
          "0.875rem",
          { lineHeight: "1.25rem", letterSpacing: "0.00625rem" },
        ],
        "label-large": [
          "0.875rem",
          { lineHeight: "1.25rem", letterSpacing: "0.00625rem" },
        ],
        "label-medium": [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.03125rem" },
        ],
        "label-small": [
          "0.6875rem",
          { lineHeight: "1rem", letterSpacing: "0.03125rem" },
        ],
        "body-large": [
          "1rem",
          { lineHeight: "1.5rem", letterSpacing: "0.03125rem" },
        ],
        "body-medium": [
          "0.875rem",
          { lineHeight: "1.25rem", letterSpacing: "0.015625rem" },
        ],
        "body-small": [
          "0.75rem",
          { lineHeight: "1rem", letterSpacing: "0.025rem" },
        ],
      },
      borderRadius: {
        "m3-large": "12px",
        "m3-medium": "8px",
        "m3-full": "9999px",
      },
      boxShadow: {
        "level-1": "var(--shadow-sm)",
        "level-2": "var(--shadow-md)",
        "level-3": "var(--shadow-lg)",
        blue: "var(--shadow-blue)",
        orange: "0 4px 20px rgba(242, 101, 34, 0.35)",
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "Manrope",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-sora)",
          "Sora",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
