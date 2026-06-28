import { useState, useCallback } from 'react'
import { StepInfosGenerales } from './pages/StepInfosGenerales'
import { StepPieces } from './pages/StepPieces'
import { StepPieceDetail } from './pages/StepPieceDetail'
import { StepComplements } from './pages/StepComplements'
import { StepInventaire } from './pages/StepInventaire'
import { StepRecapitulatif } from './pages/StepRecapitulatif'
import { ListeAppartements } from './pages/ListeAppartements'
import { DetailAppartement } from './pages/DetailAppartement'
import { GestionInventaire } from './pages/GestionInventaire'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './contexts/AuthContext'
import { type EtatDesLieux, type InfosGenerales, type Piece, type TypePiece, createPiece, TYPE_PIECE_LABELS } from './types/etatDesLieux'
import { type Appartement, type PieceStock } from './types/appartement'
import { type LocataireAvecStatut } from './types/locataire'
import { syncInventaireWithPieces } from './types/inventaire'
import { CheckCircle2, LogOut, Loader2, ChevronLeft, Download } from 'lucide-react'
import { generateEDLPdf } from './lib/generatePDF'
import { generateInventairePdf } from './lib/generateInventairePdf'
import { Button } from './components/ui/button'
import { supabase } from './lib/supabase'
import type { Inventaire } from './types/inventaire'

type Screen = 'appartements' | 'detail_appt' | 'inventaire_appt' | 'edl_form' | 'done'
type EDLStep = 'infos' | 'pieces' | 'piece_detail' | 'complements' | 'inventaire' | 'recap'

const STEP_LABELS = ['Infos', 'Pièces', 'Autres', 'Inventaire', 'Récap']
const STEP_INDEX: Record<EDLStep, number> = {
  infos: 0, pieces: 1, piece_detail: 1, complements: 2, inventaire: 3, recap: 4
}

function makeInfos(appt: Appartement, locataire: LocataireAvecStatut, type: 'entree' | 'sortie'): InfosGenerales {
  const cfg = appt.config
  return {
    adresse: appt.adresse,
    ville: appt.ville,
    codePostal: appt.code_postal,
    identifiantFiscal: cfg.identifiant_fiscal ?? '',
    dateEtat: new Date().toISOString().split('T')[0],
    typeMouvement: type,
    locataire: { nom: locataire.nom, prenom: locataire.prenom, email: locataire.email, telephone: locataire.telephone },
    bailleur: { nom: cfg.bailleur?.nom ?? '', prenom: cfg.bailleur?.prenom ?? '', email: cfg.bailleur?.email, adresse: cfg.bailleur?.adresse },
    bail: { dateDebut: locataire.date_entree ?? '', duree: '1 an' },
    releveCompteurs: {
      electricite_pdl: cfg.compteurs?.electricite_pdl ?? '',
      eau_numero: cfg.compteurs?.eau_numero ?? '',
    },
    has_gaz: cfg.has_gaz ?? false,
    cles: cfg.cles_defaut ?? [],
    equipements_communs: Object.fromEntries((cfg.equipements_communs ?? []).map(e => [e, {}])),
  }
}

function makePieces(appt: Appartement): Piece[] {
  if (appt.pieces?.length) {
    return appt.pieces.map(({ type, nom, elementKeys }) => {
      const piece = createPiece(type, nom)
      if (elementKeys?.length) {
        // Restore custom element list, preserving order
        piece.elements = Object.fromEntries(elementKeys.map(k => [k, {}]))
      }
      return piece
    })
  }
  const counts: Record<string, number> = {}
  return (appt.config?.pieces_defaut ?? []).map(t => {
    const type = t as TypePiece
    counts[type] = (counts[type] ?? 0) + 1
    const nom = counts[type] === 1 ? TYPE_PIECE_LABELS[type] : `${TYPE_PIECE_LABELS[type]} ${counts[type]}`
    return createPiece(type, nom)
  })
}

function makeEDL(appt: Appartement, locataire: LocataireAvecStatut, type: 'entree' | 'sortie'): EtatDesLieux {
  const cfg = appt.config
  return {
    infosGenerales: makeInfos(appt, locataire, type),
    pieces: makePieces(appt),
    appartementId: appt.id,
    locataireId: locataire.id,
    partiesPrivatives: Object.fromEntries(
      (cfg.equipements_communs ?? [])
        .filter(e => e.toLowerCase().includes('parking') || e.toLowerCase().includes('cave') || e.toLowerCase().includes('garage'))
        .map(e => [e, {}])
    ),
    equipements: Object.fromEntries(
      (cfg.equipements_communs ?? [])
        .filter(e => !e.toLowerCase().includes('parking') && !e.toLowerCase().includes('terrasse') && !e.toLowerCase().includes('cave') && !e.toLowerCase().includes('garage'))
        .map(e => [e, {}])
    ),
    equipementsEnergetiques: {},
    observations: '',
    inventaire: syncInventaireWithPieces(
      makePieces(appt),
      (appt.inventaire ?? []).map(p => ({
        ...p,
        items: p.items.map(({ etatEntree: _unused, ...item }) => item),
      }))
    ),
  }
}

