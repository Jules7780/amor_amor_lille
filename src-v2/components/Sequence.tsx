import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { DUREE, DUREE_ROTATION, T_ALLUMAGE, T_FINALE, T_ROTATION, etatSequence } from './enseigne/sequence'
import type { Scene3D } from './enseigne/scene3d'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

/*
  « L'enseigne s'allume » : le néon AMOR AMOR en 3D temps réel (Three.js), piloté par le défilement.
  La timeline GSAP anime les légendes ; la scène lit le même temps (enseigne/sequence.ts).
  Sans WebGL, avec « réduire les animations » ou sur un écran trop bas : photo du vrai néon et légendes fixes.
*/

function webglDisponible() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    // Libère tout de suite ce contexte de test : le navigateur limite le nombre de contextes actifs
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

const ETAPES = [
  {
    surtitre: 'Au fond du salon',
    texte: 'Au-dessus de la cheminée de marbre, entre deux lustres en cristal, une enseigne attend la nuit.',
  },
  {
    surtitre: 'Contre temps nocturnes',
    texte: 'Quand le soir tombe, le néon grésille puis s’allume, lettre après lettre.',
  },
  {
    surtitre: 'Dans les deux sens',
    texte: 'Retournez-la : l’enseigne dit toujours Amor.',
  },
]

