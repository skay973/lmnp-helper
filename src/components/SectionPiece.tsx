import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ElementRow } from './ElementRow'
import { type ElementEtat, type PieceSection, ELEMENTS_PAR_SECTION } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'

const SECTION_LABELS: Record<string, string> = {
  sols: 'Sols',
  murs: 'Murs',
  plafond: 'Plafond',
  portes: 'Portes',
  fenetres: 'Fenêtres',
  electricite: 'Électricité',
  plomberie: 'Plomberie',
  rangements: 'Rangements',
  equipements: 'Équipements',
  autres: 'Autres',
}

interface SectionPieceProps {
  sectionKey: string
  value: PieceSection
  onChange: (value: PieceSection) => void
}

function getCompletionCount(section: PieceSection, elements: string[]) {
  return elements.filter(el => section[el]?.etat).length
}

export function SectionPiece({ sectionKey, value, onChange }: SectionPieceProps) {
  const [open, setOpen] = useState(false)
  const elements = ELEMENTS_PAR_SECTION[sectionKey] ?? []

  if (elements.length === 0) return null

  const completed = getCompletionCount(value, elements)
  const isComplete = completed === elements.length
  const hasIssues = elements.some(el => value[el]?.etat === 'mauvais')

  const handleElementChange = (elementKey: string, elementValue: ElementEtat) => {
    onChange({ ...value, [elementKey]: elementValue })
  }

  return (
    <div className={cn(
      'rounded-2xl border-2 overflow-hidden',
      isComplete && !hasIssues && 'border-green-300',
      hasIssues && 'border-red-300',
      !isComplete && !hasIssues && 'border-gray-200'
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left touch-manipulation transition-colors',
          open ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900">{SECTION_LABELS[sectionKey]}</span>
          {hasIssues && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Problème signalé
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          )}>
            {completed}/{elements.length}
          </span>
          {open ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="p-3 space-y-3 bg-gray-50/50">
          {elements.map((element) => (
            <ElementRow
              key={element}
              label={element}
              value={value[element] ?? { etat: undefined as unknown as 'bon', photos: [] }}
              onChange={(val) => handleElementChange(element, val)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
