import { RESEAUX } from '../data/infos'
import { formatDateCourte, prochainesDates } from '../utils/horaires'

const PHOTOS = [
  {
    src: '/images/foule.webp',
    mobile: '/images/foule-720.webp',
    alt: 'Soirée sous les moulures du salon, les bras levés dans la lumière rouge',
  },
  {
    src: '/images/piste.webp',
    mobile: '/images/piste-720.webp',
    alt: 'Piste de danse pendant un DJ set, lumières rouges et bleues',
  },
  {
    src: '/images/neon-nocturnes.webp',
    mobile: '/images/neon-nocturnes-720.webp',
    alt: 'Une cliente danse sous le néon Nocturnes',
  },
]

export default function Nuits() {
  const dates = prochainesDates(4)

  return (
    <section id="nuits" className="section nuits">
      <div className="container">
        <div className="nuits__grille">
          <div className="nuits__texte" data-reveal>
            <p className="surtitre">Contre temps nocturnes</p>
            <h2 className="titre">Bar à l'apéro, club à la nuit tombée</h2>
            <p>
              Le soir, les lumières baissent, la boule à facettes s'allume et les DJs se relaient aux platines du jeudi
              au samedi. La programmation du mois est annoncée sur Instagram.
            </p>

            <div className="agenda">
              <h3 className="agenda__titre">Prochains DJ sets</h3>
              {dates.length > 0 ? (
                <ol className="agenda__liste">
                  {dates.map((d) => {
                    const { jour, numero, mois } = formatDateCourte(d.date)
                    return (
                      <li key={d.date} className="agenda__date">
                        <time dateTime={d.date} className="agenda__quand">
                          <span className="agenda__jour">{jour}</span>
                          <span className="agenda__numero">{numero}</span>
                          <span className="agenda__mois">{mois}</span>
                        </time>
                        <span className="agenda__artiste">{d.artiste}</span>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className="agenda__vide">La programmation à venir est publiée chaque mois sur Instagram.</p>
              )}
              <a href={RESEAUX.instagram.url} className="lien-fleche" target="_blank" rel="noopener noreferrer">
                Toute la programmation sur {RESEAUX.instagram.label}
              </a>
            </div>
          </div>

          <div className="nuits__mosaique" data-reveal>
            {PHOTOS.map((photo, i) => (
              <figure key={photo.src} className={`cadre nuits__photo nuits__photo--${i + 1}`}>
                <picture>
                  <source media="(max-width: 640px)" srcSet={photo.mobile} />
                  <img src={photo.src} alt={photo.alt} width="1200" height="1600" loading="lazy" />
                </picture>
              </figure>
            ))}
          </div>
        </div>

        <div className="terrasse" data-reveal>
          <figure className="cadre terrasse__photo">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/facade-jour-720.webp" />
              <img
                src="/images/facade-jour.webp"
                alt="La façade rose et crème du 27 rue Royale, ses néons AMOR et la terrasse sur le trottoir"
                width="1200"
                height="1600"
                loading="lazy"
              />
            </picture>
          </figure>
          <div className="terrasse__texte">
            <p className="surtitre">Dehors comme dedans</p>
            <h2 className="titre titre--moyen">La terrasse de la rue Royale</h2>
            <p>
              Aux beaux jours, les tables sortent sur le trottoir : un cocktail en fin de journée, une pizza à partager,
              avant que la soirée ne se poursuive à l'intérieur.
            </p>
          </div>
          <figure className="cadre terrasse__photo terrasse__photo--seconde">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/terrasse-table-720.webp" />
              <img
                src="/images/terrasse-table.webp"
                alt="Tables de bistrot dorées en terrasse, avec pizzas, bières et cocktails"
                width="1200"
                height="1600"
                loading="lazy"
              />
            </picture>
          </figure>
        </div>
      </div>
    </section>
  )
}
