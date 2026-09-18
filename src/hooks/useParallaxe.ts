import { useEffect } from 'react'

/**
 * Parallaxe des couches [data-parallaxe] avec data-vitesse (k) :
 * - "hero" : translation de k × défilement, tant que l'accueil est à l'écran ;
 * - sinon : translation de k × écart entre le centre de l'élément et le centre de l'écran.
 * Propriété CSS `translate` uniquement (composée avec les transform existants), un seul écouteur,
 * calcul regroupé dans requestAnimationFrame. Rien si « réduire les animations » est activé.
 */
export function useParallaxe() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const couches = Array.from(document.querySelectorAll<HTMLElement>('[data-parallaxe]'))
    let raf = 0

    const maj = () => {
      raf = 0
      const vh = window.innerHeight
      for (const couche of couches) {
        const k = Number(couche.dataset.vitesse) || 0
        if (couche.dataset.parallaxe === 'hero') {
          const y = Math.min(window.scrollY, vh * 1.2)
          couche.style.translate = `0 ${(k * y).toFixed(1)}px`
          continue
        }
        const parent = couche.parentElement ?? couche
        const r = parent.getBoundingClientRect()
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue
        const d = r.top + r.height / 2 - vh / 2
        couche.style.translate = `0 ${(k * d).toFixed(1)}px`
      }
    }

    const demander = () => {
      if (!raf) raf = requestAnimationFrame(maj)
    }
    maj()
    window.addEventListener('scroll', demander, { passive: true })
    window.addEventListener('resize', demander)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', demander)
      window.removeEventListener('resize', demander)
    }
  }, [])
}
