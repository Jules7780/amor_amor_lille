/** Soleil à pointes du néon (le O de AMOR), en tracé fin comme un tube. */

const POINTES = 16

export function pointsSoleil(rayon = 47, creux = 35.5, centre = 50) {
  return Array.from({ length: POINTES * 2 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / POINTES
    const r = i % 2 === 0 ? rayon : creux
    return `${(centre + Math.cos(angle) * r).toFixed(2)},${(centre + Math.sin(angle) * r).toFixed(2)}`
  }).join(' ')
}

type Props = { className?: string; plein?: boolean }

export default function Soleil({ className, plein = false }: Props) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <polygon
        points={pointsSoleil()}
        fill={plein ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
