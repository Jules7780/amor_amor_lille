import { useEffect, useRef } from 'react'
import { ADRESSE, RESERVATION } from '../data/infos'
import Enseigne from './Enseigne'
import Statut from './Statut'

/** Relief de l'accueil : la photo glisse et l'enseigne s'incline selon la souris (ordinateur uniquement). */
function useReliefSouris(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = ref.current
    if (!hero) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let raf = 0
    const cible = { x: 0, y: 0 }
    const courant = { x: 0, y: 0 }
    const boucle = () => {
      raf = 0
      courant.x += (cible.x - courant.x) * 0.08
      courant.y += (cible.y - courant.y) * 0.08
      hero.style.setProperty('--px', courant.x.toFixed(3))
      hero.style.setProperty('--py', courant.y.toFixed(3))
      if (Math.abs(cible.x - courant.x) + Math.abs(cible.y - courant.y) > 0.002) raf = requestAnimationFrame(boucle)
    }
    const onMove = (e: PointerEvent) => {
      cible.x = (e.clientX / window.innerWidth) * 2 - 1
      cible.y = (e.clientY / window.innerHeight) * 2 - 1
      if (!raf) raf = requestAnimationFrame(boucle)
    }
    hero.addEventListener('pointermove', onMove)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [ref])
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  useReliefSouris(ref)

  return (
    <section id="accueil" className="hero" ref={ref}>
      <div className="hero__profondeur" data-parallaxe="hero" data-vitesse="0.4">
        <picture className="hero__fond">
          <source media="(max-width: 640px)" srcSet="/images/salle-principale-mobile.webp" />
          <source media="(max-width: 960px)" srcSet="/images/salle-principale-960.webp" />
          <img
            src="/images/salle-principale.webp"
            alt="Le salon d'Amor Amor : banquette de velours rouge, lustre en cristal, papier peint fleuri et néon Contre Temps Nocturnes"
            width="1500"
            height="750"
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="hero__voile" aria-hidden="true" />

      <div className="container hero__contenu" data-parallaxe="hero" data-vitesse="-0.18">
        <p className="hero__script">Contre temps nocturnes</p>
        <div className="hero__relief">
          <Enseigne titre className="enseigne--hero" />
        </div>
        <p className="hero__accroche">
          Bar &amp; club dans un ancien hôtel particulier du {ADRESSE.quartier}
        </p>
        <Statut className="hero__statut" />
        <div className="hero__actions">
          <a href={RESERVATION.zenchef} className="btn btn--rouge" target="_blank" rel="noopener noreferrer">
            Réserver une table
          </a>
          <a href="#carte" className="btn btn--contour">
            Voir la carte
          </a>
        </div>
      </div>

      <p className="hero__adresse">
        {ADRESSE.rue} <span aria-hidden="true">·</span> {ADRESSE.ville}
      </p>
    </section>
  )
}
