import { ElementsList } from '@/components/ElementsList'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { type Piece } from '@/types/etatDesLieux'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { getPieceCompletion } from '@/types/etatDesLieux'

interface Props {
  piece: Piece
  onChange: (piece: Piece) => void
  onBack: () => void
}

export function StepPieceDetail({ piece, onChange, onBack }: Props) {
  const { completed, total } = getPieceCompletion(piece)
  const isComplete = completed === total && total > 0

  return (
    <div className="space-y-4 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 text-sm font-medium touch-manipulation -ml-1"
      >
        <ChevronLeft size={18} />
        Retour à la liste des pièces
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{piece.nom}</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {completed}/{total}
        </span>
      </div>

      <ElementsList
        elements={piece.elements}
        onChange={elements => onChange({ ...piece, elements })}
      />

      <div className="space-y-1.5 pt-1">
        <label className="text-sm font-medium text-gray-700">Observations générales</label>
        <Textarea
          placeholder="Remarques, odeurs, humidité..."
          value={piece.commentaireGeneral ?? ''}
          onChange={e => onChange({ ...piece, commentaireGeneral: e.target.value })}
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onBack}
        variant={isComplete ? 'default' : 'outline'}
      >
        {isComplete && <CheckCircle2 size={18} />}
        {isComplete ? 'Pièce validée' : 'Enregistrer et revenir'}
      </Button>
    </div>
  )
}
