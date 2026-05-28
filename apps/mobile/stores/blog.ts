import { create } from 'zustand'
import { api } from '@/services/api'

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  target: 'owner' | 'pro'
  species: string[]
  author: string
  authorRole?: string | null
  publishedAt: string
  readTime?: string | null
  image?: string | null
  featured: boolean
}

type State = {
  posts: BlogPost[]
  loading: boolean
  currentPost: BlogPost | null
  fetchPosts: (opts?: { species?: string[]; category?: string }) => Promise<void>
  fetchPost: (slug: string) => Promise<void>
  reset: () => void
}

export const useBlogStore = create<State>((set) => ({
  posts: [],
  loading: false,
  currentPost: null,

  fetchPosts: async (opts) => {
    set({ loading: true })
    const params = new URLSearchParams({ target: 'owner' })
    if (opts?.species?.length) params.set('species', opts.species.join(','))
    if (opts?.category) params.set('category', opts.category)
    const res = await api.get<BlogPost[]>(`/blog/posts?${params.toString()}`)
    set({ posts: res.success && res.data ? res.data : [], loading: false })
  },

  fetchPost: async (slug) => {
    set({ loading: true, currentPost: null })
    const res = await api.get<BlogPost>(`/blog/posts/${slug}`)
    set({ currentPost: res.success && res.data ? res.data : null, loading: false })
  },

  reset: () => set({ posts: [], currentPost: null, loading: false }),
}))
