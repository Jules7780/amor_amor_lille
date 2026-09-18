import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { composerEnseigne, type Lettre } from './glyphes'
import { NB_LETTRES, etatSequence } from './sequence'
import * as S from './shaders'

export type Scene3D = {
  rendre: (temps: number) => void
  redimensionner: (largeur: number, hauteur: number) => void
  detruire: () => void
}

type OptionsScene = {
  mobile: boolean
  largeur: number
  hauteur: number
  /** Vrai quand la scène n'est plus attendue (démontage, perte du contexte) : la préparation s'arrête. */
  abandon: () => boolean
}

const pause = (ms = 0) => new Promise<void>((resoudre) => setTimeout(resoudre, ms))
const lineaire = (hex: string) => new THREE.Color(hex)

/* Géométries ------------------------------------------------------------- */

/** Tous les tubes en une seule géométrie : segments cylindriques + billes aux jointures, attribut aLettre. */
function geometrieTubes(lettres: Lettre[], rayon: number, radial: number) {
  const morceaux: THREE.BufferGeometry[] = []
  const cylindre = new THREE.CylinderGeometry(rayon, rayon, 1, radial, 1, true)
  const bille = new THREE.SphereGeometry(rayon, radial, Math.max(4, Math.round(radial / 2)))
  const ajouter = (g: THREE.BufferGeometry, lettre: number) => {
    const n = g.getAttribute('position').count
    g.setAttribute('aLettre', new THREE.Float32BufferAttribute(new Float32Array(n).fill(lettre), 1))
    morceaux.push(g)
  }
  for (const lettre of lettres) {
    for (const trait of lettre.traits) {
      const ferme = trait.length > 2 && trait[0][0] === trait[trait.length - 1][0] && trait[0][1] === trait[trait.length - 1][1]
      trait.forEach(([x, y], k) => {
        if (!(ferme && k === trait.length - 1)) ajouter(bille.clone().translate(x, y, 0), lettre.index)
        if (k === 0) return
        const [px, py] = trait[k - 1]
        const g = cylindre.clone()
        g.scale(1, Math.hypot(x - px, y - py), 1)
        g.rotateZ(Math.atan2(y - py, x - px) - Math.PI / 2)
        g.translate((x + px) / 2, (y + py) / 2, 0)
        ajouter(g, lettre.index)
      })
    }
  }
  const fusion = mergeGeometries(morceaux)!
  morceaux.forEach((g) => g.dispose())
  cylindre.dispose()
  bille.dispose()
  return fusion
}

/** Points du halo, répartis régulièrement le long des tubes. */
function geometrieHalo(lettres: Lettre[], pas: number) {
  const positions: number[] = []
  const indices: number[] = []
  for (const lettre of lettres) {
    for (const trait of lettre.traits) {
      for (let k = 1; k < trait.length; k++) {
        const [ax, ay] = trait[k - 1]
        const [bx, by] = trait[k]
        const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / pas))
        for (let j = 0; j < n; j++) {
          const u = j / n
          positions.push(ax + (bx - ax) * u, ay + (by - ay) * u, 0.02)
          indices.push(lettre.index)
        }
      }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  g.setAttribute('aLettre', new THREE.Float32BufferAttribute(indices, 1))
  return g
}

/** Cadre mouluré : rectangle évidé, extrudé avec un biseau arrondi. */
function moulure(largeur: number, hauteur: number, bande: number, profondeur: number, biseau: number) {
  const L = largeur / 2
  const H = hauteur / 2
  const l = L - bande
  const h = H - bande
  const forme = new THREE.Shape([
    new THREE.Vector2(-L, -H),
    new THREE.Vector2(L, -H),
    new THREE.Vector2(L, H),
    new THREE.Vector2(-L, H),
  ])
  forme.holes.push(
    new THREE.Path([new THREE.Vector2(-l, -h), new THREE.Vector2(-l, h), new THREE.Vector2(l, h), new THREE.Vector2(l, -h)]),
  )
  return new THREE.ExtrudeGeometry(forme, {
    depth: profondeur,
    bevelEnabled: true,
    bevelThickness: biseau,
    bevelSize: biseau,
    bevelSegments: 3,
    curveSegments: 1,
  })
}

