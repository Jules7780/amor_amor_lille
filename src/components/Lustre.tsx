/** Lustre en cristal dessiné au trait (décor en parallaxe). Purement décoratif. */

const CORDONS = 9
const r2 = (n: number) => Math.round(n * 10) / 10

function dessin() {
  const cx = 100
  const hautY = 70
  const largeY = 160
  const pointeY = 290
  const traits: string[] = []
  const perles: Array<[number, number]> = []
  const pampilles: Array<[number, number]> = []

  for (let i = 0; i < CORDONS; i++) {
    const u = i / (CORDONS - 1) // de gauche à droite (vue de face)
    const xLarge = cx - 78 + u * 156
    const xHaut = cx - 22 + u * 44
    // Tente : couronne haute → couronne large
    traits.push(`M${r2(xHaut)} ${hautY} Q${r2((xHaut + xLarge) / 2 + (xLarge - cx) * 0.25)} ${r2((hautY + largeY) / 2)} ${r2(xLarge)} ${largeY}`)
    // Sac : couronne large → pointe
    traits.push(`M${r2(xLarge)} ${largeY} Q${r2(xLarge * 0.6 + cx * 0.4)} ${r2(largeY + 80)} ${cx} ${pointeY}`)
    for (let k = 1; k < 6; k++) {
      const t = k / 6
      perles.push([xHaut + (xLarge - xHaut) * Math.sin((t * Math.PI) / 2), hautY + (largeY - hautY) * t])
    }
    pampilles.push([xLarge, largeY + 16])
  }
  // Guirlandes entre les bras
  for (let i = 0; i < CORDONS - 1; i++) {
    const a = cx - 78 + (i / (CORDONS - 1)) * 156
    const b = cx - 78 + ((i + 1) / (CORDONS - 1)) * 156
    traits.push(`M${r2(a)} ${largeY} Q${r2((a + b) / 2)} ${largeY + 14} ${r2(b)} ${largeY}`)
  }
  return { traits, perles, pampilles, cx, hautY, largeY, pointeY }
}

const D = dessin()

export default function Lustre({ className = '' }: { className?: string }) {
  return (
    <svg className={`lustre ${className}`} viewBox="0 0 200 320" aria-hidden="true" focusable="false">
      <line x1={D.cx} y1="0" x2={D.cx} y2={D.hautY} className="lustre__tige" />
      <ellipse cx={D.cx} cy={D.hautY} rx="24" ry="5" className="lustre__anneau" />
      <ellipse cx={D.cx} cy={D.largeY} rx="80" ry="12" className="lustre__anneau" />
      {D.traits.map((d, i) => (
        <path key={i} d={d} className="lustre__cordon" />
      ))}
      {D.perles.map(([x, y], i) => (
        <circle key={i} cx={r2(x)} cy={r2(y)} r="1.8" className="lustre__perle" />
      ))}
      {D.pampilles.map(([x, y], i) => (
        <path key={i} d={`M${r2(x)} ${y - 8} l4 8 l-4 10 l-4 -10 z`} className="lustre__pampille" />
      ))}
      <path d={`M${D.cx} ${D.pointeY} l5 10 l-5 14 l-5 -14 z`} className="lustre__pampille" />
    </svg>
  )
}
