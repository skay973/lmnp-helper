import { cn } from '@/lib/utils'
import { type Etat, ETAT_LABELS, ETAT_COLORS } from '@/types/etatDesLieux'

interface EtatSelectorProps {
  value?: Etat
  onChange: (etat: Etat) => void
  showNA?: boolean
}

const etats: Etat[] = ['bon', 'usage', 'mauvais', 'non_applicable']

export function EtatSelector({ value, onChange, showNA = true }: EtatSelectorProps) {
  const options = showNA ? etats : etats.filter(e => e !== 'non_applicable')

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((etat) => (
        <button
          key={etat}
          type="button"
          onClick={() => onChange(etat)}
          className={cn(
            'flex-1 min-w-0 rounded-lg border-2 py-2 px-1 text-xs font-semibold transition-all touch-manipulation active:scale-95',
            value === etat
              ? ETAT_COLORS[etat] + ' border-current shadow-sm scale-[1.02]'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
          )}
        >
          {ETAT_LABELS[etat]}
        </button>
      ))}
    </div>
  )
}
