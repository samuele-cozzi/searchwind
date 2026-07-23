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
      typography: {
        DEFAULT: {
          css: {
            // Example: set base text color variables Typography uses
            '--tw-prose-body': 'var(--text-base)',
            '--tw-prose-headings': 'var(--text-primary)',
            '--tw-prose-links': 'var(--text-secondary)',
            '--tw-prose-bold': 'var(--text-primary)',
            // --tw-prose-body: var(--tw-prose-invert-body);
            // --tw-prose-headings: var(--tw-prose-invert-headings);
            // --tw-prose-lead: var(--tw-prose-invert-lead);
            // --tw-prose-links: var(--tw-prose-invert-links);
            // --tw-prose-bold: var(--tw-prose-invert-bold);
            // --tw-prose-counters: var(--tw-prose-invert-counters);
            // --tw-prose-bullets: var(--tw-prose-invert-bullets);
            // --tw-prose-hr: var(--tw-prose-invert-hr);
            // --tw-prose-quotes: var(--tw-prose-invert-quotes);
            // --tw-prose-quote-borders: var(--tw-prose-invert-quote-borders);
            // --tw-prose-captions: var(--tw-prose-invert-captions);
            // --tw-prose-kbd: var(--tw-prose-invert-kbd);
            // --tw-prose-kbd-shadows: var(--tw-prose-invert-kbd-shadows);
            // --tw-prose-code: var(--tw-prose-invert-code);
            // --tw-prose-pre-code: var(--tw-prose-invert-pre-code);
            // --tw-prose-pre-bg: var(--tw-prose-invert-pre-bg);
            // --tw-prose-th-borders: var(--tw-prose-invert-th-borders);
            // --tw-prose-td-borders: var(--tw-prose-invert-td-borders); 

            '--tw-prose-invert-body': 'var(--text-base)',
            '--tw-prose-invert-headings': 'var(--text-primary)',
            '--tw-prose-invert-links': 'var(--text-secondary)',
            '--tw-prose-invert-bold': 'var(--text-primary)',
          },
        },
      },
      gridTemplateColumns: {
        1: 'repeat(1, minmax(0, 1fr))',
        2: 'repeat(2, minmax(0, 1fr))',
        3: 'repeat(3, minmax(0, 1fr))',
        4: 'repeat(4, minmax(0, 1fr))',
        5: 'repeat(5, minmax(0, 1fr))',
        6: 'repeat(6, minmax(0, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries')
  ],
};
