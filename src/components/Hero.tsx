import { ADRESSE, RESERVATION } from '../data/infos'
import Enseigne from './Enseigne'
import Statut from './Statut'

export default function Hero() {
  return (
    <section id="accueil" className="hero">
      <picture className="hero__fond">
        <source media="(max-width: 640px)" srcSet="/images/salle-principale-mobile.webp" />
        <source media="(max-width: 960px)" srcSet="/images/salle-principale-960.webp" />
        <img
          src="/images/salle-principale.webp"
          alt="Le salon d'Amor Amor : banquette de velours rouge, lustre en cristal, papier peint fleuri et néon Contre Temps Nocturnes"
          width="1500"
          height="750"
          fetchPriority="high"
        />
      </picture>
      <div className="hero__voile" aria-hidden="true" />

      <div className="container hero__contenu">
        <p className="hero__script">Contre temps nocturnes</p>
        <Enseigne titre className="enseigne--hero" />
        <p className="hero__accroche">
          Bar &amp; club dans un ancien hôtel particulier du {ADRESSE.quartier}
        </p>
        <Statut className="hero__statut" />
        <div className="hero__actions">
          <a href={RESERVATION.zenchef} className="btn btn--rouge" target="_blank" rel="noopener noreferrer">
            Réserver une table
          </a>
          <a href="#carte" className="btn btn--contour">
            Voir la carte
          </a>
        </div>
      </div>

      <p className="hero__adresse">
        {ADRESSE.rue} <span aria-hidden="true">·</span> {ADRESSE.ville}
      </p>
    </section>
  )
}
