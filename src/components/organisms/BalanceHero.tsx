import { Amount } from '../atoms/Amount.tsx'
import { Label } from '../atoms/Label.tsx'

export function BalanceHero({ balance, note }: { balance?: number; note: string | null }) {
  const tone = balance !== undefined && balance < 0 ? 'expense' : 'neutral'

  return (
    <section className="card hero" aria-label="Saldo">
      <div className="hero-main">
        <div className="hero-kicker">
          <Label>Saldo actual</Label>
          <span className="pip" aria-hidden="true" />
          <Label>Pesos colombianos</Label>
        </div>
        <Amount value={balance} size="display" tone={tone} />
        {note ? <p className="hero-note">{note}</p> : null}
      </div>
      <div className="hero-aside">
        <Label>Divisa</Label>
        <strong>COP</strong>
      </div>
    </section>
  )
}
