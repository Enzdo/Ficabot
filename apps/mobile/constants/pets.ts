import { colors } from './theme'

export const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕', cat: '🐱', rabbit: '🐰', bird: '🦜',
}

export const SPECIES_BG: Record<string, string> = {
  dog: colors.beigeLight, cat: colors.greenLight,
  rabbit: colors.greenLight, bird: colors.beigeLight,
}

export const SPECIES_LABEL: Record<string, string> = {
  dog: 'Chien', cat: 'Chat', rabbit: 'Lapin', bird: 'Oiseau',
}
