import Ornement from './Ornement'

const DETAILS = [
  { valeur: '7', libelle: 'lustres en cristal venus des Pays-Bas' },
  { valeur: '3e', libelle: 'bar du Social Group, après Le Cartel et le Madre' },
  { valeur: '100', libelle: 'personnes dans les salons' },
  { valeur: '2023', libelle: 'ouverture, un vendredi de juin' },
]

export default function Lieu() {
  return (
    <section id="le-lieu" className="section lieu">
      <div className="container">
        <div className="lieu__grille">
          <div className="lieu__texte" data-reveal>
            <p className="surtitre">Depuis juin 2023</p>
            <h2 className="titre">Un hôtel particulier rue Royale</h2>
            <p>
              Derrière la façade du 27 rue Royale, un ancien hôtel particulier a gardé ses moulures, ses cheminées de
              marbre et ses hauts plafonds. Edward Duquesne et Gilles Perthame, déjà à l'origine du Cartel et du Madre,
              y ont ouvert Amor Amor le 9 juin 2023.
            </p>
            <p>
              Velours rouge, papier peint fleuri, lustres en cristal et boule à facettes : le décor a été pensé comme un
              salon privé. On y vient pour un premier verre, la musique monte avec la nuit.
            </p>
            <Ornement className="lieu__ornement" />
          </div>

          <div className="lieu__visuels" data-reveal>
            <figure className="cadre cadre--arche lieu__photo-principale">
              <img
                src="/images/salon-lustres.webp"
                alt="Le salon du fond : lustres en cristal, murs rouges moulurés et néon AMOR AMOR au-dessus de la cheminée"
                width="480"
                height="640"
                loading="lazy"
              />
            </figure>
            <figure className="cadre lieu__photo-neon">
              <picture>
                <source media="(max-width: 640px)" srcSet="/images/neon-amor-640.webp" />
                <img
                  src="/images/neon-amor.webp"
                  alt="Le néon AMOR AMOR, dont la seconde ligne se lit à l'envers, encadré de moulures sculptées"
                  width="1200"
                  height="1043"
                  loading="lazy"
                />
              </picture>
            </figure>
          </div>
        </div>

        <ul className="details" data-reveal>
          {DETAILS.map((d) => (
            <li key={d.libelle} className="details__item">
              <span className="details__valeur">{d.valeur}</span>
              <span className="details__libelle">{d.libelle}</span>
            </li>
          ))}
        </ul>

        <figure className="fondateurs" data-reveal>
          <div className="cadre fondateurs__photo">
            <picture>
              <source media="(max-width: 640px)" srcSet="/images/fondateurs-miroir-800.webp" />
              <img
                src="/images/fondateurs-miroir.webp"
                alt="Edward Duquesne et Gilles Perthame, verre à la main, devant le grand miroir doré et la cheminée de marbre"
                width="1400"
                height="1088"
                loading="lazy"
              />
            </picture>
          </div>
          <figcaption className="fondateurs__legende">
            <p className="surtitre">Les fondateurs</p>
            <p className="fondateurs__noms">Edward Duquesne &amp; Gilles Perthame</p>
            <p>
              Après Le Cartel et le Madre, Amor Amor est le troisième bar de leur Social Group dans le Vieux-Lille, avec
              un parti pris différent : le velours, le marbre et les lustres.
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
