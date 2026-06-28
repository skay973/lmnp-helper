import { SectionPiece } from '@/components/SectionPiece'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { type Piece, type PieceSection } from '@/types/etatDesLieux'
import { ChevronLeft } from 'lucide-react'

interface Props {
  piece: Piece
  onChange: (piece: Piece) => void
  onBack: () => void
}

const SECTIONS_ORDONNEES: (keyof Piece['sections'])[] = [
  'sols', 'murs', 'plafond', 'portes', 'fenetres',
  'electricite', 'plomberie', 'rangements', 'equipements', 'autres'
]

export function StepPieceDetail({ piece, onChange, onBack }: Props) {
  const setSection = (key: keyof Piece['sections'], value: PieceSection) => {
    onChange({ ...piece, sections: { ...piece.sections, [key]: value } })
  }

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

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">{piece.nom}</h2>
        <p className="text-sm text-gray-500">Ouvrez chaque section pour saisir l'état des éléments</p>
      </div>

      <div className="space-y-3">
        {SECTIONS_ORDONNEES.map((sectionKey) => (
          <SectionPiece
            key={sectionKey}
            sectionKey={sectionKey}
            value={piece.sections[sectionKey]}
            onChange={(val) => setSection(sectionKey, val)}
          />
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Observations générales sur la pièce</label>
        <Textarea
          placeholder="Remarques générales, odeurs, humidité..."
          value={piece.commentaireGeneral ?? ''}
          onChange={e => onChange({ ...piece, commentaireGeneral: e.target.value })}
        />
      </div>

      <Button className="w-full" size="lg" onClick={onBack}>
        Valider cette pièce
      </Button>
    </div>
  )
}
