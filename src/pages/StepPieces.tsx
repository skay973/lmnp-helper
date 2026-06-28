import { Plus, Trash2, ChevronRight, CheckCircle2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Piece, type TypePiece, TYPE_PIECE_LABELS, createPiece, getPieceCompletion } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  pieces: Piece[]
  onChange: (pieces: Piece[]) => void
  onSavePieces: (pieces: Piece[]) => Promise<void>
  onNext: () => void
  onBack: () => void
  onEditPiece: (index: number) => void
}

const TYPES_COMMUNS: TypePiece[] = ['entree', 'wc', 'salon', 'cuisine', 'balcon', 'chambre', 'salle_de_bain']
const TYPES_AUTRES: TypePiece[] = ['salle_a_manger', 'bureau', 'couloir', 'cave', 'garage', 'autre']

export function StepPieces({ pieces, onChange, onSavePieces, onNext, onBack, onEditPiece }: Props) {
  const [showModal, setShowModal] = useState(false)

  const addPiece = (type: TypePiece) => {
    const count = pieces.filter(p => p.type === type).length
    const nom = count === 0 ? TYPE_PIECE_LABELS[type] : `${TYPE_PIECE_LABELS[type]} ${count + 1}`
    const next = [...pieces, createPiece(type, nom)]
    onChange(next)
    onSavePieces(next)
    setShowModal(false)
  }

  const removePiece = (index: number) => {
    const next = pieces.filter((_, i) => i !== index)
    onChange(next)
    onSavePieces(next)
  }

  const totalCompleted = pieces.filter(p => {
    const { completed, total } = getPieceCompletion(p)
    return completed === total && total > 0
  }).length

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
        <span className="text-blue-600"><LayoutGrid size={18} /></span>
        <h3 className="font-semibold text-gray-900">Pièces</h3>
        <span className="ml-auto text-xs font-medium text-gray-500">{totalCompleted}/{pieces.length} complètes</span>
      </div>

      <div className="space-y-2">
        {pieces.map((piece, index) => {
          const { completed, total } = getPieceCompletion(piece)
          const isComplete = completed === total && total > 0
          const hasIssues = Object.values(piece.elements).some(e => e.etat === 'mauvais')

          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border-2 bg-white',
                isComplete && !hasIssues ? 'border-green-300' :
                hasIssues ? 'border-red-200' : 'border-gray-200'
              )}
            >
              <button
                type="button"
                onClick={() => onEditPiece(index)}
                className="flex-1 flex items-center gap-3 text-left touch-manipulation"
              >
                {isComplete
                  ? <CheckCircle2 size={20} className={cn('shrink-0', hasIssues ? 'text-orange-400' : 'text-green-500')} />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{piece.nom}</p>
                  <p className="text-xs text-gray-400">{completed}/{total} éléments</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 ml-auto shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => removePiece(index)}
                className="p-2 text-gray-300 hover:text-red-400 touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl"
      >
        <Plus size={14} />Ajouter une pièce
      </button>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">Retour</Button>
          <Button onClick={onNext} className="flex-1" disabled={pieces.length === 0}>
            Autres →
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Ajouter une pièce</h3>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Principales</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_COMMUNS.map(type => (
                  <button key={type} type="button" onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors">
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Autres</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_AUTRES.map(type => (
                  <button key={type} type="button" onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors">
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowModal(false)}>Annuler</Button>
          </div>
        </div>
      )}
    </div>
  )
}
