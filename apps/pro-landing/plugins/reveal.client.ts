export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | undefined
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const reveal = () => {
    observer?.disconnect()
    if (motion.matches || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-pending').forEach(el => el.classList.remove('reveal-pending'))
      return
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        entry.target.classList.remove('reveal-pending')
        observer?.unobserve(entry.target)
      })
    }, { threshold: 0.08 })
    const elements = document.querySelectorAll<HTMLElement>('main [data-reveal], main .section-title, main .section-lead, main .card, main .card-hover, main .card-dark, main .paper-panel')
    elements.forEach(el => {
      if (el.closest('.hero-intro, .hero-preview-enter')) return
      if (el.dataset.revealed && !el.classList.contains('reveal-pending')) return
      el.dataset.revealed = 'true'
      el.classList.add('reveal-ready', 'reveal-pending')
      observer?.observe(el)
    })
  }
  onNuxtReady(() => requestAnimationFrame(reveal))
  nuxtApp.hook('page:finish', () => requestAnimationFrame(reveal))
  motion.addEventListener('change', reveal)
})
