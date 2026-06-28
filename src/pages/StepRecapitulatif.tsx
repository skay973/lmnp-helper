import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type EtatDesLieux, getPieceCompletion } from '@/types/etatDesLieux'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  data: EtatDesLieux
  onBack: () => void
  onSuccess: (id: string) => void
}

export function StepRecapitulatif({ data, onBack, onSuccess }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const problemes = data.pieces.flatMap(piece =>
    Object.entries(piece.elements)
      .filter(([, val]) => val.etat === 'mauvais')
      .map(([key, val]) => ({ piece: piece.nom, element: key, commentaire: val.commentaire }))
  )

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const { data: saved, error: err } = await supabase
        .from('etats_des_lieux')
        .insert([{
          appartement_id: data.appartementId ?? null,
          infos_generales: data.infosGenerales,
          pieces: data.pieces,
          observations: data.observations,
          created_at: new Date().toISOString(),
        }])
        .select('id')
        .single()

      if (err) throw err
      onSuccess(saved.id)
    } catch {
      setError('Erreur lors de la sauvegarde. Vérifiez votre connexion.')
      setSaving(false)
    }
  }

  const { infosGenerales: info } = data

  return (
    <div className="space-y-5 pb-8">
      <div className="bg-blue-50 rounded-2xl p-4 space-y-1">
        <h3 className="font-semibold text-blue-900">
          {info.typeMouvement === 'entree' ? '↓ Entrée' : '↑ Sortie'} — {new Date(info.dateEtat).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        <p className="text-sm text-blue-800">{info.adresse}, {info.codePostal} {info.ville}</p>
        <p className="text-sm text-blue-700">
          Locataire : {info.locataire.prenom} {info.locataire.nom}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {data.pieces.length} pièce{data.pieces.length > 1 ? 's' : ''}
        </h3>
        <div className="space-y-2">
          {data.pieces.map((piece, i) => {
            const { completed, total } = getPieceCompletion(piece)
            const hasProbleme = Object.values(piece.elements).some(e => e.etat === 'mauvais')
            const isIncomplete = completed < total
            return (
              <div key={i} className={cn(
                'flex items-center gap-3 p-3 rounded-xl border',
                hasProbleme ? 'bg-red-50 border-red-200' :
                isIncomplete ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              )}>
                {hasProbleme
                  ? <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  : isIncomplete
                  ? <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                  : <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                }
                <span className="text-sm font-medium text-gray-900 flex-1">{piece.nom}</span>
                <span className="text-xs text-gray-400">{completed}/{total}</span>
              </div>
            )
          })}
        </div>
      </div>

      {problemes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2">
            {problemes.length} problème{problemes.length > 1 ? 's' : ''} signalé{problemes.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {problemes.map((p, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm font-medium text-red-900">{p.piece} — {p.element}</p>
                {p.commentaire && <p className="text-xs text-red-700 mt-0.5">{p.commentaire}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={saving}>Modifier</Button>
        <Button onClick={handleSave} className="flex-1" disabled={saving}>
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
      </div>
    </div>
  )
}
