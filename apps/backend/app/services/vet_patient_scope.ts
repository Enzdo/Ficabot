import Pet from '#models/pet'

/**
 * Périmètre des patients d'un vétérinaire.
 *
 * Un animal appartient au périmètre d'un praticien quand son propriétaire lui
 * est lié par un `user_veterinarians` accepté, et que l'accès a bien été ouvert
 * (`vet_token` posé à l'acceptation du lien).
 *
 * Sans ce cadrage, `whereNotNull('vet_token')` seul renvoyait tous les animaux
 * de la plateforme : le `vet_token` étant distribué en clair par la liste, tout
 * praticien pouvait ensuite ouvrir n'importe quel dossier d'un confrère. Le
 * middleware d'authentification identifie, il ne cadre rien — c'est ici que le
 * cloisonnement se fait, et nulle part ailleurs.
 */

/** Requête Pet déjà restreinte aux patients du vétérinaire. */
export function scopedPets(veterinarianId: number) {
  return Pet.query()
    .whereNotNull('vetToken')
    .whereIn('userId', (sub) =>
      sub
        .from('user_veterinarians')
        .select('user_id')
        .where('veterinarian_id', veterinarianId)
        .where('status', 'accepted')
    )
}

/**
 * Retrouve un patient par son jeton d'accès, à condition qu'il relève bien du
 * vétérinaire qui le demande. Renvoie `null` si le jeton est inconnu *ou* s'il
 * appartient à un autre cabinet — les deux cas doivent être indiscernables de
 * l'extérieur, sinon la réponse devient un oracle d'existence.
 */
export async function findScopedPetByToken(
  veterinarianId: number,
  token: string,
  withRelations: (query: ReturnType<typeof scopedPets>) => void = () => {}
) {
  const query = scopedPets(veterinarianId).where('vetToken', token)
  withRelations(query)
  return query.first()
}
