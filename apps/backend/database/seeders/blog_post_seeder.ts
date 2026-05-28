import { BaseSeeder } from '@adonisjs/lucid/seeders'
import BlogPost from '#models/blog_post'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

type LandingPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  target: 'owner' | 'pro'
  author: string
  date: string
  readTime: string
  image: string
  content: string
}

const LANDING_POSTS_DIR = join(
  process.cwd(),
  '..',
  'landing',
  'composables',
  'posts'
)

// Maps each cluster file → default species tags
const CLUSTERS: { file: string; export: string; species: string[] }[] = [
  { file: 'dog-health.ts', export: 'dogHealthPosts', species: ['dog'] },
  { file: 'cat-health.ts', export: 'catHealthPosts', species: ['cat'] },
  { file: 'nutrition.ts', export: 'nutritionPosts', species: ['dog', 'cat', 'nac'] },
  { file: 'behavior.ts', export: 'behaviorPosts', species: ['dog', 'cat'] },
  { file: 'practical.ts', export: 'practicalPosts', species: ['dog', 'cat', 'nac'] },
  { file: 'hygiene.ts', export: 'hygienePosts', species: ['dog', 'cat'] },
  { file: 'senior.ts', export: 'seniorPosts', species: ['dog', 'cat'] },
  { file: 'urgences.ts', export: 'urgencesPosts', species: ['dog', 'cat', 'nac'] },
]

export default class extends BaseSeeder {
  async run() {
    const allPosts: { source: LandingPost; species: string[] }[] = []

    for (const cluster of CLUSTERS) {
      try {
        const filePath = join(LANDING_POSTS_DIR, cluster.file)
        const mod = await import(pathToFileURL(filePath).href)
        const posts: LandingPost[] = mod[cluster.export] ?? []
        for (const p of posts) {
          allPosts.push({ source: p, species: cluster.species })
        }
      } catch (e) {
        console.warn(`[blog_seeder] Could not load ${cluster.file}:`, (e as Error).message)
      }
    }

    // Also import legacy posts (target='pro') from useBlog.ts
    try {
      const useBlogPath = join(process.cwd(), '..', 'landing', 'composables', 'useBlog.ts')
      const mod = await import(pathToFileURL(useBlogPath).href)
      // useBlog exports a function — we extract legacy via a different strategy: read file
      // Skip for now if the export isn't exposed
      void mod
    } catch {
      /* ignore */
    }

    if (allPosts.length === 0) {
      console.warn('[blog_seeder] No posts found to seed')
      return
    }

    const records = allPosts.map(({ source, species }) => ({
      slug: source.slug,
      title: source.title,
      excerpt: source.excerpt,
      content: source.content.trim(),
      category: source.category,
      target: source.target,
      species: species.join(','),
      author: source.author,
      authorRole: null,
      publishedAt: source.date,
      readTime: source.readTime,
      imageUrl: source.image,
      featured: false,
    }))

    await BlogPost.updateOrCreateMany('slug', records)
    console.log(`[blog_seeder] Seeded ${records.length} blog posts`)
  }
}
