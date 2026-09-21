import type { Config } from 'tailwindcss'

// [DA-MOBILE] Charte synchronisée avec apps/mobile/constants/theme.ts (Ficana)
// Source palette : vert Ficana #7EB13F · beige #D4BC9F · marron foncé #1A1614

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
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Serif d'accent — uniquement en italique, sur un mot de titre
        display: ['Instrument Serif', 'ui-serif', 'Georgia', 'serif'],
      },
      letterSpacing: {
        // Titres serrés
        tighter: '-0.025em',
        tightest: '-0.04em',
        eyebrow: '0.14em',
      },
      maxWidth: {
        prose: '62ch',
      },
      colors: {
        // [DA-MOBILE] Vert Ficana — primary
        primary: {
          50:  '#f4faec',
          100: '#EBF3DE',
          200: '#d4e8b6',
          300: '#b8d886',
          400: '#9bc657',
          500: '#7EB13F',
          600: '#5C8A2A',
          700: '#476a21',
          800: '#36511b',
          900: '#283c15',
          950: '#142008',
        },
        // [DA-MOBILE] Beige chaud — surfaces / secondary
        secondary: {
          50:  '#FAF7F2',
          100: '#F5EEE4',
          200: '#E8D9C2',
          300: '#D4BC9F',
          400: '#bd9d7a',
          500: '#a5805a',
          600: '#876644',
          700: '#675035',
          800: '#4a3a27',
          900: '#2f261a',
        },
        // [DA-MOBILE] Greys teintés beige (alignés sur mobile gray scale)
        gray: {
          50:  '#FAF7F2',
          100: '#F0EBE3',
          200: '#E0D5C9',
          300: '#C4B8A8',
          400: '#A8998A',
          500: '#8A7B6C',
          600: '#6B5E52',
          700: '#4D4038',
          800: '#2F2520',
          900: '#1A1614',
        },
        // [DA-MOBILE] Couleurs annexes mobile
        info:    '#5885C2',
        infoSoft:'#EAF0FA',
        warn:    '#ED783B',
        warnSoft:'#FDF0E8',
        danger:  '#CB3840',
        dangerSoft:'#FAEAEA',
        ink:     '#1A1614',
      },
      borderRadius: {
        // [DA-MOBILE] mobile radius scale (sm 8 → 3xl 32)
        'mxs': '8px',
        'msm': '12px',
        'mmd': '16px',
        'mlg': '20px',
        'mxl': '24px',
        'm2xl': '32px',
      },
      animation: {
        'float':          'float 8s ease-in-out infinite',
        'float-delayed':  'float 8s ease-in-out 2s infinite',
        'float-slow':     'float 14s ease-in-out infinite',
        'float-slow-alt': 'float 11s ease-in-out 3.5s infinite',
        'float-xs':       'floatXs 6s ease-in-out infinite',
        'float-xs-alt':   'floatXs 7s ease-in-out 1.5s infinite',
        'spin-slow':      'spin 22s linear infinite',
        'fade-up':        'fadeUp 0.6s ease-out forwards',
        'pulse-soft':     'pulseSoft 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        floatXs: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
      },
      boxShadow: {
        // Ombres quasi absentes : la profondeur vient des bordures fines
        'soft':   '0 1px 2px rgba(26,22,20,0.04)',
        'card':   '0 1px 3px rgba(26,22,20,0.05)',
        'cta':    'none',
        'cta-lg': 'none',
        'dark':   '0 6px 20px -8px rgba(26,22,20,0.12)',
        sm: '0 1px 2px 0 rgb(26 22 20 / 0.04)',
        DEFAULT: '0 1px 3px 0 rgb(26 22 20 / 0.05)',
        md: '0 2px 8px -2px rgb(26 22 20 / 0.06)',
        lg: '0 6px 20px -8px rgb(26 22 20 / 0.10)',
        xl: '0 12px 32px -12px rgb(26 22 20 / 0.12)',
        '2xl': '0 24px 56px -24px rgb(26 22 20 / 0.16)',
      },
      backgroundImage: {
        // [DA-MOBILE] CTA gradient — clair → foncé (mêmes stops que mobile Button.tsx)
        'gradient-cta': 'linear-gradient(135deg, #8EC347 0%, #7EB13F 50%, #5C8A2A 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
