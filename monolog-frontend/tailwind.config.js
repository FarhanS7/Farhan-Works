import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT:     "var(--color-primary)",
          hover:       "var(--color-primary-hover)",
          light:       "var(--color-primary-light)",
          container:   "var(--color-primary-container)",
          on:          "var(--color-primary-on)",
          onContainer: "#1E40AF",
        },
        surface: {
          DEFAULT:   "var(--color-surface)",
          alt:       "var(--color-surface-alt)",
          muted:     "var(--color-surface-muted)",
          on:        "var(--color-surface-on)",
          variant:   "var(--color-surface-muted)",
          onVariant: "var(--color-text-muted)",
        },
        accent:  "var(--color-accent)",
        border:  "var(--color-border)",
        outline: "var(--color-border)",
        error: {
          DEFAULT:   "var(--color-error)",
          container: "var(--color-error-container)",
          on:        "#FFFFFF",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted:   "var(--color-text-muted)",
          faint:   "var(--color-text-faint)",
        },
      },
      fontSize: {
        'display-large':   ['3.5625rem', { lineHeight: '4rem',    letterSpacing: '-0.015625rem' }],
        'display-medium':  ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '0' }],
        'display-small':   ['2.25rem',   { lineHeight: '2.75rem', letterSpacing: '0' }],
        'headline-large':  ['2rem',      { lineHeight: '2.5rem',  letterSpacing: '0' }],
        'headline-medium': ['1.75rem',   { lineHeight: '2.25rem', letterSpacing: '0' }],
        'headline-small':  ['1.5rem',    { lineHeight: '2rem',    letterSpacing: '0' }],
        'title-large':     ['1.375rem',  { lineHeight: '1.75rem', letterSpacing: '0' }],
        'title-medium':    ['1rem',      { lineHeight: '1.5rem',  letterSpacing: '0.009375rem' }],
        'title-small':     ['0.875rem',  { lineHeight: '1.25rem', letterSpacing: '0.00625rem' }],
        'label-large':     ['0.875rem',  { lineHeight: '1.25rem', letterSpacing: '0.00625rem' }],
        'label-medium':    ['0.75rem',   { lineHeight: '1rem',    letterSpacing: '0.03125rem' }],
        'label-small':     ['0.6875rem', { lineHeight: '1rem',    letterSpacing: '0.03125rem' }],
        'body-large':      ['1rem',      { lineHeight: '1.5rem',  letterSpacing: '0.03125rem' }],
        'body-medium':     ['0.875rem',  { lineHeight: '1.25rem', letterSpacing: '0.015625rem' }],
        'body-small':      ['0.75rem',   { lineHeight: '1rem',    letterSpacing: '0.025rem' }],
      },
      borderRadius: {
        'm3-large':  '12px',
        'm3-medium': '8px',
        'm3-full':   '9999px',
      },
      boxShadow: {
        'level-1': 'var(--shadow-sm)',
        'level-2': 'var(--shadow-md)',
        'level-3': 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography,
  ],
}
