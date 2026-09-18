import { Fragment } from 'react'

type Props = { children: string; className?: string; niveau?: 'h2' | 'h3' }

// Ordre d'allumage des lettres, un peu désordonné comme de vrais tubes
const decalage = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.1) * 43758.5453
  return (n * 0.045 + (x - Math.floor(x)) * 0.22).toFixed(3)
}

/**
 * Titre de section qui s'allume comme un néon à son entrée à l'écran (classe is-allume posée par useNeon).
 * Le texte complet reste lisible par les lecteurs d'écran et les moteurs de recherche.
 */
export default function TitreNeon({ children, className = '', niveau = 'h2' }: Props) {
  const Balise = niveau
  let n = 0
  return (
    <Balise className={`titre titre-neon ${className}`} data-neon>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {children.split(' ').map((mot, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="titre-neon__mot">
              {Array.from(mot).map((lettre, j) => (
                <span key={j} className="titre-neon__lettre" style={{ animationDelay: `${decalage(n++)}s` }}>
                  {lettre}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </Balise>
  )
}
