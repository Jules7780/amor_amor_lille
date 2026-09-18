// Mesure de fluidité à froid (cache vidé), à lancer avec l'outil Playwright « browser_run_code »
// (paramètre filename = scripts/mesure-fluidite.js), serveur de production démarré : npx vite preview --port 5192.
// Pour chaque profil : temps jusqu'à la scène 3D prête, tâches longues au chargement, puis défilement continu
// de toute la page (14 px par image) avec relevé des intervalles entre images et des tâches longues.
async (page) => {
  const adresse = 'http://localhost:5192/'
  const navigateur = page.context().browser()
  const profils = [
    { nom: 'ordinateur', viewport: { width: 1440, height: 900 }, dpr: 1, cpu: 1, mobile: false },
    { nom: 'tablette', viewport: { width: 820, height: 1180 }, dpr: 2, cpu: 2, mobile: true },
    { nom: 'mobile (CPU ÷4)', viewport: { width: 390, height: 844 }, dpr: 3, cpu: 4, mobile: true },
  ]
  const resultats = {}

  for (const profil of profils) {
    const contexte = await navigateur.newContext({
      viewport: profil.viewport,
      deviceScaleFactor: profil.dpr,
      isMobile: profil.mobile,
      hasTouch: profil.mobile,
    })
    const onglet = await contexte.newPage()
    const erreurs = []
    onglet.on('console', (m) => m.type() === 'error' && erreurs.push(m.text().slice(0, 200)))
    onglet.on('pageerror', (e) => erreurs.push(e.message.slice(0, 200)))
    const cdp = await contexte.newCDPSession(onglet)
    await cdp.send('Network.clearBrowserCache')
    if (profil.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profil.cpu })
    await onglet.addInitScript(() => {
      window.__longues = []
      new PerformanceObserver((liste) =>
        liste.getEntries().forEach((e) => window.__longues.push({ debut: Math.round(e.startTime), duree: Math.round(e.duration) })),
      ).observe({ type: 'longtask', buffered: true })
    })

    const debut = Date.now()
    await onglet.goto(adresse, { waitUntil: 'load' })
    await onglet.waitForFunction(() => document.querySelector('.sequence--prete, .sequence--sans-3d'), null, { timeout: 60000 })
    const pret = Date.now() - debut
    await onglet.waitForTimeout(800)
    const chargement = await onglet.evaluate(() => window.__longues.slice())

    const defilement = await onglet.evaluate(async () => {
      window.__longues = []
      const intervalles = []
      let dernier = performance.now()
      const fin = document.documentElement.scrollHeight - innerHeight
      await new Promise((termine) => {
        const pas = (t) => {
          intervalles.push(t - dernier)
          dernier = t
          window.scrollBy({ top: 14, behavior: 'instant' })
          if (window.scrollY >= fin - 2) termine()
          else requestAnimationFrame(pas)
        }
        requestAnimationFrame(pas)
      })
      intervalles.shift()
      const tri = [...intervalles].sort((a, b) => a - b)
      const q = (x) => Math.round(tri[Math.floor(x * (tri.length - 1))] * 10) / 10
      return {
        images: intervalles.length,
        mediane: q(0.5),
        p95: q(0.95),
        p99: q(0.99),
        max: Math.round(tri[tri.length - 1]),
        imagesSup50ms: intervalles.filter((d) => d > 50).length,
        imagesSup100ms: intervalles.filter((d) => d > 100).length,
        tachesLongues: window.__longues.length,
        tacheLongueMax: Math.max(0, ...window.__longues.map((l) => l.duree)),
      }
    })

    const gpu = await onglet.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2')
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info')
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'inconnu'
    })

    resultats[profil.nom] = {
      scene3dPreteMs: pret,
      tachesLonguesChargement: chargement.length,
      tacheLongueMaxChargement: Math.max(0, ...chargement.map((l) => l.duree)),
      ...defilement,
      erreurs,
      gpu,
    }
    await contexte.close()
  }
  return resultats
}
