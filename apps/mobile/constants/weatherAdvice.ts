/**
 * Traduit la météo du jour en conseils concrets, adaptés à l'espèce et à l'âge.
 *
 * Les règles sont évaluées dans l'ordre et chacune décide elle-même si elle
 * s'applique. Les plus urgentes portent une priorité haute et remontent.
 */

import type { PetKind, LifeStageKey } from './petProfiles'
import type { Weather } from '@/services/weather'

export interface WeatherAdvice {
  emoji: string
  title: string
  body: string
  /** 3 = danger immédiat, 2 = vigilance, 1 = confort. */
  priority: 1 | 2 | 3
}

interface Context {
  weather: Weather
  kind: PetKind
  stage: LifeStageKey
  name: string
}

type Rule = (ctx: Context) => WeatherAdvice | null

const isDogOrCat = (k: PetKind) => k === 'dog' || k === 'cat'
const isFragile = (s: LifeStageKey) => s === 'baby' || s === 'senior'

const RULES: Rule[] = [
  // ── Forte chaleur ────────────────────────────────────────────────────
  ({ weather, kind, name }) => {
    if (weather.tempMax < 28 || kind !== 'dog') return null
    return {
      emoji: '🔥',
      title: 'Le bitume brûle avant vos pieds',
      body: `À ${weather.tempMax} °C dans l'air, l'asphalte au soleil dépasse largement 50 °C et brûle les coussinets en une minute. Posez le dos de votre main dessus 5 secondes : si vous ne tenez pas, ${name} non plus. Privilégiez l'herbe d'un parc, et sortez tôt le matin ou après 20 h.`,
      priority: 3,
    }
  },
  ({ weather, kind, stage, name }) => {
    if (weather.tempMax < 27 || !isDogOrCat(kind)) return null
    if (!isFragile(stage)) return null
    const who = stage === 'baby' ? 'jeune' : 'âgé'
    return {
      emoji: '💧',
      title: `Un animal ${who} régule mal la chaleur`,
      body: `${name} se refroidit presque uniquement en haletant. Multipliez les points d'eau fraîche, laissez une pièce ombragée accessible, et remplacez l'effort du jour par du jeu calme à l'intérieur. Halètement bruyant, bave épaisse ou titubement imposent une consultation immédiate.`,
      priority: 3,
    }
  },
  ({ weather, kind }) => {
    if (weather.tempMax < 26 || isDogOrCat(kind)) return null
    const label =
      kind === 'rabbit' ? 'Le lapin'
      : kind === 'rodent' ? 'Le cochon d\'Inde et les rongeurs'
      : kind === 'ferret' ? 'Le furet'
      : kind === 'bird' ? 'L\'oiseau'
      : 'Votre animal'
    if (kind === 'reptile') return null
    return {
      emoji: '🌡️',
      title: `${label} supporte très mal la chaleur`,
      body: `Au-delà de 26 à 28 °C, le coup de chaleur devient un risque réel : ces espèces ne transpirent pas et ne peuvent pas haleter efficacement. Déplacez l'habitat loin des fenêtres, posez une bouteille d'eau glacée enveloppée dans un linge contre une paroi, et vérifiez l'eau deux fois dans la journée.`,
      priority: 3,
    }
  },

  // ── Grand froid ──────────────────────────────────────────────────────
  ({ weather, kind, stage, name }) => {
    if (weather.tempMin > 3 || !isDogOrCat(kind)) return null
    if (!isFragile(stage)) return null
    return {
      emoji: '🧣',
      title: 'Le froid réveille les articulations',
      body: `Sous 3 °C, ${name} se raidit plus vite et récupère moins bien. Préférez plusieurs sorties courtes à une longue, séchez bien les pattes au retour, et vérifiez l'absence de sel de déneigement entre les coussinets — il provoque des brûlures et se lèche.`,
      priority: 2,
    }
  },
  ({ weather, kind }) => {
    if (weather.tempMin > 5 || isDogOrCat(kind) || kind === 'reptile') return null
    return {
      emoji: '❄️',
      title: 'Éloignez l\'habitat des courants d\'air',
      body: `Il fait ${weather.tempMin} °C cette nuit. Une cage placée près d'une fenêtre ou d'une porte subit des écarts que ces espèces encaissent mal : les affections respiratoires y démarrent presque toujours. Ajoutez du foin ou du tissu pour qu'il puisse se blottir.`,
      priority: 2,
    }
  },

  // ── Pluie ────────────────────────────────────────────────────────────
  ({ weather, kind, name }) => {
    if (weather.precipitation < 0.5 || kind !== 'dog') return null
    return {
      emoji: '🌧️',
      title: 'Remplacez la distance par du travail de nez',
      body: `Sortie écourtée par la pluie ? Éparpillez une partie de la ration de ${name} dans l'appartement ou cachez trois friandises dans une pièce. Dix minutes de recherche olfactive fatiguent autant qu'une demi-heure de marche — c'est ce qui évite l'agitation du soir les jours de mauvais temps.`,
      priority: 1,
    }
  },

  // ── Soleil et UV ─────────────────────────────────────────────────────
  ({ weather, kind }) => {
    if (weather.uvIndex < 6) return null
    if (kind !== 'cat' && kind !== 'dog') return null
    return {
      emoji: '😎',
      title: 'Les zones peu poilues prennent des coups de soleil',
      body: `Indice UV de ${weather.uvIndex} aujourd'hui. Le bout des oreilles et la truffe des animaux à poil clair brûlent réellement, et les expositions répétées finissent en tumeurs cutanées. Limitez l'accès extérieur entre 12 h et 16 h, ou appliquez une crème solaire vétérinaire.`,
      priority: 2,
    }
  },

  // ── Vent ─────────────────────────────────────────────────────────────
  ({ weather, kind }) => {
    if (weather.windSpeed < 40 || kind !== 'cat') return null
    return {
      emoji: '💨',
      title: 'Un chat sort moins par grand vent',
      body: `Rafales à ${weather.windSpeed} km/h : le vent brouille les repères sonores et olfactifs sur lesquels un chat se guide, et les fugues augmentent nettement ces jours-là. Vérifiez que sa chatière ou sa fenêtre de retour reste accessible.`,
      priority: 1,
    }
  },

  // ── Temps idéal ──────────────────────────────────────────────────────
  ({ weather, kind, stage, name }) => {
    if (weather.tempMax < 14 || weather.tempMax > 24) return null
    if (weather.precipitation > 0.3 || kind !== 'dog') return null
    const body =
      stage === 'baby'
        ? `Températures idéales pour la socialisation : c'est la fenêtre où ${name} apprend ce qui est normal dans son monde. Un marché, un arrêt de bus, quelques passants — de courtes expositions positives valent mieux qu'une longue balade.`
        : stage === 'senior'
        ? `Conditions parfaites pour ${name} : ni chaud ni humide, exactement ce qu'il faut à des articulations vieillissantes. Deux ou trois sorties tranquilles entretiennent la musculature sans déclencher de crise.`
        : `Journée idéale pour une vraie sortie avec ${name}. Variez le terrain — herbe, terre, cailloux — pour muscler les coussinets et occuper le nez autant que les pattes.`
    return { emoji: '🌤️', title: 'Le temps est parfait pour sortir', body, priority: 1 }
  },

  // ── Reptiles : la météo compte même en intérieur ──────────────────────
  ({ weather, kind }) => {
    if (kind !== 'reptile') return null
    if (weather.tempMax >= 26) {
      return {
        emoji: '🌡️',
        title: 'Surveillez le point chaud par forte chaleur extérieure',
        body: `Avec ${weather.tempMax} °C dans la pièce, le terrarium peut dépasser la température cible sans que le thermostat ne le voie, selon l'emplacement de la sonde. Vérifiez le point chaud avec un thermomètre indépendant et assurez-vous que la zone fraîche reste réellement fraîche.`,
        priority: 2,
      }
    }
    if (weather.tempMin <= 5) {
      return {
        emoji: '🔌',
        title: 'Les nuits froides fragilisent la digestion',
        body: `${weather.tempMin} °C attendus cette nuit : si la pièce refroidit, la température du terrarium chute et la digestion s'arrête, ce qui peut provoquer une régurgitation. Contrôlez le chauffage nocturne avant de nourrir.`,
        priority: 2,
      }
    }
    return null
  },
]

/** Conseils du jour, les plus urgents d'abord, limités à trois. */
export function getWeatherAdvice(ctx: Context): WeatherAdvice[] {
  return RULES
    .map((rule) => rule(ctx))
    .filter((a): a is WeatherAdvice => a !== null)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}
