import DictationRunner from '#services/dictation_runner'

/**
 * Au démarrage du serveur, aucun traitement de dictée n'est en vol : ceux que
 * la base dit « en cours » ont été coupés par l'arrêt précédent. On les solde,
 * faute de quoi le navigateur les interrogerait indéfiniment.
 *
 * Chargé pour le seul environnement web (cf. adonisrc.ts) : en console, ce
 * ménage s'exécuterait avant les migrations, sur une table absente.
 */
await DictationRunner.recoverInterrupted()
