import { useState, type FormEvent } from 'react'
import { CONTACT, RESEAUX, RESERVATION } from '../data/infos'
import TitreNeon from './TitreNeon'

/**
 * Réservation de table : module Zenchef du bar (lien externe).
 * Demande de privatisation : pas de backend, le formulaire prépare un e-mail à l'adresse événements.
 * Pour passer sur Formspree, renseigner FORMSPREE_ID et changer MODE en 'formspree'.
 */
const MODE = 'email' as 'email' | 'formspree'
const FORMSPREE_ID = '[FORMSPREE_ID]'

const TYPES = ['Anniversaire', 'Afterwork', "Soirée d'entreprise", 'Soirée étudiante (Campus Amor)', 'Autre événement']

type Demande = {
  nom: string
  email: string
  telephone: string
  type: string
  date: string
  personnes: string
  message: string
}

const VIDE: Demande = { nom: '', email: '', telephone: '', type: TYPES[0], date: '', personnes: '', message: '' }

function formaterMessage(d: Demande) {
  const date = d.date
    ? new Date(`${d.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''
  return [
    'Bonjour, je souhaite organiser un événement chez Amor Amor.',
    '',
    `Type d'événement : ${d.type}`,
    `Date souhaitée : ${date}`,
    `Nombre de personnes : ${d.personnes}`,
    '',
    `Nom : ${d.nom}`,
    `E-mail : ${d.email}`,
    ...(d.telephone ? [`Téléphone : ${d.telephone}`] : []),
    ...(d.message ? ['', `Message : ${d.message}`] : []),
  ].join('\n')
}

async function envoyer(d: Demande) {
  if (MODE === 'formspree') {
    const reponse = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(d),
    })
    if (!reponse.ok) throw new Error('Envoi impossible')
    return
  }
  const sujet = `Privatisation Amor Amor : ${d.type}`
  window.location.href = `mailto:${CONTACT.emailEvenements}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(formaterMessage(d))}`
}

export default function Privatiser() {
  const [demande, setDemande] = useState<Demande>(VIDE)
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'ok' | 'erreur'>('repos')
  const aujourdhui = new Date().toISOString().slice(0, 10)

  const maj = (champ: keyof Demande) => (e: { target: { value: string } }) =>
    setDemande((d) => ({ ...d, [champ]: e.target.value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEtat('envoi')
    try {
      await envoyer(demande)
      setEtat('ok')
      setDemande(VIDE)
    } catch {
      setEtat('erreur')
    }
  }

  return (
    <section id="privatiser" className="section privatiser">
      <div className="container privatiser__grille">
        <div className="privatiser__texte" data-reveal>
          <div className="reserver-table">
            <p className="surtitre">Réserver</p>
            <TitreNeon>Une table pour ce soir</TitreNeon>
            <p>
              Les réservations se font en ligne, du mardi au samedi. Au-delà de {RESERVATION.groupes} personnes,
              écrivez-nous sur Instagram.
            </p>
            <ul className="conditions">
              {RESERVATION.conditions.map((condition) => (
                <li key={condition}>{condition}</li>
              ))}
            </ul>
            <div className="reserver-table__actions">
              <a href={RESERVATION.zenchef} className="btn btn--rouge" target="_blank" rel="noopener noreferrer">
                Réserver une table
              </a>
              <a href={RESEAUX.instagram.url} className="btn btn--contour" target="_blank" rel="noopener noreferrer">
                Écrire sur Instagram
              </a>
            </div>
          </div>

          <div className="privatiser__intro">
            <p className="surtitre">Privatiser</p>
            <TitreNeon className="titre--moyen">Votre soirée au Amor</TitreNeon>
            <p>
              Anniversaire, afterwork, soirée d'entreprise ou événement étudiant : le bar, la piste, le DJ booth et la
              terrasse peuvent accueillir votre soirée. Décrivez votre projet, l'équipe du Social Group vous répond.
            </p>
          </div>
        </div>

        <form className="panneau formulaire" onSubmit={onSubmit} data-reveal>
          <h3 className="panneau__titre formulaire__titre">Demande de privatisation</h3>
          <div className="champ champ--large">
            <label htmlFor="type">Type d'événement</label>
            <select id="type" name="type" value={demande.type} onChange={maj('type')}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="champ">
            <label htmlFor="date">Date souhaitée</label>
            <input id="date" name="date" type="date" min={aujourdhui} required value={demande.date} onChange={maj('date')} />
          </div>
          <div className="champ">
            <label htmlFor="personnes">Nombre de personnes</label>
            <input
              id="personnes"
              name="personnes"
              type="number"
              inputMode="numeric"
              min="1"
              required
              value={demande.personnes}
              onChange={maj('personnes')}
            />
          </div>
          <div className="champ champ--large">
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" autoComplete="name" required value={demande.nom} onChange={maj('nom')} />
          </div>
          <div className="champ">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={demande.email} onChange={maj('email')} />
          </div>
          <div className="champ">
            <label htmlFor="telephone">
              Téléphone <span className="champ__optionnel">(facultatif)</span>
            </label>
            <input id="telephone" name="telephone" type="tel" autoComplete="tel" value={demande.telephone} onChange={maj('telephone')} />
          </div>
          <div className="champ champ--large">
            <label htmlFor="message">
              Votre projet <span className="champ__optionnel">(facultatif)</span>
            </label>
            <textarea id="message" name="message" rows={3} value={demande.message} onChange={maj('message')} />
          </div>

          <button type="submit" className="btn btn--rouge btn--plein" disabled={etat === 'envoi'}>
            {etat === 'envoi' ? 'Préparation…' : 'Envoyer ma demande'}
          </button>

          <p className="formulaire__retour" role="status" aria-live="polite">
            {etat === 'ok' &&
              (MODE === 'email'
                ? 'Votre messagerie s’ouvre avec la demande prête à envoyer.'
                : 'Merci, votre demande a bien été envoyée. Nous revenons vers vous rapidement.')}
            {etat === 'erreur' && `La demande n’a pas pu être envoyée. Écrivez-nous à ${CONTACT.emailEvenements}.`}
          </p>
          <p className="formulaire__mention">Vos informations servent uniquement à répondre à votre demande.</p>
        </form>
      </div>
    </section>
  )
}
