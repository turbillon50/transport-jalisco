import type { Config } from "tailwindcss";

/**
 * Design tokens ported verbatim from the Google Stitch export
 * ("Aero-Corporate Precision") so the transcribed screens render pixel-faithfully,
 * extended with the MT Empresarial brand tokens.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brand tokens (CSS-variable driven for dark mode)
        brand: {
          primary: "#002863",
          secondary: "#1e6bff",
          accent: "#00b4d8",
        },
        // Material Design 3 palette (Aero-Corporate Precision)
        "on-error-container": "#93000a",
        "surface-container-lowest": "rgb(var(--sc-lowest) / <alpha-value>)",
        "primary-fixed": "#d9e2ff",
        "on-error": "#ffffff",
        "on-tertiary": "#ffffff",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-variant": "#e0e3e6",
        "primary-container": "#003d8f",
        "secondary-container": "#0070ea",
        "secondary-fixed": "#d8e2ff",
        "on-primary-fixed": "#001944",
        "secondary-fixed-dim": "#adc7ff",
        "surface-bright": "#f7f9fc",
        "on-tertiary-fixed-variant": "#5c4200",
        "tertiary-fixed": "#ffdea3",
        "on-tertiary-fixed": "#261900",
        "on-secondary-fixed-variant": "#004493",
        "on-primary-fixed-variant": "#0d4395",
        "inverse-on-surface": "#eff1f4",
        "on-secondary-fixed": "#001a41",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-dim": "#d8dadd",
        "surface-container-low": "rgb(var(--sc-low) / <alpha-value>)",
        "surface-tint": "#305bae",
        tertiary: "#3a2800",
        "surface-container": "rgb(var(--sc) / <alpha-value>)",
        "inverse-surface": "#2d3133",
        outline: "#737783",
        "on-primary-container": "#88acff",
        "tertiary-fixed-dim": "#f7bd3d",
        "error-container": "#ffdad6",
        "surface-container-high": "rgb(var(--sc-high) / <alpha-value>)",
        "inverse-primary": "#afc6ff",
        "on-background": "rgb(var(--on-bg) / <alpha-value>)",
        "on-tertiary-container": "#dba523",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        secondary: "#0059bb",
        "surface-container-highest": "rgb(var(--sc-highest) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        error: "#ba1a1a",
        "on-secondary-container": "#fefcff",
        "primary-fixed-dim": "#afc6ff",
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
        "tertiary-container": "#563d00",
      },
      borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", "2xl": "1rem", full: "9999px" },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        gutter: "16px",
        md: "16px",
        xs: "4px",
        xl: "32px",
        sm: "8px",
        lg: "24px",
        base: "4px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
      },
      fontWeight: {
        "display-lg": "700",
        "headline-md": "600",
        "headline-sm": "600",
        "label-lg": "600",
        "label-md": "600",
      },
      keyframes: {
        "subtle-drift": { from: { backgroundPosition: "0 0" }, to: { backgroundPosition: "40px 40px" } },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(0,61,143,0.2)" },
          "50%": { boxShadow: "0 0 15px 5px rgba(0,61,143,0.1)" },
        },
      },
      animation: {
        "subtle-drift": "subtle-drift 20s linear infinite",
        "pulse-glow": "pulse-glow 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
