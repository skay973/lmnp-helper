import { useState } from 'react'
import { StepInfosGenerales } from './pages/StepInfosGenerales'
import { StepPieces } from './pages/StepPieces'
import { StepPieceDetail } from './pages/StepPieceDetail'
import { StepRecapitulatif } from './pages/StepRecapitulatif'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './contexts/AuthContext'
import { type EtatDesLieux, type InfosGenerales, type Piece } from './types/etatDesLieux'
import { CheckCircle2, LogOut, Loader2 } from 'lucide-react'

type Step = 'infos' | 'pieces' | 'piece_detail' | 'recap' | 'done'

const STEP_LABELS = ['Infos', 'Pièces', 'Récap']
const STEP_INDEX: Record<Step, number> = {
  infos: 0,
  pieces: 1,
  piece_detail: 1,
  recap: 2,
  done: 3,
}

const defaultInfos: InfosGenerales = {
  adresse: '',
  ville: '',
  codePostal: '',
  dateEtat: new Date().toISOString().split('T')[0],
  typeMouvement: 'entree',
  locataire: { nom: '', prenom: '' },
  bailleur: { nom: '', prenom: '' },
  releveCompteurs: {},
  nombreCles: 1,
  nombreBadges: 0,
}

export default function App() {
  const { user, loading, signOut } = useAuth()
  const [step, setStep] = useState<Step>('infos')
  const [editingPieceIndex, setEditingPieceIndex] = useState<number | null>(null)
  const [etat, setEtat] = useState<EtatDesLieux>({
    infosGenerales: defaultInfos,
    pieces: [],
  })
  const [savedId, setSavedId] = useState<string | null>(null)

  const setPieces = (pieces: Piece[]) => setEtat(e => ({ ...e, pieces }))
  const setPiece = (index: number, piece: Piece) => {
    const pieces = [...etat.pieces]
    pieces[index] = piece
    setEtat(e => ({ ...e, pieces }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <CheckCircle2 size={64} className="text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">État des lieux sauvegardé !</h1>
          <p className="text-gray-500 text-sm">Référence : {savedId}</p>
          <button
            onClick={() => {
              setEtat({ infosGenerales: defaultInfos, pieces: [] })
              setStep('infos')
              setSavedId(null)
            }}
            className="text-blue-600 text-sm underline"
          >
            Créer un nouvel état des lieux
          </button>
        </div>
      </div>
    )
  }

  const currentStepIndex = STEP_INDEX[step]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixe */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-bold text-gray-900">
              {step === 'piece_detail' && editingPieceIndex !== null
                ? etat.pieces[editingPieceIndex]?.nom
                : 'État des lieux'}
            </h1>
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
          {step !== 'piece_detail' && (
            <div className="flex gap-2">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-1.5 w-full rounded-full transition-colors ${
                    i < currentStepIndex
                      ? 'bg-green-500'
                      : i === currentStepIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`} />
                  <span className={`text-xs ${i === currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {step === 'infos' && (
          <StepInfosGenerales
            value={etat.infosGenerales}
            onChange={infosGenerales => setEtat(e => ({ ...e, infosGenerales }))}
            onNext={() => setStep('pieces')}
          />
        )}

        {step === 'pieces' && (
          <StepPieces
            pieces={etat.pieces}
            onChange={setPieces}
            onNext={() => setStep('recap')}
            onBack={() => setStep('infos')}
            onEditPiece={(index) => {
              setEditingPieceIndex(index)
              setStep('piece_detail')
            }}
          />
        )}

        {step === 'piece_detail' && editingPieceIndex !== null && (
          <StepPieceDetail
            piece={etat.pieces[editingPieceIndex]}
            onChange={(piece) => setPiece(editingPieceIndex, piece)}
            onBack={() => {
              setEditingPieceIndex(null)
              setStep('pieces')
            }}
          />
        )}

        {step === 'recap' && (
          <StepRecapitulatif
            data={etat}
            onBack={() => setStep('pieces')}
            onSuccess={(id) => {
              setSavedId(id)
              setStep('done')
            }}
          />
        )}
      </main>
    </div>
  )
}
