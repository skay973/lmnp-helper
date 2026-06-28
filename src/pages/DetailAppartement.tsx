import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Appartement, type EtatDesLieuxResume } from '@/types/appartement'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Plus, ArrowDownToLine, ArrowUpFromLine, Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  appartement: Appartement
  onBack: () => void
  onNewEDL: () => void
  onOpenEDL: (id: string) => void
}

export function DetailAppartement({ appartement, onBack, onNewEDL, onOpenEDL }: Props) {
  const [edls, setEdls] = useState<EtatDesLieuxResume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('etats_des_lieux')
      .select('id, appartement_id, created_at, infos_generales')
      .eq('appartement_id', appartement.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setEdls((data as EtatDesLieuxResume[]) ?? [])
        setLoading(false)
      })
  }, [appartement.id])

  const entrees = edls.filter(e => e.infos_generales.typeMouvement === 'entree')
  const sorties = edls.filter(e => e.infos_generales.typeMouvement === 'sortie')

  return (
    <div className="space-y-5 pb-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-blue-600 text-sm font-medium touch-manipulation -ml-1"
      >
        <ChevronLeft size={18} />
        Mes appartements
      </button>

      <div className="bg-blue-50 rounded-2xl p-4 space-y-0.5">
        <h2 className="text-lg font-bold text-blue-900">{appartement.nom}</h2>
        <p className="text-sm text-blue-700">{appartement.adresse}</p>
        <p className="text-sm text-blue-600">{appartement.code_postal} {appartement.ville}</p>
      </div>

      <Button className="w-full" size="lg" onClick={onNewEDL}>
        <Plus size={18} />
        Nouvel état des lieux
      </Button>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-600" />
        </div>
      ) : edls.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-2xl">
          <FileText size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun état des lieux</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entrees.length > 0 && (
            <EDLSection
              titre="États des lieux entrants"
              icon={<ArrowDownToLine size={16} className="text-green-600" />}
              edls={entrees}
              couleur="green"
              onOpen={onOpenEDL}
            />
          )}
          {sorties.length > 0 && (
            <EDLSection
              titre="États des lieux sortants"
              icon={<ArrowUpFromLine size={16} className="text-orange-500" />}
              edls={sorties}
              couleur="orange"
              onOpen={onOpenEDL}
            />
          )}
        </div>
      )}
    </div>
  )
}

function EDLSection({
  titre, icon, edls, couleur, onOpen
}: {
  titre: string
  icon: React.ReactNode
  edls: EtatDesLieuxResume[]
  couleur: 'green' | 'orange'
  onOpen: (id: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{titre}</h3>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          couleur === 'green' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        )}>{edls.length}</span>
      </div>
      {edls.map((edl) => {
        const date = new Date(edl.infos_generales.dateEtat).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
        const { nom, prenom } = edl.infos_generales.locataire
        return (
          <button
            key={edl.id}
            type="button"
            onClick={() => onOpen(edl.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 bg-white text-left touch-manipulation transition-colors',
              couleur === 'green'
                ? 'border-green-200 hover:border-green-300 hover:bg-green-50/30'
                : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/30'
            )}
          >
            <FileText size={18} className={couleur === 'green' ? 'text-green-500 shrink-0' : 'text-orange-400 shrink-0'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{prenom} {nom}</p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