/** Fronton cintré : bande en arc de cercle. */
function fronton(corde: number, fleche: number, epaisseur: number) {
  const R = (corde * corde) / (8 * fleche) + fleche / 2
  const a0 = Math.asin(corde / 2 / R)
  const forme = new THREE.Shape()
  forme.absarc(0, fleche - R, R, Math.PI / 2 + a0, Math.PI / 2 - a0, true)
  forme.absarc(0, fleche - R, R - epaisseur, Math.PI / 2 - a0 * 0.97, Math.PI / 2 + a0 * 0.97, false)
  forme.closePath()
  return new THREE.ExtrudeGeometry(forme, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 40,
  })
}

/** Volute : spirale en tube. */
function volute(sens: 1 | -1) {
  const points: THREE.Vector3[] = []
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 3.2
    const r = 0.26 * Math.exp(-0.28 * a)
    points.push(new THREE.Vector3(sens * Math.cos(a) * r, Math.sin(a) * r, 0))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 90, 0.032, 8, false)
}

/** Rosace du bandeau : couronne et bouton. */
function rosace() {
  const couronne = new THREE.TorusGeometry(0.075, 0.024, 6, 18)
  const bouton = new THREE.SphereGeometry(0.038, 10, 6).scale(1, 1, 0.7)
  const g = mergeGeometries([couronne.deleteAttribute('uv'), bouton.deleteAttribute('uv')])!
  couronne.dispose()
  bouton.dispose()
  return g
}

/* Scène ------------------------------------------------------------------ */

type Etape = (ms?: number) => Promise<void>

/**
 * Construit la scène par étapes en rendant la main au navigateur entre chacune,
 * puis compile tous les shaders en parallèle avant de la livrer : aucun blocage au défilement.
 * Aucun calcul d'environnement (PMREM) : les reflets sont calculés directement dans les shaders.
 */