export default function Sequence() {
  const racine = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          anime: '(prefers-reduced-motion: no-preference) and (min-height: 500px)',
          mobile: '(max-width: 760px)',
        },
        (contexte) => {
          const { anime, mobile } = contexte.conditions as { anime: boolean; mobile: boolean }
          const bloc = racine.current
          if (!anime || !bloc || !webglDisponible()) return

          bloc.classList.add('sequence--anime')
          const q = gsap.utils.selector(bloc)
          const scene = q('.sequence__scene')[0] as HTMLElement
          const canvas = q('.sequence__canvas')[0] as HTMLCanvasElement
          const etapes = q('.sequence__etape') as HTMLElement[]
          const jauge = q('.sequence__jauge')[0] as HTMLElement

          let scene3d: Scene3D | null = null
          let raf = 0
          let annule = false
          let chargement = false
          let generation = 0

          const tl = gsap.timeline({
            defaults: { ease: 'none', immediateRender: false },
            scrollTrigger: {
              trigger: scene,
              start: 'top top',
              end: () => `+=${window.innerHeight * (mobile ? 2.6 : 3.2)}`,
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          // Légendes : chacune apparaît puis s'efface au rythme de l'enseigne
          const reperes = [
            [0, T_ALLUMAGE - 0.05],
            [T_ALLUMAGE + 0.05, T_ROTATION - 0.15],
            [T_ROTATION + 0.1, T_ROTATION + DUREE_ROTATION + 0.05],
          ]
          gsap.set(etapes.slice(1), { autoAlpha: 0, y: 24 })
          gsap.set(q('.sequence__final > *'), { autoAlpha: 0, y: 20 })
          tl.to(q('.sequence__indice'), { autoAlpha: 0, duration: 0.25 }, 0.1)
          etapes.forEach((etape, i) => {
            const [debut, fin] = reperes[i] ?? [T_FINALE, DUREE]
            if (i > 0) tl.fromTo(etape, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, debut)
            tl.to(etape, { autoAlpha: 0, y: -24, duration: 0.2, ease: 'power1.in' }, fin)
          })
          tl.fromTo(
            q('.sequence__final > *'),
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' },
            T_FINALE,
          )
          // La timeline dure exactement DUREE : la scène 3D lit le même temps
          tl.set({}, {}, DUREE)

          // Jauge des huit tubes (A M O R, puis la ligne retournée)
          const lettresJauge = Array.from(jauge.children) as HTMLElement[]
          let dernierEtat = ''
          const majJauge = (t: number) => {
            const e = etatSequence(t)
            const cle = e.allume.map((v) => (v > 0.5 ? 1 : 0)).join('')
            if (cle === dernierEtat) return
            dernierEtat = cle
            lettresJauge.forEach((el, i) => el.classList.toggle('is-allume', e.allume[i] > 0.5))
          }

          // Rendu : uniquement quand la scène est à l'écran
          const boucle = () => {
            raf = requestAnimationFrame(boucle)
            // Démo : quand cette version est cachée derrière l'autre (classe posée par selecteur/cadre.ts), rien à dessiner
            if (!scene3d || document.documentElement.classList.contains('cadre-masque')) return
            const t = tl.time()
            scene3d.rendre(t)
            majJauge(t)
          }
          const demarrer = () => {
            if (!raf) raf = requestAnimationFrame(boucle)
          }
          const arreter = () => {
            cancelAnimationFrame(raf)
            raf = 0
          }

          // La scène n'apparaît qu'une fois entièrement préparée (shaders compilés) ; la photo reste en attendant
          const charger = () => {
            chargement = true
            const numero = ++generation
            const abandon = () => annule || numero !== generation
            import('./enseigne/scene3d')
              .then(({ creerScene }) =>
                creerScene(canvas, { mobile, largeur: scene.clientWidth, hauteur: scene.clientHeight, abandon }),
              )
              .then((prete) => {
                if (abandon()) {
                  prete.detruire()
                  return
                }
                scene3d = prete
                scene3d.redimensionner(scene.clientWidth, scene.clientHeight)
                bloc.classList.remove('sequence--sans-3d')
                bloc.classList.add('sequence--prete')
              })
              .catch((erreur) => {
                if (abandon()) return
                console.warn('Enseigne 3D indisponible, photo affichée à la place.', erreur)
                bloc.classList.add('sequence--sans-3d')
              })
          }

          // Contexte WebGL perdu (pilote réinitialisé, mémoire saturée) : photo, puis reconstruction
          const surPerteContexte = (evenement: Event) => {
            evenement.preventDefault() // autorise le navigateur à restaurer le contexte
            generation++
            scene3d?.detruire()
            scene3d = null
            bloc.classList.remove('sequence--prete')
            bloc.classList.add('sequence--sans-3d')
          }
          const surRestaurationContexte = () => {
            if (!annule && chargement) charger()
          }
          canvas.addEventListener('webglcontextlost', surPerteContexte)
          canvas.addEventListener('webglcontextrestored', surRestaurationContexte)

          const redimension = new ResizeObserver(() => scene3d?.redimensionner(scene.clientWidth, scene.clientHeight))
          redimension.observe(scene)

          // Préparation dès l'ouverture du site, au premier moment libre après l'affichage (par étapes, sans bloquer) ;
          // rendu seulement quand la scène est à l'écran
          const inactif = typeof window.requestIdleCallback === 'function'
          const attente = inactif
            ? window.requestIdleCallback(() => !annule && charger(), { timeout: 1200 })
            : setTimeout(() => !annule && charger(), 200)
          const vue = new IntersectionObserver(([entree]) => (entree.isIntersecting ? demarrer() : arreter()), {
            rootMargin: '10% 0px',
          })
          vue.observe(scene)

          document.fonts?.ready.then(() => ScrollTrigger.refresh())

          return () => {
            annule = true
            if (inactif) window.cancelIdleCallback(attente)
            else clearTimeout(attente)
            arreter()
            vue.disconnect()
            redimension.disconnect()
            canvas.removeEventListener('webglcontextlost', surPerteContexte)
            canvas.removeEventListener('webglcontextrestored', surRestaurationContexte)
            scene3d?.detruire()
            scene3d = null
            bloc.classList.remove('sequence--anime', 'sequence--prete', 'sequence--sans-3d')
          }
        },
      )
    },
    { scope: racine },
  )

  return (
    <section className="sequence" ref={racine} aria-label="L'enseigne AMOR AMOR">
      <div className="sequence__scene">
        <div className="sequence__visuel">
          <canvas className="sequence__canvas" aria-hidden="true" />
          <picture className="sequence__poster">
            <source media="(max-width: 640px)" srcSet="/images/neon-amor-640.webp" />
            <img
              src="/images/neon-amor.webp"
              alt="Le néon AMOR AMOR du salon, dont la seconde ligne se lit à l'envers, entre deux lustres en cristal"
              width="1200"
              height="1043"
              loading="lazy"
            />
          </picture>
          <div className="sequence__voile" aria-hidden="true" />
        </div>

        <div className="container sequence__textes">
          {ETAPES.map((etape) => (
            <div key={etape.surtitre} className="sequence__etape">
              <p className="surtitre">{etape.surtitre}</p>
              <p className="sequence__texte">{etape.texte}</p>
            </div>
          ))}
          <div className="sequence__final">
            <p className="sequence__nom">Amor Amor</p>
            <p className="sequence__texte">27 rue Royale, Vieux-Lille</p>
            <a href="#le-lieu" className="btn btn--contour">
              Entrer
            </a>
          </div>
        </div>

        <p className="sequence__indice" aria-hidden="true">
          Faites défiler pour allumer l'enseigne
        </p>
        <ol className="sequence__jauge" aria-hidden="true">
          {['A', 'M', 'O', 'R', 'A', 'M', 'O', 'R'].map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ol>
      </div>
    </section>
  )
}

