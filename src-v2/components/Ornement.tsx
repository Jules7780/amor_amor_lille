import Soleil from './Soleil'

/** Filet laiton avec un petit soleil au centre, comme une moulure. */
export default function Ornement({ className = '' }: { className?: string }) {
  return (
    <div className={`ornement ${className}`} aria-hidden="true">
      <span className="ornement__filet" />
      <Soleil className="ornement__soleil" />
      <span className="ornement__filet" />
    </div>
  )
}
