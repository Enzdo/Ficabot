/**
 * Composable pour transformer les erreurs techniques en messages user-friendly
 */

interface ErrorContext {
  action: string // Ex: "ajout du vaccin", "connexion", "mise à jour du profil"
  entity?: string // Ex: "animal", "utilisateur", "rendez-vous"
}

export const useErrorMessage = () => {
  /**
   * Transforme une erreur technique en message utilisateur compréhensible
   */
  const getUserFriendlyMessage = (error: any, context: ErrorContext): string => {
    // Erreurs réseau
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return `Impossible de ${context.action}. Vérifiez votre connexion internet.`
    }

    // Erreurs d'authentification
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return 'Votre session a expiré. Veuillez vous reconnecter.'
    }

    // Erreurs de permission
    if (error.status === 403 || error.message?.includes('forbidden')) {
      return `Vous n'avez pas les permissions pour ${context.action}.`
    }

    // Erreurs not found
    if (error.status === 404 || error.message?.includes('not found')) {
      const entity = context.entity || 'ressource'
      return `${entity.charAt(0).toUpperCase() + entity.slice(1)} introuvable.`
    }

    // Erreurs de validation
    if (error.status === 422 || error.message?.includes('validation')) {
      return `Données invalides pour ${context.action}. Vérifiez les informations saisies.`
    }

    // Erreurs serveur
    if (error.status >= 500) {
      return `Une erreur serveur est survenue lors de ${context.action}. Réessayez dans quelques instants.`
    }

    // Message par défaut
    return `Erreur lors de ${context.action}. Veuillez réessayer.`
  }

  /**
   * Affiche un toast d'erreur avec un message user-friendly
   */
  const showError = (error: any, context: ErrorContext, customActions?: Array<{ label: string, onClick: () => void }>) => {
    const toast = useToast()
    const message = getUserFriendlyMessage(error, context)

    toast.error(message, 5000) // 5 secondes pour les erreurs (plus long)

    // Log technique pour debug (en dev)
    if (process.dev) {
      console.error(`[${context.action}]`, error)
    }
  }

  /**
   * Messages de succès contextuels
   */
  const getSuccessMessage = (action: string, entity?: string): string => {
    const messages: Record<string, string> = {
      'create': `${entity || 'Élément'} créé avec succès ✓`,
      'update': `${entity || 'Élément'} mis à jour ✓`,
      'delete': `${entity || 'Élément'} supprimé`,
      'add': `${entity || 'Élément'} ajouté ✓`,
      'remove': `${entity || 'Élément'} retiré`,
      'save': 'Sauvegardé ✓',
      'upload': 'Fichier envoyé ✓',
      'send': 'Envoyé ✓',
    }

    return messages[action] || 'Opération réussie ✓'
  }

  return {
    getUserFriendlyMessage,
    showError,
    getSuccessMessage
  }
}
