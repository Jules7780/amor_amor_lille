import { ADRESSE, CONTACT, RESEAUX, RESERVATION } from '../data/infos'
import Enseigne from './Enseigne'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grille">
          <div className="footer__marque">
            <Enseigne className="enseigne--footer" />
            <p className="footer__script">Contre temps nocturnes</p>
            <p>Bar &amp; club dans le Vieux-Lille, par le Social Group.</p>
          </div>

          <div>
            <h2 className="footer__titre">Adresse</h2>
            <p>
              {ADRESSE.rue}
              <br />
              {ADRESSE.cp} {ADRESSE.ville}
            </p>
            <p className="footer__contact">
              <a href={`tel:${CONTACT.telephoneLien}`}>{CONTACT.telephone}</a>
            </p>
          </div>

          <div>
            <h2 className="footer__titre">Navigation</h2>
            <ul className="footer__liens">
              <li><a href="#le-lieu">Le lieu</a></li>
              <li><a href="#carte">La carte</a></li>
              <li><a href="#nuits">Les nuits</a></li>
              <li><a href="#infos">Horaires &amp; accès</a></li>
              <li><a href="#privatiser">Privatiser</a></li>
            </ul>
          </div>

          <div>
            <h2 className="footer__titre">Suivre &amp; réserver</h2>
            <ul className="footer__liens">
              <li>
                <a href={RESEAUX.instagram.url} target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
              <li>
                <a href={RESEAUX.facebook.url} target="_blank" rel="noopener noreferrer">Facebook</a>
              </li>
              <li>
                <a href={RESERVATION.zenchef} target="_blank" rel="noopener noreferrer">Réserver une table</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="footer__moderation">
          L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
        </p>

        <div className="footer__bas">
          <p>© {new Date().getFullYear()} Amor Amor, Lille</p>
          <p>
            Site réalisé par{' '}
            <a href="https://aditsolutions.be/" target="_blank" rel="noopener noreferrer">
              AD IT Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
