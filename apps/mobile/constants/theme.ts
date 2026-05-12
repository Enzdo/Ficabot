/**
 * Charte graphique Ficana
 *
 * Couleurs principales :
 *   #1A1614  Marron foncé (texte, fond sombre)
 *   #7EB13F  Vert          (accent, CTA)
 *   #D4BC9F  Beige         (surfaces chaudes)
 *
 * Couleurs annexes :
 *   #5885C2  Bleu   (vaccins / info)
 *   #CB3840  Rouge  (erreur / danger)
 *   #ED783B  Orange (avertissement / traitement)
 */

export const colors = {
  // ── Primaires ──────────────────────────────────
  dark:        '#1A1614',   // quasi-noir chaud
  green:       '#7EB13F',   // vert Ficana
  greenLight:  '#EBF3DE',   // vert très clair (backgrounds)
  greenDark:   '#5C8A2A',   // vert foncé (hover / pressed)
  beige:       '#D4BC9F',   // beige principal
  beigeLight:  '#F5EEE4',   // beige clair (surfaces)
  beigePale:   '#FAF7F2',   // beige très pâle (fond global)

  // ── Annexes ────────────────────────────────────
  blue:        '#5885C2',
  blueLight:   '#EAF0FA',
  red:         '#CB3840',
  redLight:    '#FAEAEA',
  orange:      '#ED783B',
  orangeLight: '#FDF0E8',

  // ── Neutres (teinte beige) ─────────────────────
  white: '#FFFFFF',
  gray: {
    50:  '#FAF7F2',   // fond global
    100: '#F0EBE3',   // fond sections
    200: '#E0D5C9',   // bordures / séparateurs
    300: '#C4B8A8',   // bordures actives
    400: '#A8998A',   // placeholder
    500: '#8A7B6C',   // texte tertiaire
    600: '#6B5E52',   // texte secondaire
    700: '#4D4038',   // sous-titres
    800: '#2F2520',   // titres secondaires
    900: '#1A1614',   // texte principal
  },
}

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
}

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
}

export const shadow = {
  sm: {
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  green: {
    shadowColor: '#7EB13F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  dark: {
    shadowColor: '#1A1614',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
}

export const typography = {
  xs:   12,
  sm:   13,
  base: 15,
  lg:   17,
  xl:   19,
  '2xl': 22,
  '3xl': 28,
  '4xl': 36,
}
