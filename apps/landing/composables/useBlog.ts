// Blog posts are now fetched dynamically from the backend API.
// Use `useBlogPosts()` / `useBlogPost(slug)` in pages.

export interface BlogPost {
  id?: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  target: 'owner' | 'pro'
  species?: string[]
  author: string
  authorRole?: string | null
  publishedAt?: string
  date?: string
  readTime?: string
  image?: string
  featured?: boolean
}

type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: { total: number; page: number; perPage: number; lastPage: number }
}

function normalize(p: any): BlogPost {
  return {
    ...p,
    date: p.publishedAt ?? p.date,
  }
}

/**
 * Fetch blog posts list (filterable by target / species / category).
 * SSR-friendly. Returns reactive { data, pending, refresh }.
 */
export const useBlogPosts = (opts: { target?: 'owner' | 'pro'; species?: string[]; category?: string; featured?: boolean } = {}) => {
  const { public: { apiBase } } = useRuntimeConfig()
  const params: Record<string, string> = {}
  if (opts.target) params.target = opts.target
  if (opts.species?.length) params.species = opts.species.join(',')
  if (opts.category) params.category = opts.category
  if (opts.featured) params.featured = '1'

  const key = `blog-posts-${JSON.stringify(params)}`
  return useAsyncData(key, async () => {
    const res = await $fetch<ApiResponse<any[]>>(`${apiBase}/blog/posts`, { params })
    return (res.data ?? []).map(normalize)
  }, { default: () => [] as BlogPost[] })
}

/**
 * Fetch a single blog post by slug.
 */
export const useBlogPost = (slug: string) => {
  const { public: { apiBase } } = useRuntimeConfig()
  return useAsyncData(`blog-post-${slug}`, async () => {
    try {
      const res = await $fetch<ApiResponse<any>>(`${apiBase}/blog/posts/${slug}`)
      return res.data ? normalize(res.data) : null
    } catch {
      return null
    }
  })
}

// Legacy export (deprecated) — kept so any non-migrated caller doesn't break the build.
export const useBlog = () => {
  const posts: BlogPost[] = []
  const getPostBySlug = (_slug: string) => undefined as BlogPost | undefined
  const getPostsByTarget = (_target: 'pro' | 'owner') => [] as BlogPost[]
  return { posts, getPostBySlug, getPostsByTarget }
}
