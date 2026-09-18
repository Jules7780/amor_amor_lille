// Données centralisées du site. Les valeurs entre crochets sont des placeholders à remplacer.
// Sources et points à valider : docs/recherche.md

export const ADRESSE = {
  rue: '27 rue Royale',
  cp: '59800',
  ville: 'Lille',
  quartier: 'Vieux-Lille',
  metro: 'Métro ligne 1, station Rihour, à 600 m environ',
  lat: 50.6394977,
  lon: 3.058069,
}

export const CONTACT = {
  // Numéro de la fiche Google Maps, à confirmer avec les gérants
  telephone: '06 70 33 85 29',
  telephoneLien: '+33670338529',
  // Adresse donnée pour les privatisations et soirées étudiantes (post Instagram du 31/08/2026)
  emailEvenements: 'contact@socialgroup.fr',
}

export const RESERVATION = {
  zenchef: 'https://bookings.zenchef.com/results?rid=362596&pid=1001',
  conditions: ['+21 ans', 'Tenue correcte exigée'],
  groupes: 12,
}

export const RESEAUX = {
  instagram: { label: '@amoramor_lille', url: 'https://www.instagram.com/amoramor_lille/' },
  facebook: { label: 'Amor Amor', url: 'https://www.facebook.com/p/Amor-Amor-100093327722334/' },
}

export const LIENS_CARTE = {
  itineraire: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `Amor Amor, ${ADRESSE.rue}, ${ADRESSE.cp} ${ADRESSE.ville}`,
  )}`,
  osm: `https://www.openstreetmap.org/?mlat=${ADRESSE.lat}&mlon=${ADRESSE.lon}#map=18/${ADRESSE.lat}/${ADRESSE.lon}`,
  embed: `https://www.openstreetmap.org/export/embed.html?bbox=3.0551%2C50.6383%2C3.0611%2C50.6407&layer=mapnik&marker=${ADRESSE.lat}%2C${ADRESSE.lon}`,
}

/**
 * Horaires en minutes depuis minuit. Une fermeture après minuit dépasse 1440
 * (ex. 2h du matin = 26 * 60). `jour` suit Date.getDay() : 0 = dimanche.
 * Source : Google Maps (septembre 2026). Un post Instagram annonce 18h : à confirmer.
 */
export type Creneau = { jour: number; nom: string; ouverture: number; fermeture: number } | { jour: number; nom: string; ferme: true }

const h = (heures: number) => heures * 60

export const HORAIRES: Creneau[] = [
  { jour: 1, nom: 'Lundi', ferme: true },
  { jour: 2, nom: 'Mardi', ouverture: h(17), fermeture: h(25) },
  { jour: 3, nom: 'Mercredi', ouverture: h(17), fermeture: h(25) },
  { jour: 4, nom: 'Jeudi', ouverture: h(17), fermeture: h(26) },
  { jour: 5, nom: 'Vendredi', ouverture: h(17), fermeture: h(26) },
  { jour: 6, nom: 'Samedi', ouverture: h(17), fermeture: h(26) },
  { jour: 0, nom: 'Dimanche', ferme: true },
]

export type Article = { nom: string; detail?: string; prix: string }

/** Cocktails signatures de la mixologue Victoire Spanneut (presse, juin 2023) : présence à la carte à confirmer. */
export const SIGNATURES: Array<Article & { description: string }> = [
  {
    nom: 'Amor À Mort',
    description: "Servi rouge sous une liqueur de mûre, il s'assombrit à mesure qu'on le mélange.",
    prix: '[PRIX]',
  },
  {
    nom: 'Amor Amor',
    description: "Gin infusé à la rose et à l'hibiscus : il change de couleur quand on le remue.",
    prix: '[PRIX]',
  },
]

export type Rubrique = { titre: string; articles: Article[] }

// Carte relevée dans la presse (2023) et sur Instagram (2026) : liste et prix à compléter avec les gérants
export const CARTE: Rubrique[] = [
  {
    titre: 'Au bar',
    articles: [
      { nom: 'Spritz limoncello', prix: '[PRIX]' },
      { nom: '[AUTRES COCKTAILS DE LA CARTE]', prix: '[PRIX]' },
      { nom: 'Cocktails sans alcool', prix: '[PRIX]' },
      { nom: 'Champagne', detail: 'Au verre et à la bouteille', prix: '[PRIX]' },
    ],
  },
  {
    titre: 'Bières et vins',
    articles: [
      { nom: 'La Loca', detail: 'Avec la brasserie Brique House', prix: '[PRIX]' },
      { nom: 'Cadette', detail: 'Neipa', prix: '[PRIX]' },
      { nom: 'Pin Pon', detail: 'Brasserie Tandem', prix: '[PRIX]' },
      { nom: 'Vins', detail: 'Au verre et à la bouteille', prix: '[PRIX]' },
    ],
  },
  {
    titre: 'À partager',
    articles: [
      { nom: '[PIZZAS DE LA CARTE]', detail: 'Nouvelle carte de pizzas depuis août 2026', prix: '[PRIX]' },
      { nom: 'Planches et petites assiettes', prix: '[PRIX]' },
    ],
  },
]

/** Programmation DJ (post Instagram du 01/09/2026). Seules les dates à venir sont affichées. */
export const PROGRAMMATION: Array<{ date: string; artiste: string }> = [
  { date: '2026-09-03', artiste: 'BHD' },
  { date: '2026-09-04', artiste: 'AD Night' },
  { date: '2026-09-05', artiste: 'Gonz, Arno & Andel' },
  { date: '2026-09-10', artiste: 'Skorpio' },
  { date: '2026-09-11', artiste: 'Romain DLG' },
  { date: '2026-09-12', artiste: 'Moow' },
  { date: '2026-09-17', artiste: 'Simba Leone' },
  { date: '2026-09-18', artiste: 'Johad' },
  { date: '2026-09-19', artiste: 'Johad' },
  { date: '2026-09-24', artiste: 'Adrien V' },
  { date: '2026-09-25', artiste: 'Malice Group' },
  { date: '2026-09-26', artiste: 'Johad' },
]
