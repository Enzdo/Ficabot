export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  target: 'pro' | 'owner'
  author: string
  date: string
  readTime: string
  image: string
  content: string
}
