import type { Config } from 'tailwindcss'

// Ficana Pro — sous-marque professionnelle.
// Base bleu ardoise froid (distincte du site grand public, chaud et beige),
// vert Ficana #7EB13F conservé comme accent pour garder le lien de marque.

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Bleu ardoise — titres, aplats, surfaces sombres
        ink: {
          50: '#f3f5f7',
          100: '#e5e9ed',
          200: '#c9d1d9',
          300: '#a3b0bd',
          400: '#71828f',
          500: '#4c5c69',
          600: '#2f3e4b',
          700: '#22303c',
          800: '#1b2733',
          900: '#16212b',
          950: '#0d141b',
        },
        // Vert Ficana — accent, lien avec la marque grand public
        brand: {
          50: '#f4faec',
          100: '#ebf3de',
          200: '#d4e8b6',
          300: '#b8d886',
          400: '#9bc657',
          500: '#7eb13f',
          600: '#5c8a2a',
          700: '#476a21',
          800: '#36511b',
          900: '#283c15',
          950: '#142008',
        },
        // Neutres froids
        surface: {
          50: '#f8fafb',
          100: '#f1f4f6',
          200: '#e3e8ec',
          300: '#cbd3da',
          400: '#9aa6b1',
          500: '#71808c',
          600: '#55636f',
          700: '#414d57',
          800: '#2c353d',
          900: '#1b2229',
          950: '#0f1418',
        },
        success: { 50: '#edfaf3', 100: '#d3f2e2', 500: '#22a06b', 600: '#1b8257', 700: '#166646' },
        warning: { 50: '#fdf0e8', 100: '#fbdcc8', 500: '#ed783b', 600: '#d25f24', 700: '#a94b1c' },
        danger: { 50: '#faeaea', 100: '#f5d0d2', 500: '#cb3840', 600: '#a82c33', 700: '#862329' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.025em',
        tightest: '-0.04em',
        eyebrow: '0.14em',
      },
      borderRadius: {
        DEFAULT: '7px',
        lg: '8px',
        xl: '10px',
        '2xl': '14px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(22 33 43 / 0.04)',
        DEFAULT: '0 1px 3px 0 rgb(22 33 43 / 0.05)',
        md: '0 2px 8px -2px rgb(22 33 43 / 0.06)',
        lg: '0 6px 20px -8px rgb(22 33 43 / 0.10)',
        xl: '0 12px 32px -12px rgb(22 33 43 / 0.12)',
        none: 'none',
      },
      maxWidth: {
        prose: '62ch',
      },
    },
  },
  plugins: [],
} satisfies Config
