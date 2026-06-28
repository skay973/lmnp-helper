import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type Appartement } from '@/types/appartement'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'

interface Props {
  onSelect: (appartement: Appartement) => void
}

export function ListeAppartements({ onSelect }: Props) {
  const [appartements, setAppartements] = useState<Appartement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('appartements')
      .select('*')
      .order('nom')
      .then(({ data }) => {
        setAppartements(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-8">
      {appartements.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Building2 size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun appartement</p>
        </div>
      )}

      {appartements.map((appt) => (
        <button
          key={appt.id}
          type="button"
          onClick={() => onSelect(appt)}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all touch-manipulation text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{appt.nom}</p>
            <p className="text-sm text-gray-500 truncate">{appt.adresse}</p>
            <p className="text-sm text-gray-400">{appt.code_postal} {appt.ville}</p>
          </div>
          <ChevronRight size={20} className="text-gray-400 shrink-0" />
        </button>
      ))}
    </div>
  )
}
