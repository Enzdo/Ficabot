import type { Config } from 'tailwindcss'

// Charte Ficana Pro — alignée sur apps/pro-landing (site professionnel).
// Base bleu ardoise #16212B, vert Ficana #7EB13F en accent.
// Structure (aplats, bordures fines, typo serrée) inspirée de vetally.fr

export default {
  darkMode: 'class',
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
        // Bleu ardoise — titres, aplats, états actifs.
        // Aligné sur apps/pro-landing : primary-700 = #16212b, la couleur des boutons du site.
        primary: {
          50: '#f3f5f7',
          100: '#e5e9ed',
          200: '#c9d1d9',
          300: '#a3b0bd',
          400: '#71828f',
          500: '#40515e',
          600: '#22303c',
          700: '#16212b',
          800: '#111a22',
          900: '#0d141b',
          950: '#070b0e',
        },
        // Vert Ficana — accent de marque, utilisé avec parcimonie
        accent: {
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
        // Bleu annexe Ficana — catégories neutres, séries de données
        secondary: {
          50: '#eaf0fa',
          100: '#d6e2f4',
          200: '#b4cbea',
          300: '#8dafdd',
          400: '#6f9acf',
          500: '#5885c2',
          600: '#4569a0',
          700: '#385380',
          800: '#2c4164',
          900: '#23334e',
          950: '#141d2c',
        },
        // Vert-bleu distinct du vert Ficana, pour ne pas confondre « validé » et « action »
        success: {
          50: '#edfaf3',
          100: '#d3f2e2',
          200: '#a9e5c8',
          300: '#74d2a8',
          400: '#43ba86',
          500: '#22a06b',
          600: '#1b8257',
          700: '#166646',
          800: '#125238',
          900: '#0f432e',
          950: '#062418',
        },
        // Orange Ficana
        warning: {
          50: '#fdf0e8',
          100: '#fbdcc8',
          200: '#f7bc97',
          300: '#f39b66',
          400: '#f08a4f',
          500: '#ed783b',
          600: '#d25f24',
          700: '#a94b1c',
          800: '#7f3915',
          900: '#5c2a0f',
          950: '#331708',
        },
        // Rouge Ficana
        danger: {
          50: '#faeaea',
          100: '#f5d0d2',
          200: '#eaa3a7',
          300: '#de757b',
          400: '#d55660',
          500: '#cb3840',
          600: '#a82c33',
          700: '#862329',
          800: '#661a1f',
          900: '#4d1418',
          950: '#2a0b0d',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
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
        // Ombres quasi absentes : la profondeur vient des bordures fines
        sm: '0 1px 2px 0 rgb(22 33 43 / 0.04)',
        DEFAULT: '0 1px 3px 0 rgb(22 33 43 / 0.05)',
        md: '0 2px 8px -2px rgb(22 33 43 / 0.06)',
        lg: '0 6px 20px -8px rgb(22 33 43 / 0.10)',
        xl: '0 12px 32px -12px rgb(22 33 43 / 0.12)',
        '2xl': '0 24px 56px -24px rgb(22 33 43 / 0.16)',
        none: 'none',
      },
      maxWidth: {
        prose: '62ch',
      },
    },
  },
  plugins: [],
} satisfies Config
