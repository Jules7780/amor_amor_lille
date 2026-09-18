import Soleil from './Soleil'

/**
 * Le néon « AMOR AMOR » du bar : la seconde ligne est la première tournée d'un demi-tour,
 * et le O est un soleil à pointes. Interprétation du néon, à remplacer par le fichier officiel si besoin.
 */

const LETTRES = ['A', 'M', 'O', 'R'] as const

function Ligne({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`enseigne__ligne ${inverse ? 'enseigne__ligne--inverse' : ''}`} aria-hidden="true">
      {LETTRES.map((lettre, i) =>
        lettre === 'O' ? (
          <Soleil key={i} className="enseigne__soleil" />
        ) : (
          <span key={i} className="enseigne__lettre">
            {lettre}
          </span>
        ),
      )}
    </span>
  )
}

type Props = { className?: string; titre?: boolean }

export default function Enseigne({ className = '', titre = false }: Props) {
  const Balise = titre ? 'h1' : 'span'
  return (
    <Balise className={`enseigne ${className}`}>
      <span className="sr-only">Amor Amor</span>
      <Ligne />
      <Ligne inverse />
    </Balise>
  )
}
