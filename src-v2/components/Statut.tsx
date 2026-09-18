import { useStatut } from '../hooks/useStatut'

/** Pastille « ouvert / fermé » calculée en direct à l'heure de Lille. */
export default function Statut({ className = '' }: { className?: string }) {
  const statut = useStatut()
  return (
    <p className={`statut ${statut.ouvert ? 'statut--ouvert' : ''} ${className}`}>
      <span className="statut__point" aria-hidden="true" />
      {statut.libelle}
    </p>
  )
}
