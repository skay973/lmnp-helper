import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { type ElementEtat, type Etat, ETAT_LABELS, ETAT_COLORS } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'

interface ElementsListProps {
  elements: Record<string, ElementEtat>
  onChange: (elements: Record<string, ElementEtat>) => void
}

export function ElementsList({ elements, onChange }: ElementsListProps) {
  const [openComment, setOpenComment] = useState<string | null>(null)

  const setEtat = (key: string, etat: Etat) => {
    const updated = { ...elements, [key]: { ...elements[key], etat } }
    onChange(updated)
    if (etat === 'mauvais') setOpenComment(key)
  }

  const setCommentaire = (key: string, commentaire: string) => {
    onChange({ ...elements, [key]: { ...elements[key], commentaire } })
  }

  return (
    <div className="space-y-2">
      {Object.entries(elements).map(([key, val]) => (
        <div
          key={key}
          className={cn(
            'rounded-xl border-2 bg-white overflow-hidden transition-colors',
            val.etat === 'mauvais' ? 'border-red-300' :
            val.etat === 'bon' ? 'border-green-300' :
            val.etat === 'usage' ? 'border-yellow-300' :
            'border-gray-200'
          )}
        >
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-800">{key}</span>
              <button
                type="button"
                onClick={() => setOpenComment(openComment === key ? null : key)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors shrink-0 touch-manipulation',
                  openComment === key || val.commentaire
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-300 hover:text-gray-500'
                )}
              >
                <MessageSquare size={15} />
              </button>
            </div>

            {/* Boutons état — 4 en ligne, grands pour le touch */}
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(ETAT_LABELS) as Etat[]).map((etat) => (
                <button
                  key={etat}
                  type="button"
                  onClick={() => setEtat(key, etat)}
                  className={cn(
                    'rounded-lg border-2 py-2 text-xs font-semibold transition-all touch-manipulation active:scale-95',
                    val.etat === etat
                      ? ETAT_COLORS[etat] + ' shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  )}
                >
                  {ETAT_LABELS[etat]}
                </button>
              ))}
            </div>
          </div>

          {(openComment === key || val.commentaire) && (
            <div className="px-3 pb-3">
              <Textarea
                placeholder="Précisions..."
                value={val.commentaire ?? ''}
                onChange={e => setCommentaire(key, e.target.value)}
                className="text-sm min-h-[56px] bg-gray-50"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
