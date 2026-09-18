import Header from './components/Header'
import Hero from './components/Hero'
import Sequence from './components/Sequence'
import Lieu from './components/Lieu'
import Carte from './components/Carte'
import Nuits from './components/Nuits'
import Infos from './components/Infos'
import Privatiser from './components/Privatiser'
import Footer from './components/Footer'
import { useReveal } from './hooks/useReveal'
import { useNeon } from './hooks/useNeon'
import { useParallaxe } from './hooks/useParallaxe'
import { useInclinaison } from './hooks/useInclinaison'

export default function App() {
  useReveal()
  useNeon()
  useParallaxe()
  useInclinaison()

  return (
    <>
      <a href="#contenu" className="lien-evitement">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu">
        <Hero />
        <Sequence />
        <Lieu />
        <Carte />
        <Nuits />
        <Infos />
        <Privatiser />
      </main>
      <Footer />
    </>
  )
}
