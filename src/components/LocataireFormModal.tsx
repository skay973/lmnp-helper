import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, X } from 'lucide-react'
import type { Locataire } from '@/types/locataire'

interface Props {
  appartementId: string
  onSuccess: (locataire: Locataire) => void
  onClose: () => void
}

export function LocataireFormModal({ appartementId, onSuccess, onClose }: Props) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', adresse: '' })
  const [dateEntree, setDateEntree] = useState(new Date().toISOString().split('T')[0])
  const [mode, setMode] = useState<'immediate' | 'a_venir'>('immediate')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) return
    setSaving(true)
    setError(null)

    const { data: loc, error: e1 } = await supabase
      .from('locataires')
      .insert([{ nom: form.nom, prenom: form.prenom, email: form.email || null, telephone: form.telephone || null, adresse: form.adresse || null }])
      .select()
      .single()

    if (e1 || !loc) { setError('Erreur lors de la création.'); setSaving(false); return }

    if (mode === 'immediate') {
      // Désactiver l'ancien locataire actif
      await supabase
        .from('appartement_locataires')
        .update({ est_actif: false, date_sortie: dateEntree })
        .eq('appartement_id', appartementId)
        .eq('est_actif', true)
    }

    const { error: e2 } = await supabase
      .from('appartement_locataires')
      .insert([{
        appartement_id: appartementId,
        locataire_id: loc.id,
        date_entree: dateEntree || null,
        est_actif: mode === 'immediate',
      }])

    if (e2) { setError('Erreur lors de l\'assignation.'); setSaving(false); return }

    onSuccess(loc as Locataire)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Nouveau locataire</h3>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 touch-manipulation">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Mode d'entrée */}
          <div className="flex gap-2">
            {(['immediate', 'a_venir'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 h-11 rounded-xl border-2 text-sm font-semibold transition-all touch-manipulation ${
                  mode === m
                    ? m === 'immediate'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-400 bg-white'
                }`}
              >
                {m === 'immediate' ? 'Entrée immédiate' : 'À venir'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Prénom *</label>
              <Input placeholder="Prénom" value={form.prenom} onChange={e => set('prenom', e.target.value)} autoComplete="given-name" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nom *</label>
              <Input placeholder="Nom" value={form.nom} onChange={e => set('nom', e.target.value)} autoComplete="family-name" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input type="email" placeholder="email@exemple.com" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Téléphone</label>
            <Input type="tel" inputMode="tel" placeholder="06 00 00 00 00" value={form.telephone} onChange={e => set('telephone', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {mode === 'immediate' ? 'Date d\'entrée' : 'Date d\'entrée prévue'}
            </label>
            <Input type="date" value={dateEntree} onChange={e => setDateEntree(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <Button
            className="w-full"
            size="lg"
            onClick={handleSave}
            disabled={!form.nom.trim() || !form.prenom.trim() || saving}
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving ? 'Enregistrement...' : mode === 'immediate' ? 'Enregistrer le locataire' : 'Préparer l\'arrivée'}
          </Button>
        </div>
      </div>
    </div>
  )
}
