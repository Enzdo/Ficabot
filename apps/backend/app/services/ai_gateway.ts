import OpenAI from 'openai'
import env from '#start/env'

/**
 * Point de passage unique vers les modèles de langage.
 *
 * Le logiciel appelait huit fois `new OpenAI(...)`, chacun relisant sa clé dans
 * son coin : changer de route demandait de retrouver les huit, et d'en oublier
 * un suffisait à laisser une fuite silencieuse vers l'ancien fournisseur. Tout
 * passe désormais par ici.
 *
 * OpenRouter parle le protocole d'OpenAI : une `baseURL` suffit, et les modèles
 * se désignent par un slug préfixé du fournisseur. Sans clé OpenRouter, on
 * retombe sur les fournisseurs en direct — le logiciel continue de tourner
 * pendant qu'on pose la clé, plutôt que de s'arrêter net le jour du déploiement.
 */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/** La route est décidée par la présence de la clé, et par rien d'autre. */
export function usesOpenRouter(): boolean {
  return Boolean(env.get('OPENROUTER_API_KEY'))
}

/**
 * Client de conversation. OpenRouter s'il est configuré, OpenAI sinon.
 *
 * Les en-têtes d'attribution ne sont pas décoratifs : ils identifient
 * l'application dans le tableau de bord d'OpenRouter, ce qui permet de voir
 * d'où vient la dépense quand plusieurs projets partagent un compte.
 */
export function chatClient(): OpenAI {
  if (usesOpenRouter()) {
    return new OpenAI({
      apiKey: env.get('OPENROUTER_API_KEY'),
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://app.ficana.fr',
        'X-Title': 'Ficana',
      },
    })
  }

  return new OpenAI({ apiKey: env.get('OPENAI_API_KEY') })
}

/**
 * Client de transcription. Toujours OpenAI en direct.
 *
 * OpenRouter n'expose que la conversation : il n'a pas d'équivalent de
 * `/audio/transcriptions`. Y faire passer la dictée supposerait d'encoder
 * l'audio en base64 vers un modèle multimodal — une réécriture de la
 * fonctionnalité, pas un changement de route. La dictée reste donc en direct,
 * et c'est un choix, pas un oubli.
 */
export function transcriptionClient(): OpenAI {
  return new OpenAI({ apiKey: env.get('OPENAI_API_KEY') })
}

/**
 * Nom du modèle chez le fournisseur retenu.
 *
 * Les appels gardent dans le code le modèle qu'ils veulent ; seul le préfixe
 * change selon la route. Un modèle absent de la table traverse tel quel : mieux
 * vaut une erreur claire du fournisseur qu'une substitution silencieuse.
 */
const OPENROUTER_SLUGS: Record<string, string> = {
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'gpt-4-turbo': 'openai/gpt-4-turbo',
}

export function chatModel(model: string): string {
  if (!usesOpenRouter()) return model
  return OPENROUTER_SLUGS[model] ?? model
}

/**
 * Le second avis des pré-diagnostics, rendu par un modèle d'une autre famille
 * que celui du premier avis — c'est tout l'intérêt de la manœuvre. Le nom du
 * modèle diffère selon la route, d'où cette fonction plutôt qu'une constante.
 */
export const ANALYSIS_MODEL = {
  openrouter: 'anthropic/claude-sonnet-5',
  anthropic: 'claude-sonnet-5',
} as const

export function analysisModel(): string {
  return usesOpenRouter() ? ANALYSIS_MODEL.openrouter : ANALYSIS_MODEL.anthropic
}
