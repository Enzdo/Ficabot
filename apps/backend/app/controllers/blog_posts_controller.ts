import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'

const SPECIES_LABEL: Record<string, string> = { dog: 'Chien', cat: 'Chat', nac: 'NAC' }

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export default class BlogPostsController {
  /**
   * GET /api/blog/posts
   * Query params: target (owner|pro), species (CSV: dog,cat,nac), category, featured (bool), page, limit
   */
  async index({ request, response }: HttpContext) {
    const target = request.input('target')
    const species = request.input('species')
    const category = request.input('category')
    const featured = request.input('featured')
    const page = Number(request.input('page', 1))
    const limit = Math.min(Number(request.input('limit', 50)), 100)

    const query = BlogPost.query().orderBy('published_at', 'desc')

    if (target) query.where('target', target)
    if (category) query.where('category', category)
    if (featured === 'true' || featured === '1') query.where('featured', true)

    if (species) {
      const speciesArr = String(species)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (speciesArr.length > 0) {
        query.where((q) => {
          for (const sp of speciesArr) {
            // species column is CSV; match if contains the tag
            q.orWhereRaw(`',' || species || ',' LIKE ?`, [`%,${sp},%`])
          }
          // include posts with no species tag (= cross-species content)
          q.orWhereNull('species')
        })
      }
    }

    const result = await query.paginate(page, limit)
    response.header('Cache-Control', 'public, max-age=300')

    return response.ok({
      success: true,
      data: result.all().map((p) => p.toJSON()),
      meta: {
        total: result.total,
        page: result.currentPage,
        perPage: result.perPage,
        lastPage: result.lastPage,
      },
    })
  }

  /**
   * GET /api/blog/posts/:slug
   */
  async show({ params, response }: HttpContext) {
    const post = await BlogPost.findBy('slug', params.slug)
    if (!post) {
      return response.notFound({ success: false, message: 'Article non trouvé' })
    }
    response.header('Cache-Control', 'public, max-age=600')
    return response.ok({ success: true, data: post.toJSON() })
  }

  /**
   * GET /blog/recommended?species=dog,cat&month=12&limit=6
   * Context-aware recommendations: prioritizes categories by season + species.
   */
  async recommended({ request, response }: HttpContext) {
    const speciesParam = request.input('species')
    const month = Number(request.input('month')) || new Date().getMonth() + 1
    const limit = Math.min(Number(request.input('limit', 6)), 12)

    // ── Seasonal category priority (FR climate) ─────────────────────────
    //   Winter (Dec–Feb): cold, joints, urgences, indoor health
    //   Spring (Mar–May): allergies, parasites, walks resuming
    //   Summer (Jun–Aug): heat, hydration, travel, urgences (heatstroke)
    //   Autumn (Sep–Nov): senior care, nutrition shift, back-to-routine
    const season =
      month === 12 || month === 1 || month === 2 ? 'winter' :
      month >= 3 && month <= 5 ? 'spring' :
      month >= 6 && month <= 8 ? 'summer' : 'autumn'

    const SEASONAL_CATEGORIES: Record<string, string[]> = {
      winter:  ['Urgences', 'Santé chien', 'Santé chat', 'Senior', 'Comportement'],
      spring:  ['Hygiène', 'Santé chien', 'Santé chat', 'Comportement', 'Nutrition'],
      summer:  ['Urgences', 'Pratique', 'Hygiène', 'Santé chien', 'Santé chat'],
      autumn:  ['Senior', 'Nutrition', 'Hygiène', 'Santé chien', 'Santé chat'],
    }
    const preferredOrder = SEASONAL_CATEGORIES[season]

    const query = BlogPost.query().where('target', 'owner')

    if (speciesParam) {
      const speciesArr = String(speciesParam)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (speciesArr.length > 0) {
        query.where((q) => {
          for (const sp of speciesArr) {
            q.orWhereRaw(`',' || species || ',' LIKE ?`, [`%,${sp},%`])
          }
          q.orWhereNull('species')
        })
      }
    }

    const all = await query

    // ── Pertinence par rapport à l'animal ───────────────────────────────
    // La saison ne départage que les articles également pertinents : ce qui
    // parle de l'espèce, de la race ou de l'âge de l'animal passe devant.
    const breed = String(request.input('breed') ?? '').trim().toLowerCase()
    const stage = String(request.input('stage') ?? '').trim() // baby | adult | senior

    // Mots-clés de stade, propres à l'espèce : « chaton » ne doit pas remonter
    // pour un chiot, alors que les deux articles sont tagués dog,cat.
    const STAGE_KEYWORDS: Record<string, Record<string, string[]>> = {
      dog: {
        baby:   ['chiot', 'croissance', 'sevrage', 'socialisation', 'primovaccination'],
        adult:  ['adulte', 'stérilisation', 'entretien'],
        senior: ['senior', 'âgé', 'agé', 'vieillissement', 'arthrose', 'gériatrie'],
      },
      cat: {
        baby:   ['chaton', 'croissance', 'sevrage', 'socialisation', 'primovaccination'],
        adult:  ['adulte', 'stérilisation', 'entretien'],
        senior: ['senior', 'âgé', 'agé', 'vieillissement', 'rénale', 'gériatrie'],
      },
      nac: {
        baby:   ['lapereau', 'juvénile', 'croissance', 'sevrage'],
        adult:  ['adulte', 'entretien'],
        senior: ['senior', 'âgé', 'agé', 'vieillissement'],
      },
    }

    // Un mot de race isolé suffit : « Berger allemand » doit matcher « berger ».
    const breedWords = breed
      .split(/[\s/-]+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 4)

    const speciesList = speciesParam
      ? String(speciesParam).split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const mainSpecies = speciesList[0] ?? 'dog'
    const stageWords = STAGE_KEYWORDS[mainSpecies]?.[stage] ?? []

    // Beaucoup d'articles sont tagués pour plusieurs espèces alors qu'ils n'en
    // traitent qu'une. Un titre qui nomme une autre espèce est donc relégué.
    const OTHER_SPECIES_WORDS: Record<string, RegExp> = {
      dog: /\b(chats?|chatons?|félins?|felins?)\b/,
      cat: /\b(chiens?|chiots?|canins?)\b/,
      nac: /\b(chiens?|chiots?|chats?|chatons?)\b/,
    }
    const ownSpeciesWord: Record<string, RegExp> = {
      dog: /\b(chiens?|chiots?|canins?)\b/,
      cat: /\b(chats?|chatons?|félins?|felins?)\b/,
      nac: /\b(lapins?|rongeurs?|furets?|oiseaux?|reptiles?|nac)\b/,
    }

    const scored = all
      .map((post) => {
        const haystack = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase()

        const matchedBreed = breedWords.find((w) => haystack.includes(w)) ?? null
        const matchedStage = stageWords.find((w) => haystack.includes(w)) ?? null
        // `species` est un CSV ; null = article généraliste, moins spécifique.
        const targetsSpecies =
          !!post.species && speciesList.some((sp) => post.species!.split(',').includes(sp))

        const seasonIdx = preferredOrder.indexOf(post.category)
        const seasonScore = seasonIdx === -1 ? preferredOrder.length : seasonIdx

        // Plus le score est bas, plus l'article remonte.
        let score = seasonScore
        if (matchedBreed) score -= 300
        if (matchedStage) score -= 200
        if (targetsSpecies) score -= 100

        // Parle d'une autre espèce sans jamais nommer la sienne → hors sujet.
        const mentionsOther = OTHER_SPECIES_WORDS[mainSpecies]?.test(haystack) ?? false
        const mentionsOwn = ownSpeciesWord[mainSpecies]?.test(haystack) ?? false
        if (mentionsOther && !mentionsOwn) score += 1000

        const reason =
          matchedBreed ? capitalize(matchedBreed)
          : matchedStage ? capitalize(matchedStage)
          : targetsSpecies ? SPECIES_LABEL[speciesList[0]] ?? null
          : null

        return { post, score, reason }
      })
      // Tri déterministe : l'accueil ne doit pas se réordonner à chaque ouverture.
      .sort((a, b) => a.score - b.score || a.post.id - b.post.id)
      .slice(0, limit)

    response.header('Cache-Control', 'public, max-age=3600')
    return response.ok({
      success: true,
      data: scored.map(({ post, reason }) => ({ ...post.toJSON(), reason })),
      meta: { season, month },
    })
  }
}
