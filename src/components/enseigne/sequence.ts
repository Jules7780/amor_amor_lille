/*
  Modèle de la séquence « L'enseigne s'allume ».
  Tout l'état visuel est une fonction pure du temps de la timeline GSAP (pilotée par le défilement),
  partagée par la scène 3D et par les légendes HTML.
*/

export const NB_LETTRES = 8

// Repères de la timeline (unités arbitraires réparties sur la distance de défilement)
export const T_ALLUMAGE = 0.45
export const PAS_LETTRE = 0.2
export const DUREE_LETTRE = 0.34
/** La ligne retournée s'allume après une courte pause */
export const T_LIGNE_2 = T_ALLUMAGE + 4 * PAS_LETTRE + 0.25
export const T_FIN_ALLUMAGE = T_LIGNE_2 + 3 * PAS_LETTRE + DUREE_LETTRE
export const T_ROTATION = T_FIN_ALLUMAGE + 0.35
export const DUREE_ROTATION = 1.25
export const T_FINALE = T_ROTATION + DUREE_ROTATION + 0.15
export const DUREE = T_FINALE + 0.9

const borne = (v: number) => Math.min(1, Math.max(0, v))
const douce = (p: number) => p * p * (3 - 2 * p)
const tresDouce = (p: number) => p * p * p * (p * (p * 6 - 15) + 10)

export const debutLettre = (i: number) =>
  i < 4 ? T_ALLUMAGE + i * PAS_LETTRE : T_LIGNE_2 + (i - 4) * PAS_LETTRE

// Pseudo-hasard déterministe : le grésillement est le même à chaque passage
const hasard = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** Allumage d'un tube : grésille d'abord (on/off), puis se stabilise. */
function allumage(i: number, t: number) {
  const u = (t - debutLettre(i)) / DUREE_LETTRE
  if (u <= 0) return 0
  if (u >= 1) return 1
  const cran = Math.floor(u * 11)
  const allume = hasard(i * 17 + cran) < 0.25 + u * 0.9
  return allume ? 0.55 + 0.45 * u : 0.06
}

export type EtatSequence = {
  allume: number[]
  /** Moyenne des tubes allumés, pour l'éclairage d'ensemble */
  total: number
  /** Demi-tour de l'enseigne (0 à 1) */
  rotation: number
  /** Décollement du mur pendant le demi-tour (0 à 1) */
  decollement: number
  camera: { azimut: number; elevation: number; recul: number; visee: number }
}

export function etatSequence(t: number): EtatSequence {
  const allume = Array.from({ length: NB_LETTRES }, (_, i) => allumage(i, t))
  const total = allume.reduce((s, v) => s + v, 0) / NB_LETTRES

  const pr = borne((t - T_ROTATION) / DUREE_ROTATION)
  const rotation = tresDouce(pr)
  const decollement = Math.sin(Math.PI * douce(borne((t - T_ROTATION + 0.12) / (DUREE_ROTATION + 0.24))))

  // Caméra : vue de trois quarts en contre-plongée, qui se place de face pendant l'allumage
  const approche = douce(borne(t / T_FIN_ALLUMAGE))
  const finale = douce(borne((t - T_FINALE) / 0.8))
  return {
    allume,
    total,
    rotation,
    decollement,
    camera: {
      azimut: -0.52 * (1 - approche) + 0.1 * Math.sin(Math.PI * pr),
      elevation: -0.16 * (1 - approche) + 0.03 * approche,
      recul: 0.86 + 0.14 * approche + 0.1 * decollement + 0.06 * finale,
      visee: 0.05 + 0.25 * finale,
    },
  }
}
