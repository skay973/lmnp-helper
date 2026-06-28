import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { type Appartement } from '@/types/appartement'
import { type LocataireAvecStatut } from '@/types/locataire'
import { type EtatDesLieuxResume } from '@/types/appartement'
import { type EtatDesLieux } from '@/types/etatDesLieux'
import { Button } from '@/components/ui/button'
import { LocataireFormModal } from '@/components/LocataireFormModal'
import { generateEDLPdf } from '@/lib/generatePDF'
import { generateInventairePdf } from '@/lib/generateInventairePdf'
import {
  ChevronLeft, UserPlus, ArrowDownToLine, ArrowUpFromLine,
  Loader2, Mail, Phone, User, CalendarDays, Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  appartement: Appartement
  onBack: () => void
  onStartEDL: (locataire: LocataireAvecStatut, type: 'entree' | 'sortie') => void
}

export function DetailAppartement({ appartement, onBack, onStartEDL }: Props) {
  const [locataires, setLocataires] = useState<LocataireAvecStatut[]>([])
  const [edls, setEdls] = useState<EtatDesLieuxResume[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingInventaireId, setDownloadingInventaireId] = useState<string | null>(null)

  const buildEdl = (data: any): EtatDesLieux => ({
    id: data.id,
    appartementId: data.appartement_id,
    locataireId: data.locataire_id,
    infosGenerales: data.infos_generales,
    pieces: data.pieces ?? [],
    partiesPrivatives: data.parties_privatives ?? {},
    equipements: data.equipements ?? {},
    equipementsEnergetiques: data.equipements_energetiques ?? {},
    observations: data.observations ?? '',
    inventaire: data.inventaire ?? {},
    createdAt: data.created_at,
  })

  const handleDownloadPdf = async (edlId: string) => {
    setDownloadingId(edlId)
    const { data } = await supabase
      .from('etats_des_lieux')
      .select('*')
      .eq('id', edlId)
      .single()
    if (data) await generateEDLPdf(buildEdl(data))
    setDownloadingId(null)
  }

  const handleDownloadInventairePdf = async (edlId: string) => {
    setDownloadingInventaireId(edlId)
    const { data } = await supabase
      .from('etats_des_lieux')
      .select('*')
      .eq('id', edlId)
      .single()
    if (data) await generateInventairePdf(buildEdl(data))
    setDownloadingInventaireId(null)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: liens }, { data: edlData }] = await Promise.all([
      supabase
        .from('appartement_locataires')
        .select('id, est_actif, date_entree, date_sortie, locataire:locataires(*)')
        .eq('appartement_id', appartement.id)
        .order('est_actif', { ascending: false })
        .order('date_entree', { ascending: false }),
      supabase
        .from('etats_des_lieux')
        .select('id, locataire_id, infos_generales, created_at')
        .eq('appartement_id', appartement.id)
        .order('created_at', { ascending: false }),
    ])

    const edlList = (edlData ?? []) as EtatDesLieuxResume[]
    setEdls(edlList)

    const locList: LocataireAvecStatut[] = (liens ?? []).map((l: any) => {
      const edlsForLoc = edlList.filter(e => e.locataire_id === l.locataire.id)
      return {
        ...l.locataire,
        lien_id: l.id,
        date_entree: l.date_entree,
        est_actif: l.est_actif,
        a_edl_entree: edlsForLoc.some(e => e.infos_generales.typeMouvement === 'entree'),
        a_edl_sortie: edlsForLoc.some(e => e.infos_generales.typeMouvement === 'sortie'),
      }
    })
    setLocataires(locList)
    setLoading(false)
  }, [appartement.id])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().split('T')[0]
  const actif = locataires.find(l => l.est_actif)
  const aVenir = locataires.filter(l => !l.est_actif && !l.a_edl_entree && l.date_entree && l.date_entree > today)
  const anciens = locataires.filter(l => !l.est_actif && !aVenir.includes(l))
  const entrees = edls.filter(e => e.infos_generales.typeMouvement === 'entree')
  const sorties = edls.filter(e => e.infos_generales.typeMouvement === 'sortie')

  return (
    <div className="space-y-5 pb-8">
      <button type="button" onClick={onBack}
        className="flex items-center gap-1 text-blue-600 text-sm font-medium touch-manipulation -ml-1">
        <ChevronLeft size={18} />Mes appartements
      </button>

      {/* Infos appartement */}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-0.5">
        <h2 className="text-lg font-bold text-blue-900">{appartement.nom}</h2>
        <p className="text-sm text-blue-700">{appartement.adresse}</p>
        <p className="text-sm text-blue-600">{appartement.code_postal} {appartement.ville}</p>
        {appartement.config?.surface && (
          <p className="text-xs text-blue-500 pt-1">{appartement.config.surface} m² · {appartement.config.nb_pieces} pièces</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-blue-600" /></div>
      ) : (
        <>
          {/* Locataire actif */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Locataire actif</h3>
              <button type="button" onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 font-medium touch-manipulation">
                <UserPlus size={16} />{actif ? 'Changer' : 'Ajouter'}
              </button>
            </div>

            {actif ? (
              <div className="bg-white rounded-2xl border-2 border-blue-200 p-4 space-y-3">
                {/* Identité */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold text-lg">
                      {actif.prenom[0]}{actif.nom[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{actif.prenom} {actif.nom}</p>
                    {actif.date_entree && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays size={11} />
                        Entrée le {new Date(actif.date_entree).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="space-y-1.5">
                  {actif.email && (
                    <a href={`mailto:${actif.email}`} className="flex items-center gap-2 text-sm text-gray-600 touch-manipulation">
                      <Mail size={14} className="text-gray-400 shrink-0" />{actif.email}
                    </a>
                  )}
                  {actif.telephone && (
                    <a href={`tel:${actif.telephone}`} className="flex items-center gap-2 text-sm text-gray-600 touch-manipulation">
                      <Phone size={14} className="text-gray-400 shrink-0" />{actif.telephone}
                    </a>
                  )}
                </div>

                {/* Actions EDL */}
                <div className="pt-1 space-y-2">
                  {!actif.a_edl_entree && (
                    <Button className="w-full" onClick={() => onStartEDL(actif, 'entree')}>
                      <ArrowDownToLine size={17} />
                      État des lieux d'entrée
                    </Button>
                  )}
                  {actif.a_edl_entree && !actif.a_edl_sortie && (
                    <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => onStartEDL(actif, 'sortie')}>
                      <ArrowUpFromLine size={17} />
                      État des lieux de sortie
                    </Button>
                  )}
                  {actif.a_edl_entree && actif.a_edl_sortie && (
                    <p className="text-xs text-center text-gray-400 py-1">EDL entrée et sortie effectués</p>
                  )}
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-sm hover:border-blue-300 hover:text-blue-500 transition-colors touch-manipulation">
                <UserPlus size={18} />Ajouter un locataire
              </button>
            )}
          </div>

          {/* Locataires à venir */}
          {aVenir.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm">À venir</h3>
              {aVenir.map(loc => (
                <div key={loc.lien_id} className="bg-purple-50 rounded-xl border border-purple-200 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">{loc.prenom[0]}{loc.nom[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{loc.prenom} {loc.nom}</p>
                    {loc.date_entree && (
                      <p className="text-xs text-purple-500">
                        Entrée prévue le {new Date(loc.date_entree).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartEDL(loc, 'entree')}
                    className="text-xs text-purple-600 font-semibold touch-manipulation px-2 py-1 rounded-lg border border-purple-300 bg-white"
                  >
                    EDL entrée
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Anciens locataires */}
          {anciens.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm">Anciens locataires</h3>
              {anciens.map(loc => (
                <div key={loc.lien_id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{loc.prenom} {loc.nom}</p>
                    {loc.date_entree && (
                      <p className="text-xs text-gray-400">
                        Entrée {new Date(loc.date_entree).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <button type="button"
                    onClick={() => onStartEDL(loc, 'entree')}
                    className="text-xs text-blue-600 font-medium touch-manipulation px-2">
                    Assigner
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Historique EDL */}
          {edls.length > 0 && (
            <div className="space-y-3 pt-1">
              <h3 className="font-semibold text-gray-900">Historique des états des lieux</h3>
              {[...entrees.map(e => ({ ...e, type: 'entree' as const })), ...sorties.map(e => ({ ...e, type: 'sortie' as const }))]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(edl => {
                  const isEntree = edl.infos_generales.typeMouvement === 'entree'
                  return (
                    <div key={edl.id} className={cn(
                      'flex items-center gap-3 p-3.5 rounded-xl border-2 bg-white',
                      isEntree ? 'border-green-200' : 'border-orange-200'
                    )}>
                      {isEntree
                        ? <ArrowDownToLine size={16} className="text-green-500 shrink-0" />
                        : <ArrowUpFromLine size={16} className="text-orange-400 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {edl.infos_generales.locataire.prenom} {edl.infos_generales.locataire.nom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(edl.infos_generales.dateEtat).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(edl.id)}
                        disabled={downloadingId === edl.id}
                        className="p-2 text-gray-400 hover:text-blue-600 touch-manipulation shrink-0 disabled:opacity-50"
                        title="Télécharger le PDF EDL"
                      >
                        {downloadingId === edl.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Download size={16} />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadInventairePdf(edl.id)}
                        disabled={downloadingInventaireId === edl.id}
                        className="p-2 -mr-1 text-gray-400 hover:text-purple-600 touch-manipulation shrink-0 disabled:opacity-50"
                        title="Télécharger l'inventaire PDF"
                      >
                        {downloadingInventaireId === edl.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Download size={16} className="opacity-60" />
                        }
                      </button>
                    </div>
                  )
                })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <LocataireFormModal
          appartementId={appartement.id}
          onSuccess={async () => { await load(); setShowForm(false) }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
