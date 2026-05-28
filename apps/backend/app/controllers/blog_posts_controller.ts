import type { HttpContext } from '@adonisjs/core/http'
import BlogPost from '#models/blog_post'

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
    // Score: lower index in preferredOrder = higher priority. Unmatched → end.
    const scored = all
      .map((p) => {
        const idx = preferredOrder.indexOf(p.category)
        return { post: p, score: idx === -1 ? 999 : idx }
      })
      .sort((a, b) => a.score - b.score || Math.random() - 0.5)
      .slice(0, limit)

    response.header('Cache-Control', 'public, max-age=3600')
    return response.ok({
      success: true,
      data: scored.map(({ post }) => post.toJSON()),
      meta: { season, month },
    })
  }
}