export default function App() {
  const { user, loading, signOut } = useAuth()

  const [screen, setScreen] = useState<Screen>('appartements')
  const [selectedAppt, setSelectedAppt] = useState<Appartement | null>(null)
  const [selectedLocataire, setSelectedLocataire] = useState<LocataireAvecStatut | null>(null)
  const [edlStep, setEdlStep] = useState<EDLStep>('infos')
  const [editingPieceIndex, setEditingPieceIndex] = useState<number | null>(null)
  const [etat, setEtat] = useState<EtatDesLieux | null>(null)
  const [savedEtat, setSavedEtat] = useState<EtatDesLieux | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingInventairePdf, setGeneratingInventairePdf] = useState(false)

  const setPieces = (pieces: Piece[]) => setEtat(e => e ? { ...e, pieces } : e)
  const setPiece = (index: number, piece: Piece) => {
    setEtat(e => {
      if (!e) return e
      const pieces = [...e.pieces]; pieces[index] = piece
      return { ...e, pieces }
    })
  }

  const startEDL = (appt: Appartement, locataire: LocataireAvecStatut, type: 'entree' | 'sortie') => {
    setSelectedLocataire(locataire)
    setEtat(makeEDL(appt, locataire, type))
    setEdlStep('infos')
    setScreen('edl_form')
  }

  const handleSavePieces = useCallback(async (pieces: Piece[]) => {
    if (!selectedAppt) return
    const stock: PieceStock[] = pieces.map(({ type, nom, elements }) => ({
      type, nom, elementKeys: Object.keys(elements),
    }))
    // Sync inventory sections to match updated pieces
    const currentInv = etat?.inventaire ?? selectedAppt.inventaire ?? []
    const syncedInv = syncInventaireWithPieces(pieces, currentInv)
    const stockInv = syncedInv.map(p => ({
      ...p,
      items: p.items.map(({ etatEntree: _unused, ...item }) => item),
    }))
    await supabase.from('appartements').update({ pieces: stock, inventaire: stockInv }).eq('id', selectedAppt.id)
    setSelectedAppt(a => a ? { ...a, pieces: stock, inventaire: stockInv } : a)
    setEtat(e => e ? { ...e, inventaire: syncedInv } : e)
  }, [selectedAppt, etat])

  const handleSaveInventaire = useCallback(async (inventaire: Inventaire) => {
    if (!selectedAppt) return
    // Strip etatEntree before saving to apartment — it belongs to the EDL, not the stock
    const stock = inventaire.map(p => ({
      ...p,
      items: p.items.map(({ etatEntree: _unused, ...item }) => item),
    }))
    await supabase.from('appartements').update({ inventaire: stock }).eq('id', selectedAppt.id)
    setSelectedAppt(a => a ? { ...a, inventaire: stock } : a)
  }, [selectedAppt])

  const handleDownloadEdlPdf = async (data: EtatDesLieux) => {
    setGeneratingPdf(true)
    await generateEDLPdf(data)
    setGeneratingPdf(false)
  }

  const handleDownloadInventairePdf = async (data: EtatDesLieux) => {
    setGeneratingInventairePdf(true)
    await generateInventairePdf(data)
    setGeneratingInventairePdf(false)
  }

  const getBreadcrumbs = (): string[] => {
    const root = 'Ma LMNP'
    if (screen === 'appartements') return [root, 'Appartements']
    if (screen === 'detail_appt') return [root, selectedAppt?.nom ?? '']
    if (screen === 'inventaire_appt') return [root, selectedAppt?.nom ?? '', 'Inventaire']
    if (screen === 'done') return [root, 'Sauvegardé']
    if (edlStep === 'piece_detail' && editingPieceIndex !== null)
      return [root, selectedAppt?.nom ?? '', etat?.pieces[editingPieceIndex]?.nom ?? '']
    const locName = selectedLocataire ? `${selectedLocataire.prenom} ${selectedLocataire.nom}` : 'Nouvel EDL'
    return [root, selectedAppt?.nom ?? '', locName]
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-blue-600" /></div>
  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 min-w-0">
              {screen === 'edl_form' && edlStep !== 'piece_detail' && (
                <button type="button" onClick={() => setScreen('detail_appt')}
                  className="p-1 -ml-1 text-blue-600 touch-manipulation shrink-0"><ChevronLeft size={22} /></button>
              )}
              {getBreadcrumbs().map((crumb, i, arr) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <span className="text-gray-300 text-xs shrink-0">›</span>}
                  <span className={i === arr.length - 1
                    ? 'text-sm font-bold text-gray-900 truncate'
                    : 'text-xs text-gray-400 shrink-0 max-w-[70px] truncate'
                  }>{crumb}</span>
                </span>
              ))}
            </div>
            <button onClick={signOut} className="p-2 text-gray-400 hover:text-gray-600 touch-manipulation shrink-0 ml-2" title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>

          {screen === 'edl_form' && edlStep !== 'piece_detail' && (
            <div className="flex gap-1.5 mt-2">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-1.5 w-full rounded-full transition-colors ${
                    i < STEP_INDEX[edlStep] ? 'bg-green-500' : i === STEP_INDEX[edlStep] ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                  <span className={`text-xs ${i === STEP_INDEX[edlStep] ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {screen === 'appartements' && (
          <ListeAppartements onSelect={appt => { setSelectedAppt(appt); setScreen('detail_appt') }} />
        )}

        {screen === 'detail_appt' && selectedAppt && (
          <DetailAppartement
            appartement={selectedAppt}
            onBack={() => setScreen('appartements')}
            onStartEDL={(loc, type) => startEDL(selectedAppt, loc, type)}
            onGestionInventaire={() => setScreen('inventaire_appt')}
          />
        )}

        {screen === 'inventaire_appt' && selectedAppt && (
          <GestionInventaire
            inventaire={selectedAppt.inventaire?.length
              ? selectedAppt.inventaire
              : syncInventaireWithPieces(makePieces(selectedAppt), [])}
            onSave={async (inventaire) => {
              const stock = inventaire.map(p => ({
                ...p,
                items: p.items.map(({ etatEntree: _unused, ...item }) => item),
              }))
              await supabase.from('appartements').update({ inventaire: stock }).eq('id', selectedAppt.id)
              setSelectedAppt(a => a ? { ...a, inventaire: stock } : a)
            }}
            onBack={() => setScreen('detail_appt')}
          />
        )}

        {screen === 'done' && savedEtat && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-5 w-full max-w-sm">
              <CheckCircle2 size={64} className="text-green-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sauvegardé !</h2>
                <p className="text-gray-500 text-sm mt-1">Réf. : {savedId}</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleDownloadEdlPdf(savedEtat)}
                disabled={generatingPdf}
              >
                {generatingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {generatingPdf ? 'Génération du PDF...' : 'Télécharger le PDF'}
              </Button>
              <Button variant="outline" className="w-full" size="lg"
                onClick={() => handleDownloadInventairePdf(savedEtat)}
                disabled={generatingInventairePdf}>
                {generatingInventairePdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                {generatingInventairePdf ? 'Génération...' : "Télécharger l'inventaire"}
              </Button>
              <button onClick={() => { setScreen('detail_appt'); setSavedId(null); setSavedEtat(null) }}
                className="text-blue-600 text-sm font-medium underline touch-manipulation block w-full">
                Retour à l'appartement
              </button>
            </div>
          </div>
        )}

        {screen === 'edl_form' && etat && (
          <>
            {edlStep === 'infos' && (
              <StepInfosGenerales
                value={etat.infosGenerales}
                onChange={infosGenerales => setEtat(e => e ? { ...e, infosGenerales } : e)}
                onNext={() => setEdlStep('pieces')}
              />
            )}
            {edlStep === 'pieces' && (
              <StepPieces
                pieces={etat.pieces}
                onChange={setPieces}
                onSavePieces={handleSavePieces}
                onNext={() => setEdlStep('complements')}
                onBack={() => setEdlStep('infos')}
                onEditPiece={index => { setEditingPieceIndex(index); setEdlStep('piece_detail') }}
              />
            )}
            {edlStep === 'piece_detail' && editingPieceIndex !== null && (
              <StepPieceDetail
                piece={etat.pieces[editingPieceIndex]}
                userId={user.id}
                onChange={piece => setPiece(editingPieceIndex, piece)}
                onSavePiece={piece => {
                  const updated = [...etat.pieces]
                  updated[editingPieceIndex] = piece
                  handleSavePieces(updated)
                }}
                onBack={() => { setEditingPieceIndex(null); setEdlStep('pieces') }}
              />
            )}
            {edlStep === 'complements' && (
              <StepComplements
                partiesPrivatives={etat.partiesPrivatives}
                equipements={etat.equipements}
                equipementsEnergetiques={etat.equipementsEnergetiques}
                observations={etat.observations}
                onChangePartiesPrivatives={v => setEtat(e => e ? { ...e, partiesPrivatives: v } : e)}
                onChangeEquipements={v => setEtat(e => e ? { ...e, equipements: v } : e)}
                onChangeEquipementsEnergetiques={v => setEtat(e => e ? { ...e, equipementsEnergetiques: v } : e)}
                onChangeObservations={v => setEtat(e => e ? { ...e, observations: v } : e)}
                onNext={() => setEdlStep('inventaire')}
                onBack={() => setEdlStep('pieces')}
              />
            )}
            {edlStep === 'inventaire' && (
              <StepInventaire
                value={etat.inventaire ?? []}
                onChange={inventaire => setEtat(e => e ? { ...e, inventaire } : e)}
                onSaveInventaire={handleSaveInventaire}
                onNext={() => setEdlStep('recap')}
                onBack={() => setEdlStep('complements')}
              />
            )}
            {edlStep === 'recap' && (
              <StepRecapitulatif
                data={etat}
                onBack={() => setEdlStep('inventaire')}
                onSuccess={(id, finalData) => { setSavedId(id); setSavedEtat(finalData); setScreen('done') }}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}
