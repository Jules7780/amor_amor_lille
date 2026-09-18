import { useEffect } from 'react'

/** Allume les titres [data-neon] (classe is-allume) quand ils entrent franchement à l'écran. */
export function useNeon() {
  useEffect(() => {
    const titres = document.querySelectorAll<HTMLElement>('[data-neon]')
    if (!('IntersectionObserver' in window)) {
      titres.forEach((t) => t.classList.add('is-allume'))
      return
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!entree.isIntersecting) return
          entree.target.classList.add('is-allume')
          observateur.unobserve(entree.target)
        })
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.4 },
    )
    titres.forEach((t) => observateur.observe(t))
    return () => observateur.disconnect()
  }, [])
}
