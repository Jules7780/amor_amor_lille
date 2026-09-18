import { CARTE, SIGNATURES } from '../data/infos'
import Soleil from './Soleil'
import TitreNeon from './TitreNeon'
import Lustre from './Lustre'

export default function Carte() {
  return (
    <section id="carte" className="section carte">
      <div className="decor decor--carte" data-parallaxe="" data-vitesse="-0.3">
        <Lustre />
      </div>
      <div className="decor decor--carte-loin" data-parallaxe="" data-vitesse="-0.12">
        <Lustre />
      </div>
      <div className="container">
        <header className="section__entete section__entete--centre" data-reveal>
          <p className="surtitre">Au bar, en terrasse</p>
          <TitreNeon>La carte</TitreNeon>
          <p className="section__intro">
            Des cocktails signatures créés par la mixologue Victoire Spanneut, des bières locales, du champagne et, depuis
            cet été, une carte de pizzas à partager.
          </p>
        </header>

        <div className="signatures" data-reveal>
          <figure data-inclinaison="" className="cadre cadre--arche signatures__photo">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/cocktails-tapis-720.webp" />
              <img
                src="/images/cocktails-tapis.webp"
                alt="Cocktails d'Amor Amor posés sur une table de marbre, dont une coupe rose marquée du monogramme AA"
                width="1200"
                height="1600"
                loading="lazy"
              />
            </picture>
          </figure>

          <div className="signatures__liste">
            <p className="surtitre">Signatures de la maison</p>
            {SIGNATURES.map((cocktail) => (
              <article key={cocktail.nom} className="signature" data-inclinaison="souris">
                <div className="signature__entete">
                  <Soleil className="signature__soleil" />
                  <h3 className="signature__nom">{cocktail.nom}</h3>
                  <span className="signature__prix">{cocktail.prix}</span>
                </div>
                <p className="signature__description">{cocktail.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="menu" data-reveal>
          {CARTE.map((rubrique) => (
            <div key={rubrique.titre} className="menu__rubrique">
              <h3 className="menu__titre">{rubrique.titre}</h3>
              <ul className="menu__liste">
                {rubrique.articles.map((article) => (
                  <li key={article.nom} className="menu__article">
                    <span className="menu__ligne">
                      <span className="menu__nom">{article.nom}</span>
                      <span className="menu__points" aria-hidden="true" />
                      <span className="menu__prix">{article.prix}</span>
                    </span>
                    {article.detail && <span className="menu__detail">{article.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="carte__photos" data-reveal>
          <figure data-inclinaison="" className="cadre">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/pizza-partage-720.webp" />
              <img
                src="/images/pizza-partage.webp"
                alt="Pizza au pepperoni partagée sur une table de marbre, avec un cocktail aux agrumes"
                width="1200"
                height="1600"
                loading="lazy"
              />
            </picture>
          </figure>
          <figure data-inclinaison="" className="cadre">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/cocktail-agrume-720.webp" />
              <img
                src="/images/cocktail-agrume.webp"
                alt="Cocktail doré sur glace pilée avec une rondelle d'orange séchée, posé sur un tapis ancien"
                width="1200"
                height="1600"
                loading="lazy"
              />
            </picture>
          </figure>
          <figure data-inclinaison="" className="cadre">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/cocktail-terrasse-720.webp" />
              <img
                src="/images/cocktail-terrasse.webp"
                alt="Un client tient un cocktail rouge dans une coupe, en terrasse, à côté d'une pizza"
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
