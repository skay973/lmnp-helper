import { useState } from 'react'
import { Plus, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Piece, type TypePiece, TYPE_PIECE_LABELS, ELEMENTS_PAR_SECTION } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'

interface Props {
  pieces: Piece[]
  onChange: (pieces: Piece[]) => void
  onNext: () => void
  onBack: () => void
  onEditPiece: (index: number) => void
}

const TYPES_COMMUNS: TypePiece[] = ['entree', 'salon', 'chambre', 'cuisine', 'salle_de_bain', 'wc', 'couloir']
const TYPES_AUTRES: TypePiece[] = ['salle_a_manger', 'bureau', 'balcon', 'cave', 'garage', 'autre']

function createPieceVide(type: TypePiece, nom: string): Piece {
  const sections: Piece['sections'] = {
    sols: {},
    murs: {},
    plafond: {},
    portes: {},
    fenetres: {},
    electricite: {},
    plomberie: {},
    rangements: {},
    equipements: {},
    autres: {},
  }
  return { nom, type, sections }
}

function getPieceCompletion(piece: Piece): { completed: number; total: number } {
  let completed = 0
  let total = 0
  for (const [sectionKey, section] of Object.entries(piece.sections)) {
    const elements = ELEMENTS_PAR_SECTION[sectionKey] ?? []
    total += elements.length
    completed += elements.filter(el => (section as Record<string, { etat?: string }>)[el]?.etat).length
  }
  return { completed, total }
}

export function StepPieces({ pieces, onChange, onNext, onBack, onEditPiece }: Props) {
  const [showModal, setShowModal] = useState(false)

  const addPiece = (type: TypePiece) => {
    const count = pieces.filter(p => p.type === type).length
    const nom = count === 0 ? TYPE_PIECE_LABELS[type] : `${TYPE_PIECE_LABELS[type]} ${count + 1}`
    onChange([...pieces, createPieceVide(type, nom)])
    setShowModal(false)
  }

  const removePiece = (index: number) => {
    onChange(pieces.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 pb-8">
      <p className="text-sm text-gray-600">
        Ajoutez toutes les pièces du logement, puis saisissez l'état de chacune.
      </p>

      {pieces.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-2xl">
          <p className="text-sm">Aucune pièce ajoutée</p>
          <p className="text-xs mt-1">Commencez par ajouter une pièce</p>
        </div>
      )}

      <div className="space-y-2">
        {pieces.map((piece, index) => {
          const { completed, total } = getPieceCompletion(piece)
          const isComplete = completed === total && total > 0
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border-2 bg-white',
                isComplete ? 'border-green-300' : 'border-gray-200'
              )}
            >
              <button
                type="button"
                onClick={() => onEditPiece(index)}
                className="flex-1 flex items-center gap-3 text-left touch-manipulation"
              >
                {isComplete
                  ? <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                  : <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                }
                <div>
                  <p className="font-medium text-gray-900">{piece.nom}</p>
                  <p className="text-xs text-gray-500">{completed}/{total} éléments saisis</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 ml-auto" />
              </button>
              <button
                type="button"
                onClick={() => removePiece(index)}
                className="p-2 text-gray-400 hover:text-red-500 touch-manipulation"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )
        })}
      </div>

      <Button variant="outline" className="w-full border-dashed" onClick={() => setShowModal(true)}>
        <Plus size={18} />
        Ajouter une pièce
      </Button>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Retour
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={pieces.length === 0}>
          Terminer & Récapituler
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Choisir le type de pièce</h3>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pièces principales</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_COMMUNS.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors"
                  >
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Autres espaces</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_AUTRES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors"
                  >
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
