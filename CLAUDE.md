# Amor Amor Lille, démo de site (`demo-amor-amor-lille`)

Démo proactive en deux versions pour Amor Amor, bar et club de nuit au 27 rue Royale à Lille, dans un ancien hôtel particulier (prospect, groupe Social Group comme FADA). Terminée le 2026-09-18 et en ligne.

## Contexte AD IT Solutions
- Prospect : Amor Amor (slug `amor-amor-lille`). Fiche et fichiers : Drive ADIT Operations, `02-prospects/amor-amor-lille/` : fiche `CLAUDE.md`, photos Instagram dans `02-recu-du-client/instagram/`. Recherche sourcée : `docs/recherche.md` du dépôt.
- Drive ADIT Operations : `G:\Shared drives\ADIT Operations` chez Jules (Windows), `~/Library/CloudStorage/GoogleDrive-<adresse>/Shared drives/ADIT Operations` chez Achille (Mac).
- Clone local : `C:\dev\demo-amor-amor-lille` chez Jules, `~/dev/demo-amor-amor-lille` chez Achille.
- Méthode : skill `adit:demo-prospect` (démo en deux versions) et `adit:site-vitrine`.

## Stack et commandes
- Vite 8, React 19, TypeScript 5.9, GSAP 3 (`@gsap/react`), Three.js 0.186, polices Fontsource (Italiana, Pinyon Script, Jost). Node 22.12.0 (`.node-version`).
- `npm ci`, `npm run dev` (port 5191), `npm run build` (tsc puis vite, sortie `dist/` : `/`, `/v1/`, `/v2/`), `npx vite preview --port 5192`.
- `python scripts/images.py` (Pillow) : convertit les photos de `sources/` en WebP dans `public/images/`.
- `scripts/mesure-fluidite.js` : mesure de fluidité à froid avec l'outil Playwright `browser_run_code`, sur le build servi en preview (mode d'emploi en tête du fichier).

## Branches et déploiement
- `demo-versions` (par défaut) : page de démo qui bascule entre v1 et v2.
- `main` : version 1 classique seule (direction « Salon rouge »). `immersive` : version 2 seule.
- Render : service statique `amor-amor-lille`, branche `demo-versions`, build `npm ci && npm run build`, publié `dist`, https://amor-amor-lille.onrender.com (répond 200 le 2026-10-26).
- ATTENTION : chaque commit poussé sur `demo-versions` est mis en ligne automatiquement.
- `render.yaml` nomme le service `amor-amor-demo`, alors que le service existant s'appelle `amor-amor-lille` (créé à la main). Appliquer le Blueprint risque de créer un second service.
- Render affiche déjà le dépôt `ADIT-SOLUTIONS/demo-amor-amor-lille` ; la fiche et la carte des dépôts le disent encore relié à l'ancien dépôt [À CONFIRMER].

## Structure du code
- `index.html` et `selecteur/` : page de démo. Deux cadres superposés, néon AMOR AMOR dont les huit tubes s'allument avec le chargement, pastille en bas à gauche (« 1 Classique, 2 Immersive »), `/#2` ouvre la v2.
- `v1/index.html` pour `src/` (classique) ; `v2/index.html` pour `src-v2/` (immersive, styles en plus dans `src-v2/immersif.css`).
- Données : `src/data/infos.ts` (adresse, contact, réservation Zenchef, horaires, carte, programmation des soirées). `src-v2/data/infos.ts` en est une copie identique : toute correction se fait dans les deux fichiers.
- Séquence 3D « L'enseigne s'allume » : `src-v2/components/Sequence.tsx` et `src-v2/components/enseigne/`. Autour : `Lustre.tsx`, `TitreNeon.tsx`.
- Photos : `public/images/` (WebP communs aux deux versions), `sources/` (7 photos fournies), `sources/instagram/*.jpg` non versionnées (copie dans le Drive).
- Documentation : `docs/demo-versions.md` (fonctionnement, performance), `docs/recherche.md` (faits vérifiés, direction artistique).

## Décisions et points d'attention
- Direction artistique retenue : A « Salon rouge ». Couleurs bordeaux `#1c0608`, rouge enseigne `#c3141d`, rose néon `#ff8a96`, laiton `#c8a064`, crème `#f3e3d3`. Italiana pour les titres, Pinyon Script pour les accents, Jost pour le texte.
- Séquence 3D : le néon AMOR AMOR s'allume lettre par lettre puis fait un demi-tour, il se lit toujours AMOR.
- Logo redessiné en SVG d'après le néon : interprétation à valider, demander le fichier officiel.
- Fluidité (leçons de Maï-Taï) : pas de PMREM, scène construite par étapes puis `compileAsync`, tous les tubes en un appel de dessin, résolution plafonnée à 1,5 et adaptative, image fixe sans WebGL ou si « réduire les animations ».
- Placeholders : `[PRIX]` (seuls des prix de 2023 existent), `[DOMAINE]`, `[FORMSPREE_ID]`, cocktails et pizzas de la carte.
- À valider : heure d'ouverture (17h ou 18h), nom du cocktail signature, téléphone (le même que celui affiché pour FADA).
- Pages en `noindex` et en-tête `X-Robots-Tag` : à retirer pour le site définitif. Pas de réécriture de toutes les adresses vers `/index.html`.
- Dépôt public, droits sur le logo et les photos à régulariser : ne pas présenter la démo comme une réalisation.

## Règles AD IT Solutions
- Diagnostic avant action : répondre aux questions sans modifier le code, attendre le feu vert avant d'implémenter.
- Textes : jamais de tiret cadratin « — », pas de tournures « trop IA », aucune donnée inventée (placeholder `[À COMPLÉTER : …]`).
- Aucun secret dans le dépôt.
- Fin de travail : résumé court (fait, placeholders restants, à vérifier) et mise à jour de ce fichier si une décision change.
