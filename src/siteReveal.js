const revealSelector = [
  '#architecture', '#services', '#results', '#process', '#faq', '#contact',
  '#architecture > .section-head', '#services > .section-head', '#results > .section-head',
  '#process .section-head', '#pricing > .section-head', '#faq > .section-head',
  '.suite-intro', '.monthly-rhythm', '.engagement-strip',
  '.process-grid > article', '.monthly-rhythm article',
  '.contact > div', '.contact > form',
].join(', ')

export function installSiteReveals() {
  const targets = [...document.querySelectorAll(revealSelector)]
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const reveal = node => node.classList.add('site-visible')

  for (const node of targets) {
    node.classList.add('site-reveal')
    if (node.matches('.process-grid > article, .monthly-rhythm article')) {
      const siblings = [...node.parentElement.children]
      node.style.setProperty('--site-delay', `${siblings.indexOf(node) * 75}ms`)
    } else if (node.matches('.contact > form')) {
      node.style.setProperty('--site-delay', '110ms')
    }
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(reveal)
    return () => {}
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      reveal(entry.target)
      observer.unobserve(entry.target)
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
  targets.forEach(node => observer.observe(node))

  const fallback = window.setTimeout(() => targets.forEach(reveal), 5500)
  return () => {
    window.clearTimeout(fallback)
    observer.disconnect()
  }
}
