/*
  Tracé central des tubes du néon « AMOR AMOR » (hauteur des capitales = 1).
  Capitales fines à empattements, comme le néon du bar, et O en soleil à pointes.
  La seconde ligne est la première tournée d'un demi-tour autour du centre :
  l'enseigne entière est donc symétrique par rapport à son centre.
*/

export type Point = [number, number]
type Glyphe = { largeur: number; traits: Point[][] }

function arc(cx: number, cy: number, r: number, debut: number, fin: number, n: number): Point[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = debut + ((fin - debut) * i) / n
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]
  })
}

function soleil(largeur: number, pointes = 16, rayon = 0.5, creux = 0.37): Point[] {
  const cx = largeur / 2
  const points: Point[] = Array.from({ length: pointes * 2 }, (_, i) => {
    const a = Math.PI / 2 + (i * Math.PI) / pointes
    const r = i % 2 === 0 ? rayon : creux
    return [cx + Math.cos(a) * r, 0.5 + Math.sin(a) * r]
  })
  return [...points, points[0]]
}

const GLYPHES: Record<'A' | 'M' | 'O' | 'R', Glyphe> = {
  A: {
    largeur: 0.82,
    traits: [
      [
        [0.04, 0],
        [0.41, 1],
        [0.78, 0],
      ],
      [
        [0.17, 0.34],
        [0.65, 0.34],
      ],
      [
        [-0.07, 0],
        [0.16, 0],
      ],
      [
        [0.66, 0],
        [0.89, 0],
      ],
    ],
  },
  M: {
    largeur: 1,
    traits: [
      [
        [0.08, 0],
        [0.15, 1],
        [0.5, 0.03],
        [0.85, 1],
        [0.92, 0],
      ],
      [
        [-0.03, 0],
        [0.19, 0],
      ],
      [
        [0.81, 0],
        [1.03, 0],
      ],
    ],
  },
  O: {
    largeur: 1,
    traits: [soleil(1)],
  },
  R: {
    largeur: 0.72,
    traits: [
      [[-0.05, 1], ...arc(0.36, 0.745, 0.255, Math.PI / 2, -Math.PI / 2, 12), [0.09, 0.49]],
      [
        [0.09, 1],
        [0.09, 0],
      ],
      [
        [-0.04, 0],
        [0.22, 0],
      ],
      [
        [0.31, 0.49],
        [0.62, 0],
      ],
      [
        [0.52, 0],
        [0.76, 0],
      ],
    ],
  },
}

export const ORDRE = ['A', 'M', 'O', 'R'] as const
const INTERLETTRE = 0.13
/** Demi-écart entre la ligne du haut et la ligne retournée. */
const DEMI_INTERLIGNE = 0.11

export type Lettre = {
  /** 0 à 3 : ligne du haut ; 4 à 7 : ligne retournée */
  index: number
  traits: Point[][]
  centre: Point
}

export function composerEnseigne(): Lettre[] {
  const total = ORDRE.reduce((s, c) => s + GLYPHES[c].largeur, 0) + INTERLETTRE * (ORDRE.length - 1)
  let x = -total / 2
  const haut: Lettre[] = ORDRE.map((c, i) => {
    const g = GLYPHES[c]
    const x0 = x
    x += g.largeur + INTERLETTRE
    return {
      index: i,
      traits: g.traits.map((t) => t.map(([px, py]) => [x0 + px, DEMI_INTERLIGNE + py] as Point)),
      centre: [x0 + g.largeur / 2, DEMI_INTERLIGNE + 0.5],
    }
  })
  const demiTour = ([px, py]: Point): Point => [-px, -py]
  const bas = haut.map((l) => ({
    index: l.index + ORDRE.length,
    traits: l.traits.map((t) => t.map(demiTour)),
    centre: demiTour(l.centre),
  }))
  return [...haut, ...bas]
}

export const LARGEUR_ENSEIGNE =
  ORDRE.reduce((s, c) => s + GLYPHES[c].largeur, 0) + INTERLETTRE * (ORDRE.length - 1)
export const HAUTEUR_ENSEIGNE = 2 + 2 * DEMI_INTERLIGNE
