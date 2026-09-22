import { readFile, unlink } from 'node:fs/promises'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'
import Pet from '#models/pet'
import VetDictation, { RUNNING_STATUSES } from '#models/vet_dictation'
import ConsultationService from '#services/consultation_service'

/**
 * Traitement différé d'une dictée.
 *
 * La requête d'envoi rend la main aussitôt ; le travail se poursuit ici et son
 * avancement est écrit en base, de sorte qu'un onglet fermé ou une connexion
 * perdue ne coûtent plus la dictée.
 *
 * Le traitement vit dans le processus web, sans file d'attente dédiée : à
 * l'échelle de quelques praticiens, une dépendance de plus (Redis, ouvriers
 * séparés) coûterait plus qu'elle ne rapporte. La contrepartie est assumée et
 * traitée : un redémarrage interrompt les travaux en cours, `recoverInterrupted`
 * les marque en échec au démarrage suivant, et le navigateur — qui garde une
 * copie de l'audio — propose alors de relancer.
 */
export default class DictationRunner {
  /**
   * Lance le traitement sans le faire attendre à l'appelant.
   *
   * Volontairement non `await` côté contrôleur : toute erreur est capturée ici,
   * pour qu'aucun rejet non géré ne remonte au processus.
   */
  static launch(dictationId: number, audioPath: string, filename: string) {
    void this.run(dictationId, audioPath, filename).catch((error) => {
      logger.error({ err: error, dictationId }, 'Traitement de dictée échoué hors garde')
    })
  }

  private static async run(dictationId: number, audioPath: string, filename: string) {
    const dictation = await VetDictation.find(dictationId)
    if (!dictation) {
      await this.discardAudio(audioPath)
      return
    }

    try {
      const audio = await readFile(audioPath)

      dictation.status = 'transcribing'
      await dictation.save()

      const service = new ConsultationService()
      const transcript = await service.transcribe(audio, filename, dictation.language)

      // L'audio ne sert plus à rien dès la transcription obtenue : on s'en
      // débarrasse avant la mise en forme, sans attendre la fin du travail.
      await this.discardAudio(audioPath)

      if (!transcript) {
        await this.fail(
          dictation,
          "L'enregistrement n'a produit aucun texte. Réessayez en parlant plus près du micro."
        )
        return
      }

      dictation.status = 'structuring'
      dictation.transcript = transcript
      await dictation.save()

      const pet = dictation.petToken
        ? await Pet.query().where('vetToken', dictation.petToken).first()
        : null

      const draft = await service.structure(transcript, pet, {
        templateId: dictation.templateId ?? undefined,
        instruction: dictation.instruction ?? undefined,
      })

      dictation.status = 'done'
      dictation.draft = draft as unknown as Record<string, unknown>
      dictation.completedAt = DateTime.now()
      await dictation.save()
    } catch (error) {
      logger.error({ err: error, dictationId }, 'Traitement de dictée en échec')
      await this.discardAudio(audioPath)
      await this.fail(
        dictation,
        "Le traitement a échoué. Votre enregistrement est resté sur votre appareil : vous pouvez le relancer."
      )
    }
  }

  private static async fail(dictation: VetDictation, message: string) {
    try {
      dictation.status = 'failed'
      dictation.errorMessage = message
      dictation.completedAt = DateTime.now()
      await dictation.save()
    } catch (error) {
      logger.error({ err: error, dictationId: dictation.id }, 'Impossible de marquer l’échec')
    }
  }

  /** L'audio est supprimé quoi qu'il arrive ; son absence n'est pas une erreur. */
  private static async discardAudio(audioPath: string) {
    try {
      await unlink(audioPath)
    } catch {
      /* déjà supprimé, ou jamais écrit */
    }
  }

  /**
   * Au démarrage, plus aucun traitement n'est en vol : ce qui est encore marqué
   * « en cours » a été interrompu. Sans ce ménage, ces travaux resteraient
   * éternellement en attente et le navigateur les interrogerait sans fin.
   */
  static async recoverInterrupted() {
    try {
      const interrupted = await VetDictation.query().whereIn('status', RUNNING_STATUSES)
      if (!interrupted.length) return

      for (const dictation of interrupted) {
        dictation.status = 'failed'
        dictation.errorMessage =
          'Le traitement a été interrompu par un redémarrage du service. Votre enregistrement est resté sur votre appareil : vous pouvez le relancer.'
        dictation.completedAt = DateTime.now()
        await dictation.save()
      }

      logger.info({ count: interrupted.length }, 'Dictées interrompues marquées en échec')
    } catch (error) {
      logger.error({ err: error }, 'Reprise des dictées interrompues impossible')
    }
  }
}
