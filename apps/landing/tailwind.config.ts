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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        // [DA-MOBILE] Shadows colorées + douces (cf. mobile theme.ts)
        'soft':   '0 1px 3px rgba(26,22,20,0.07)',
        'card':   '0 3px 8px -2px rgba(26,22,20,0.08)',
        'cta':    '0 6px 14px -4px rgba(126,177,63,0.4)',
        'cta-lg': '0 10px 24px -6px rgba(126,177,63,0.45)',
        'dark':   '0 6px 14px -4px rgba(26,22,20,0.18)',
      },
      backgroundImage: {
        // [DA-MOBILE] CTA gradient — clair → foncé (mêmes stops que mobile Button.tsx)
        'gradient-cta': 'linear-gradient(135deg, #8EC347 0%, #7EB13F 50%, #5C8A2A 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
