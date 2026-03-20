module.exports = {
  darkMode: 'class',
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        /* Background */
        background: "var(--color-bg)",
        "background-card": "var(--color-bg-card)",

        /* Primary */
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-active": "var(--color-primary-active)",
        "primary-outline": "var(--color-primary-outline)",

        /* Secondary */
        secondary: "var(--color-secondary)",
        "secondary-hover": "var(--color-secondary-hover)",
        "secondary-active": "var(--color-secondary-active)",
        "secondary-outline": "var(--color-secondary-outline)",

        /* Accent */
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        "accent-active": "var(--color-accent-active)",
        "accent-outline": "var(--color-accent-outline)",
      },

      textColor: {
        base: "var(--text-base)",
        muted: "var(--text-muted)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        accent: "var(--text-accent)"
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
