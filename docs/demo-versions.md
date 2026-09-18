# Démo des maquettes (branche `demo-versions`)

Un seul déploiement pour présenter les deux versions du site aux gérants d'Amor Amor.

| Adresse | Rôle | Code |
|---|---|---|
| `/` | Page de démo : écran de chargement, les deux versions, pastille de choix | `index.html`, `selecteur/` |
| `/v1/` | Version 1, Classique : identique à `main` | `src/` |
| `/v2/` | Version 2, Immersive : identique à la branche `immersive` | `src-v2/` |

Les photos (`public/images/`) et le favicon sont communs aux deux versions.

## Version immersive

- **Séquence phare** « L'enseigne s'allume » (`src-v2/components/Sequence.tsx` et `src-v2/components/enseigne/`) :
  le néon AMOR AMOR en tubes 3D (Three.js), dans son cadre mouluré au-dessus de la cheminée, entre deux lustres.
  Au défilement, les tubes grésillent puis s'allument lettre par lettre, puis l'enseigne se décolle du mur et fait
  un demi-tour : elle se lit toujours AMOR.
- **Autour** : titres qui s'allument comme un néon, lustres dessinés en parallaxe, relief des photos (souris sur
  ordinateur, gyroscope sur mobile), profondeur de l'accueil, éclats de boule à facettes dans « Les nuits ».

### Performance (leçons reprises du projet Maï-Taï)

- Aucun calcul d'environnement (PMREM) : reflets et éclairage sont calculés directement dans des shaders légers.
- Scène construite par étapes, en rendant la main au navigateur, puis `compileAsync` : shaders compilés en parallèle
  (KHR_parallel_shader_compile) avant le premier affichage ; premier rendu à blanc canvas caché.
- Tous les tubes en un seul appel de dessin, halo en particules additives, pampilles des lustres instanciées.
- Résolution plafonnée à 1,5 et baissée par paliers si les images s'espacent (qualité adaptative).
- Perte du contexte WebGL : photo du vrai néon affichée, puis reconstruction à la restauration.
- Image fixe (photo du néon) si « réduire les animations » est activé, sans WebGL, ou sur un écran de moins de 500 px de haut.
- Rendu uniquement quand la scène est à l'écran, et jamais quand la version est cachée derrière l'autre (classe `cadre-masque`).
- Mesure à froid : `scripts/mesure-fluidite.js` (voir l'en-tête du fichier).

## Fonctionnement de la démo

- `index.html` + `selecteur/selecteur.ts` : ouvre `/v1/` et `/v2/` dans deux cadres plein écran superposés,
  affiche le néon AMOR AMOR dont les huit tubes s'allument avec le chargement, puis la version 1 (ou la 2 avec `/#2`).
- `selecteur/cadre.ts`, chargé par chaque version : force le chargement immédiat des images et du plan,
  attend les polices et l'enseigne 3D, envoie sa progression à la démo, et obéit à ses commandes
  (retour en haut, version cachée ou visible). Ouverte seule, une version fonctionne normalement.
- Changer de version remonte la version choisie en haut de page puis l'affiche : rien n'est rechargé.
- La pastille (bas à gauche, 30 % d'opacité) ouvre le panneau « 1 Classique, 2 Immersive » ; elle se masque
  pendant le chargement et quand le menu mobile est ouvert.

## Mise en ligne sur Render

- Fichier `render.yaml` (Blueprint) : site statique, branche `demo-versions`, build `npm ci && npm run build`,
  dossier publié `dist`, Node 22.12 (Vite 8 demande Node 20.19 ou plus).
- Ne pas ajouter de règle de réécriture de toutes les adresses vers `/index.html` : `/v1/` et `/v2/` sont de vraies pages.
- Démo non référencée : balise `noindex, nofollow` sur les trois pages et en-tête `X-Robots-Tag` dans `render.yaml`.
  Ces deux protections sont à retirer pour le site définitif.
