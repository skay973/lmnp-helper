import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { EtatSelector } from './EtatSelector'
import { Textarea } from './ui/textarea'
import { type ElementEtat, type Etat } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'

interface ElementRowProps {
  label: string
  value: ElementEtat
  onChange: (value: ElementEtat) => void
}

export function ElementRow({ label, value, onChange }: ElementRowProps) {
  const [showComment, setShowComment] = useState(!!value.commentaire)

  const handleEtatChange = (etat: Etat) => {
    onChange({ ...value, etat })
    if (etat === 'mauvais' && !showComment) setShowComment(true)
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-3 space-y-2 transition-all',
        value.etat === 'mauvais' && 'border-red-200 bg-red-50/30',
        value.etat === 'bon' && 'border-green-200',
        value.etat === 'usage' && 'border-yellow-200',
        !value.etat && 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800 flex-1">{label}</span>
        <button
          type="button"
          onClick={() => setShowComment(!showComment)}
          className={cn(
            'p-1.5 rounded-lg touch-manipulation transition-colors',
            showComment ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <MessageSquare size={16} />
        </button>
      </div>

      <EtatSelector value={value.etat} onChange={handleEtatChange} />

      {showComment && (
        <Textarea
          placeholder="Commentaire (ex: tache sur le mur, rayure...)"
          value={value.commentaire ?? ''}
          onChange={(e) => onChange({ ...value, commentaire: e.target.value })}
          className="text-sm min-h-[60px]"
        />
      )}
    </div>
  )
}
