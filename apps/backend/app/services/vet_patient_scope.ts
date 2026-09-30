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
  // Colonnes nommées en base et non par le modèle : dans un groupe imbriqué,
  // le constructeur de requêtes ne traduit plus `vetToken` en `vet_token`, et
  // la condition est alors silencieusement sans effet. Sur une fonction de
  // cloisonnement, une condition sans effet est une fuite.
  return Pet.query().where((scope) => {
    // Animaux créés par leur propriétaire, qui a ouvert l'accès au cabinet.
    scope.where((shared) => {
      shared.whereNotNull('pets.vet_token').whereIn('pets.user_id', (sub) =>
        sub
          .from('user_veterinarians')
          .select('user_id')
          .where('veterinarian_id', veterinarianId)
          .where('status', 'accepted')
      )
    })

    // Patients ouverts par le cabinet lui-même : pas de propriétaire inscrit
    // pour les rattacher, donc c'est le cabinet qui les porte. Le périmètre ne
    // s'élargit qu'aux dossiers que ce praticien a créés.
    scope.orWhere('pets.veterinarian_id', veterinarianId)
  })
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
