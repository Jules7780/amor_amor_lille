import { ADRESSE, CONTACT, HORAIRES, LIENS_CARTE } from '../data/infos'
import { useStatut } from '../hooks/useStatut'
import { formatHeure } from '../utils/horaires'
import TitreNeon from './TitreNeon'

export default function Infos() {
  const statut = useStatut()

  return (
    <section id="infos" className="section infos">
      <div className="container">
        <header className="section__entete" data-reveal>
          <p className="surtitre">Infos pratiques</p>
          <TitreNeon>Horaires &amp; accès</TitreNeon>
        </header>

        <div className="infos__grille">
          <div className="panneau horaires" data-reveal>
            <div className="horaires__entete">
              <h3 className="panneau__titre">Horaires</h3>
              <p className={`statut statut--petit ${statut.ouvert ? 'statut--ouvert' : ''}`}>
                <span className="statut__point" aria-hidden="true" />
                {statut.libelle}
              </p>
            </div>

            <table className="horaires__table">
              <caption className="sr-only">Horaires d'ouverture d'Amor Amor</caption>
              <tbody>
                {HORAIRES.map((creneau) => {
                  const actif = creneau.jour === statut.jourService
                  return (
                    <tr key={creneau.nom} className={actif ? 'is-actif' : ''} aria-current={actif ? 'date' : undefined}>
                      <th scope="row">{creneau.nom}</th>
                      <td>
                        {'ferme' in creneau ? (
                          <span className="horaires__ferme">Fermé</span>
                        ) : (
                          `${formatHeure(creneau.ouverture)} – ${formatHeure(creneau.fermeture)}`
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="horaires__note">DJ sets du jeudi au samedi.</p>
          </div>

          <div className="panneau acces" data-reveal>
            <div className="acces__carte">
              <iframe
                title="Plan d'accès à Amor Amor, 27 rue Royale à Lille"
                src={LIENS_CARTE.embed}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="acces__repere" aria-hidden="true" />
            </div>
            <div className="acces__corps">
              <h3 className="panneau__titre">Nous trouver</h3>
              <address className="acces__adresse">
                {ADRESSE.rue}
                <br />
                {ADRESSE.cp} {ADRESSE.ville}
                <span>{ADRESSE.quartier}</span>
              </address>
              <ul className="acces__contacts">
                <li>
                  <span>Accès</span>
                  {ADRESSE.metro}
                </li>
                <li>
                  <span>Téléphone</span>
                  <a href={`tel:${CONTACT.telephoneLien}`}>{CONTACT.telephone}</a>
                </li>
              </ul>
              <div className="acces__actions">
                <a href={LIENS_CARTE.itineraire} className="btn btn--rouge" target="_blank" rel="noopener noreferrer">
                  Itinéraire
                </a>
                <a href={LIENS_CARTE.osm} className="btn btn--contour" target="_blank" rel="noopener noreferrer">
                  Voir le plan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
