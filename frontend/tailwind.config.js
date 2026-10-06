

/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
          soft: "var(--color-primary-soft)",
        },

        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
        },

        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          light: "var(--color-success-light)",
          soft: "var(--color-success-soft)",
        },

        warning: {
          DEFAULT: "var(--color-warning)",
          hover: "var(--color-warning-hover)",
          light: "var(--color-warning-light)",
          soft: "var(--color-warning-soft)",
        },

        danger: {
          DEFAULT: "var(--color-danger)",
          hover: "var(--color-danger-hover)",
          light: "var(--color-danger-light)",
          soft: "var(--color-danger-soft)",
        },

        info: {
          DEFAULT: "var(--color-info)",
          hover: "var(--color-info-hover)",
          light: "var(--color-info-light)",
          soft: "var(--color-info-soft)",
        },

        background: "var(--color-background)",

        surface: {
          DEFAULT: "var(--color-surface)",
          secondary: "var(--color-surface-secondary)",
          hover: "var(--color-surface-hover)",
        },

        text: {
          DEFAULT: "var(--color-text)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          light: "var(--color-text-light)",
          inverse: "var(--color-text-inverse)",
        },

        border: {
          DEFAULT: "var(--color-border)",
          light: "var(--color-border-light)",
          dark: "var(--color-border-dark)",
          focus: "var(--color-border-focus)",
        },

        /* Compatibility */
        slate: {
          50: "var(--color-surface-secondary)",
          100: "var(--color-border-light)",
          200: "var(--color-border)",
          300: "var(--color-border-dark)",
          400: "var(--color-text-light)",
          500: "var(--color-text-muted)",
          600: "var(--color-text-secondary)",
          700: "var(--color-text-secondary)",
          800: "var(--color-text)",
          900: "var(--color-text)",
        },

        teal: {
          50: "var(--color-primary-soft)",
          100: "var(--color-primary-soft)",
          200: "var(--color-primary-light)",
          300: "var(--color-primary-light)",
          400: "var(--color-primary)",
          500: "var(--color-primary)",
          600: "var(--color-primary)",
          700: "var(--color-primary-hover)",
          800: "var(--color-primary-dark)",
          900: "var(--color-primary-dark)",
        },

        emerald: {
          50: "var(--color-success-soft)",
          100: "var(--color-success-soft)",
          500: "var(--color-success)",
          600: "var(--color-success)",
          700: "var(--color-success-hover)",
        },

        amber: {
          50: "var(--color-warning-soft)",
          100: "var(--color-warning-soft)",
          500: "var(--color-warning)",
          600: "var(--color-warning)",
          700: "var(--color-warning-hover)",
        },

        red: {
          50: "var(--color-danger-soft)",
          100: "var(--color-danger-soft)",
          500: "var(--color-danger)",
          600: "var(--color-danger)",
          700: "var(--color-danger-hover)",
        },

        indigo: {
          50: "var(--color-info-soft)",
          100: "var(--color-info-soft)",
          500: "var(--color-info)",
          600: "var(--color-info)",
          700: "var(--color-info-hover)",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "sans-serif",
        ],

        heading: [
          "Inter",
          "sans-serif",
        ],

        mono: [
          "JetBrains Mono",
          "monospace",
        ],
      },

      fontSize: {
        xs: [
          "var(--font-size-xs)",
          { lineHeight: "1.4" },
        ],

        sm: [
          "var(--font-size-sm)",
          { lineHeight: "1.5" },
        ],

        base: [
          "var(--font-size-md)",
          { lineHeight: "1.5" },
        ],

        lg: [
          "var(--font-size-lg)",
          { lineHeight: "1.5" },
        ],

        xl: [
          "var(--font-size-xl)",
          { lineHeight: "1.3" },
        ],

        "2xl": [
          "var(--font-size-2xl)",
          { lineHeight: "1.2" },
        ],

        "3xl": [
          "var(--font-size-3xl)",
          { lineHeight: "1.2" },
        ],

        "4xl": [
          "var(--font-size-4xl)",
          { lineHeight: "1.1" },
        ],
      },

      fontWeight: {
        normal: "var(--font-weight-normal)",
        medium: "var(--font-weight-medium)",
        semibold: "var(--font-weight-semibold)",
        bold: "var(--font-weight-bold)",
        extrabold: "var(--font-weight-extrabold)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        primary: "var(--shadow-primary)",
      },

      maxWidth: {
        "app-sm": "var(--container-sm)",
        "app-md": "var(--container-md)",
        "app-lg": "var(--container-lg)",
        "app-xl": "var(--container-xl)",
        "app-2xl": "var(--container-2xl)",
      },

      height: {
        header: "var(--header-height)",
        sidebar: "var(--sidebar-width)",
      },

      transitionDuration: {
        fast: "150ms",
        DEFAULT: "200ms",
        slow: "300ms",
      },
    },
  },

  plugins: [],
};