export async function creerScene(canvas: HTMLCanvasElement, options: OptionsScene): Promise<Scene3D> {
  const { mobile } = options
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' })
  // Au-delà de 1,5 le gain visuel est faible et le coût GPU double ; la qualité baisse encore si l'appareil décroche
  const ratioMax = Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.5)
  const ratioMin = Math.min(1, ratioMax) * 0.7
  let ratio = ratioMax
  renderer.setPixelRatio(ratio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  const aJeter: Array<{ dispose: () => void }> = []
  const detruire = () => {
    aJeter.forEach((o) => o.dispose())
    renderer.dispose()
  }
  const etape: Etape = async (ms = 0) => {
    await pause(ms)
    if (options.abandon()) {
      detruire()
      throw new Error("Préparation de l'enseigne 3D abandonnée")
    }
  }

  const scene = new THREE.Scene()
  scene.background = lineaire('#050102')
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
  const cible = new THREE.Vector3()

  /* Uniforms partagés */
  const allume = { value: new Array<number>(NB_LETTRES).fill(0) }
  const lumieres = { value: Array.from({ length: NB_LETTRES }, () => new THREE.Vector3()) }
  const neon = { value: lineaire('#ff2136').multiplyScalar(1.5) }
  const directionCle = new THREE.Vector3(0.15, 1, 0.45).normalize()
  const cle = { value: new THREE.Color() }
  const ambiant = { value: new THREE.Color() }
  const ambiance = { value: 1 }
  const total = { value: 0 }
  const temps = { value: 0 }

  const materiauStuc = (couleur: string, brillance = 0) => {
    const m = new THREE.ShaderMaterial({
      uniforms: {
        uAllume: allume,
        uLumieres: lumieres,
        uNeon: neon,
        uCle: cle,
        uCleDirection: { value: directionCle },
        uAmbiant: ambiant,
        uCouleur: { value: lineaire(couleur) },
        uBrillance: { value: brillance },
      },
      vertexShader: S.stucVertex,
      fragmentShader: S.stucFragment,
    })
    aJeter.push(m)
    return m
  }
  const ajouter = (geometrie: THREE.BufferGeometry, materiau: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometrie, materiau)
    mesh.position.set(x, y, z)
    scene.add(mesh)
    aJeter.push(geometrie)
    return mesh
  }

  /* Mur, panneau rouge et moulures (le néon est posé au-dessus de la cheminée) */
  const fond = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 24),
    new THREE.ShaderMaterial({
      uniforms: { uFond: { value: lineaire('#1a0406') }, uNeon: neon, uTotal: total, uAmbiance: ambiance },
      vertexShader: S.fondVertex,
      fragmentShader: S.fondFragment,
    }),
  )
  fond.position.set(0, 0.4, -0.32)
  scene.add(fond)
  aJeter.push(fond.geometry, fond.material as THREE.Material)

  const stuc = materiauStuc('#dcc3b8', 0.15)
  const peinture = materiauStuc('#6e0710', 0.05)
  const marbre = materiauStuc('#cfc6c0', 0.55)
  const laiton = materiauStuc('#8a6428', 0.9)

  ajouter(new THREE.PlaneGeometry(5.2, 3.3), peinture, 0, 0, -0.14)
  ajouter(moulure(5.5, 3.6, 0.2, 0.05, 0.05), stuc, 0, 0, -0.16)
  ajouter(moulure(6.3, 4.4, 0.14, 0.04, 0.04), stuc, 0, 0, -0.2)
  await etape()

  // Pilastres, bandeau à rosaces, corniche et fronton à volutes
  const pilastre = new RoundedBoxGeometry(0.34, 4.6, 0.2, 2, 0.04)
  ajouter(pilastre, stuc, -3.45, -0.1, -0.16)
  ajouter(pilastre.clone(), stuc, 3.45, -0.1, -0.16)
  ajouter(new RoundedBoxGeometry(7.3, 0.5, 0.2, 2, 0.04), stuc, 0, 2.47, -0.18)
  ajouter(new RoundedBoxGeometry(7.7, 0.12, 0.34, 2, 0.04), stuc, 0, 2.78, -0.14)
  ajouter(new RoundedBoxGeometry(7.95, 0.1, 0.42, 2, 0.04), stuc, 0, 2.89, -0.12)
  ajouter(fronton(5.4, 0.62, 0.2), stuc, 0, 2.94, -0.2)
  ajouter(volute(1), stuc, 2.62, 3.2, -0.12)
  ajouter(volute(-1), stuc, -2.62, 3.2, -0.12)

  const nbRosaces = 15
  const rosaces = new THREE.InstancedMesh(rosace(), stuc, nbRosaces)
  const m4 = new THREE.Matrix4()
  for (let i = 0; i < nbRosaces; i++) rosaces.setMatrixAt(i, m4.makeTranslation(-3.36 + (i * 6.72) / (nbRosaces - 1), 2.47, -0.06))
  scene.add(rosaces)
  aJeter.push(rosaces.geometry)

  // Tablette de cheminée en marbre
  ajouter(new RoundedBoxGeometry(7.2, 0.16, 0.75, 2, 0.05), marbre, 0, -2.42, 0.2)
  ajouter(new RoundedBoxGeometry(6.6, 0.5, 0.5, 2, 0.05), marbre, 0, -2.78, 0.12)
  await etape()

  /* Enseigne : tubes et halo, dans un groupe qui peut se décoller et faire un demi-tour */
  const lettres = composerEnseigne()
  const enseigne = new THREE.Group()
  scene.add(enseigne)

  const materiauTubes = new THREE.ShaderMaterial({
    uniforms: { uAllume: allume, uTemps: temps, uLumiereVue: { value: new THREE.Vector3() }, uAmbiance: ambiance },
    vertexShader: S.tubeVertex,
    fragmentShader: S.tubeFragment,
  })
  const tubes = new THREE.Mesh(geometrieTubes(lettres, 0.03, mobile ? 8 : 12), materiauTubes)
  enseigne.add(tubes)
  aJeter.push(tubes.geometry, materiauTubes)
  await etape()

  const echelleHalo = { value: 1 }
  const materiauHalo = new THREE.ShaderMaterial({
    uniforms: {
      uAllume: allume,
      uTaille: { value: 0.46 },
      uEchelle: echelleHalo,
      uCouleur: { value: lineaire('#ff1f3a').multiplyScalar(mobile ? 0.3 : 0.24) },
    },
    vertexShader: S.haloVertex,
    fragmentShader: S.haloFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const halo = new THREE.Points(geometrieHalo(lettres, mobile ? 0.075 : 0.05), materiauHalo)
  halo.renderOrder = 10
  enseigne.add(halo)
  aJeter.push(halo.geometry, materiauHalo)

  /* Lustres en cristal, de part et d'autre du fronton */
  const materiauCristal = new THREE.ShaderMaterial({
    uniforms: {
      uChaud: { value: lineaire('#ffd9a8') },
      uNeon: neon,
      uCentreNeon: { value: new THREE.Vector3(0, 0, 0.2) },
      uAmpoules: { value: [new THREE.Vector3(), new THREE.Vector3()] },
      uTotal: total,
      uTemps: temps,
      uAmbiance: ambiance,
    },
    vertexShader: S.cristalVertex,
    fragmentShader: S.cristalFragment,
  })
  const pampille = new THREE.OctahedronGeometry(1, 0).scale(0.034, 0.068, 0.034)
  aJeter.push(materiauCristal, pampille)

  const construireLustre = () => {
    const groupe = new THREE.Group()
    const cordons = mobile ? 16 : 24
    const matrices: THREE.Matrix4[] = []
    const poser = (x: number, y: number, z: number, angle: number) =>
      matrices.push(new THREE.Matrix4().makeRotationY(angle).setPosition(x, y, z))
    for (let c = 0; c < cordons; c++) {
      const a = (c / cordons) * Math.PI * 2
      const ux = Math.cos(a)
      const uz = Math.sin(a)
      // Tente : de la couronne haute à la couronne large
      for (let k = 0; k <= 11; k++) {
        const t = k / 11
        const r = 0.12 + 0.52 * Math.sin((t * Math.PI) / 2)
        poser(ux * r, -0.78 * t - 0.03 * Math.sin(Math.PI * t), uz * r, a)
      }
      // Sac : de la couronne large à la pointe
      for (let k = 1; k <= (mobile ? 8 : 12); k++) {
        const t = k / (mobile ? 8 : 12)
        const r = 0.64 * Math.pow(1 - t, 1.3) + 0.05 * t
        poser(ux * r, -0.78 - 0.72 * t, uz * r, a + 0.3)
      }
      // Pendeloques sous la couronne large
      if (c % 2 === 0) for (let k = 1; k <= 3; k++) poser(ux * 0.68, -0.78 - k * 0.1, uz * 0.68, a)
    }
    const cristaux = new THREE.InstancedMesh(pampille, materiauCristal, matrices.length)
    matrices.forEach((m, i) => cristaux.setMatrixAt(i, m))
    groupe.add(cristaux)

    const anneauHaut = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 32).rotateX(Math.PI / 2), laiton)
    const anneauLarge = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.014, 6, 64).rotateX(Math.PI / 2), laiton)
    anneauLarge.position.y = -0.78
    const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.2, 8), laiton)
    tige.position.y = 1.1
    groupe.add(anneauHaut, anneauLarge, tige)
    aJeter.push(anneauHaut.geometry, anneauLarge.geometry, tige.geometry)
    return groupe
  }
  const lustres = [construireLustre(), construireLustre()]
  lustres[0].position.set(-2.85, 2.95, 1.25)
  lustres[1].position.set(2.85, 2.95, 1.25)
  lustres[1].rotation.y = 0.4
  scene.add(...lustres)
  lustres.forEach((l, i) => materiauCristal.uniforms.uAmpoules.value[i].set(l.position.x, l.position.y - 0.6, l.position.z))

  // Ampoules des lustres : halo chaud
  const ampoules = new THREE.BufferGeometry()
  const posAmpoules: number[] = []
  lustres.forEach((l) => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      posAmpoules.push(l.position.x + Math.cos(a) * 0.3, l.position.y - 0.55, l.position.z + Math.sin(a) * 0.3)
    }
    posAmpoules.push(l.position.x, l.position.y - 0.9, l.position.z)
  })
  ampoules.setAttribute('position', new THREE.Float32BufferAttribute(posAmpoules, 3))
  ampoules.setAttribute('aLettre', new THREE.Float32BufferAttribute(new Float32Array(posAmpoules.length / 3), 1))
  const materiauAmpoules = new THREE.ShaderMaterial({
    uniforms: {
      uAllume: { value: new Array<number>(NB_LETTRES).fill(1) },
      uTaille: { value: 0.55 },
      uEchelle: echelleHalo,
      uCouleur: { value: lineaire('#ffb46b').multiplyScalar(0.45) },
    },
    vertexShader: S.haloVertex,
    fragmentShader: S.haloFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const halosAmpoules = new THREE.Points(ampoules, materiauAmpoules)
  halosAmpoules.renderOrder = 11
  scene.add(halosAmpoules)
  aJeter.push(ampoules, materiauAmpoules)
  await etape()

  /* Cadrage */
  let largeur = 1
  let hauteur = 1
  let distanceBase = 20

  const majEchelleHalo = () => {
    echelleHalo.value = (hauteur * ratio) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
  }

  const redimensionner = (l: number, h: number) => {
    largeur = Math.max(1, l)
    hauteur = Math.max(1, h)
    renderer.setSize(largeur, hauteur, false)
    camera.aspect = largeur / hauteur
    const demiV = THREE.MathUtils.degToRad(camera.fov / 2)
    const demiH = Math.atan(Math.tan(demiV) * camera.aspect)
    const portrait = camera.aspect < 1
    const large = camera.aspect > 1.25
    // Téléphone : l'enseigne occupe la largeur ; tablette en portrait : un peu d'air autour
    const largeurVisee = portrait ? (camera.aspect < 0.62 ? 4.5 : 5.9) : large ? 8.4 : 7.4
    const hauteurVisee = portrait ? 5.2 : 6.2
    distanceBase = Math.max(hauteurVisee / 2 / Math.tan(demiV), largeurVisee / 2 / Math.tan(demiH))
    // Écran large : l'enseigne glisse vers la droite pour laisser la place aux légendes à gauche
    if (large) camera.setViewOffset(largeur, hauteur, -largeur * 0.1, 0, largeur, hauteur)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    majEchelleHalo()
  }

  // Qualité adaptative : si les images s'espacent trop (GPU saturé), la résolution baisse par paliers
  const durees: number[] = []
  let derniereImage = 0
  const ajusterQualite = () => {
    const maintenant = performance.now()
    const duree = maintenant - derniereImage
    derniereImage = maintenant
    if (duree > 250) {
      durees.length = 0 // reprise après une pause du rendu
      return
    }
    durees.push(duree)
    if (durees.length < 40) return
    const mediane = durees.sort((a, b) => a - b)[20]
    durees.length = 0
    if (mediane > 24 && ratio > ratioMin) {
      ratio = Math.max(ratioMin, ratio * 0.8)
      renderer.setPixelRatio(ratio)
      renderer.setSize(largeur, hauteur, false)
      majEchelleHalo()
    }
  }

  const origine = performance.now()
  const cleChaude = lineaire('#ffcf9e')
  const direction = new THREE.Vector3()

  const rendre = (t: number) => {
    ajusterQualite()
    const e = etatSequence(t)
    const secondes = (performance.now() - origine) / 1000
    temps.value = secondes

    e.allume.forEach((v, i) => (allume.value[i] = v))
    total.value = e.total
    // Les lustres baissent quand le néon s'allume
    ambiance.value = 1 - 0.6 * e.total
    cle.value.copy(cleChaude).multiplyScalar(0.34 * ambiance.value)
    ambiant.value.setRGB(0.016, 0.008, 0.009).addScalar(0.012 * ambiance.value)

    // Demi-tour de l'enseigne : elle se décolle du mur, tourne, puis reprend sa place
    enseigne.position.z = 0.02 + e.decollement * 0.95
    enseigne.rotation.set(Math.sin(Math.PI * e.rotation) * 0.12, Math.sin(Math.PI * e.rotation) * 0.38, -Math.PI * e.rotation)
    enseigne.updateMatrixWorld()
    lettres.forEach((l, i) => lumieres.value[i].set(l.centre[0], l.centre[1], 0.08).applyMatrix4(enseigne.matrixWorld))

    // Léger balancement des lustres
    lustres[0].rotation.z = Math.sin(secondes * 0.6) * 0.012
    lustres[1].rotation.z = Math.sin(secondes * 0.53 + 1.3) * 0.012

    // Caméra
    const { azimut, elevation, recul, visee } = e.camera
    const d = distanceBase * recul
    cible.set(0, visee, 0)
    camera.position.set(
      Math.sin(azimut) * Math.cos(elevation) * d,
      visee + Math.sin(elevation) * d,
      Math.cos(azimut) * Math.cos(elevation) * d,
    )
    camera.lookAt(cible)
    camera.updateMatrixWorld()
    materiauTubes.uniforms.uLumiereVue.value.copy(direction.copy(directionCle).transformDirection(camera.matrixWorldInverse))

    renderer.render(scene, camera)
  }

  redimensionner(options.largeur, options.hauteur)

  /*
    Compilation de tous les shaders avant le premier affichage, en parallèle quand le navigateur le permet
    (KHR_parallel_shader_compile) : compileAsync rend la main pendant que le pilote compile.
  */
  await renderer.compileAsync(scene, camera)
  await etape()

  // Premier rendu à blanc (canvas encore invisible) : envoi des géométries au GPU
  rendre(0)
  await etape()

  return { rendre, redimensionner, detruire }
}
