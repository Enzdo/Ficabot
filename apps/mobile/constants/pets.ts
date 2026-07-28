/**
 * Helpers d'affichage d'un animal.
 *
 * L'apparence ne dépend plus seulement de l'espèce stockée en base (dog / cat / nac)
 * mais du « kind » déduit de la race : un furet, un perroquet et un lapin sont tous
 * des NAC et n'ont plus la même identité visuelle. Voir `petProfiles.ts`.
 */

import { getPetProfile } from './petProfiles'

type PetLike = { species: string; breed?: string | null }

export const petEmoji  = (pet: PetLike) => getPetProfile(pet).emoji
export const petBg     = (pet: PetLike) => getPetProfile(pet).accentSoft
export const petAccent = (pet: PetLike) => getPetProfile(pet).accent
export const petLabel  = (pet: PetLike) => getPetProfile(pet).label
