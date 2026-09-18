import { HORAIRES, PROGRAMMATION, type Creneau } from '../data/infos'

const JOURS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Jour (0 = dimanche), minutes écoulées et date (AAAA-MM-JJ), à l'heure de Lille. */
export function maintenantALille(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    jour: JOURS_EN.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    iso: `${get('year')}-${get('month')}-${get('day')}`,
  }
}

export function formatHeure(minutes: number) {
  const heures = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${heures}h${mins ? String(mins).padStart(2, '0') : ''}`
}

const creneauDu = (jour: number) => HORAIRES.find((c) => c.jour === jour) as Creneau

export type Statut = { ouvert: boolean; libelle: string; jourService: number }

export function statutActuel(date = new Date()): Statut {
  const { jour, minutes } = maintenantALille(date)

  // Soirée de la veille qui se prolonge après minuit
  const veille = creneauDu((jour + 6) % 7)
  if (!('ferme' in veille) && veille.fermeture > 1440 && minutes < veille.fermeture - 1440) {
    return { ouvert: true, libelle: `Ouvert jusqu'à ${formatHeure(veille.fermeture)}`, jourService: veille.jour }
  }

  const aujourdhui = creneauDu(jour)
  if (!('ferme' in aujourdhui)) {
    if (minutes >= aujourdhui.ouverture && minutes < aujourdhui.fermeture) {
      return { ouvert: true, libelle: `Ouvert jusqu'à ${formatHeure(aujourdhui.fermeture)}`, jourService: jour }
    }
    if (minutes < aujourdhui.ouverture) {
      return { ouvert: false, libelle: `Fermé, ouvre ce soir à ${formatHeure(aujourdhui.ouverture)}`, jourService: jour }
    }
  }

  for (let i = 1; i <= 7; i++) {
    const suivant = creneauDu((jour + i) % 7)
    if (!('ferme' in suivant)) {
      const quand = i === 1 ? 'demain' : suivant.nom.toLowerCase()
      return { ouvert: false, libelle: `Fermé, ouvre ${quand} à ${formatHeure(suivant.ouverture)}`, jourService: jour }
    }
  }
  return { ouvert: false, libelle: 'Fermé', jourService: jour }
}

/** Dates DJ à venir (la soirée du jour reste affichée jusqu'à la fermeture). */
export function prochainesDates(nombre = 4, date = new Date()) {
  const { iso, minutes } = maintenantALille(date)
  // Avant 6h, la soirée de la veille est encore en cours
  const veille = new Date(`${iso}T12:00:00`)
  veille.setDate(veille.getDate() - 1)
  const reference = minutes < 360 ? veille.toISOString().slice(0, 10) : iso
  return PROGRAMMATION.filter((d) => d.date >= reference).slice(0, nombre)
}

export function formatDateCourte(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  return {
    jour: date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
    numero: date.toLocaleDateString('fr-FR', { day: '2-digit' }),
    mois: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
  }
}
