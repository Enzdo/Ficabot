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
}
