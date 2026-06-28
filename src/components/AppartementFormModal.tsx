import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'

interface Props {
  onSuccess: () => void
  onClose: () => void
}

export function AppartementFormModal({ onSuccess, onClose }: Props) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    surface: '',
    nbPieces: '',
  })

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))
  const isValid = form.nom.trim() && form.adresse.trim() && form.codePostal.trim() && form.ville.trim()

  const handleSubmit = async () => {
    if (!isValid || !user) return
    setSaving(true)
    const { data: appt, error } = await supabase
      .from('appartements')
      .insert({
        nom: form.nom.trim(),
        adresse: form.adresse.trim(),
        code_postal: form.codePostal.trim(),
        ville: form.ville.trim(),
        config: {
          surface: form.surface ? parseFloat(form.surface) : undefined,
          nb_pieces: form.nbPieces ? parseInt(form.nbPieces) : undefined,
          bailleur: { nom: '', prenom: '' },
          has_gaz: false,
          cles_defaut: [
            { type: 'Clé entrée logement', nombre: 1 },
            { type: 'Clé boîte aux lettres', nombre: 1 },
          ],
          pieces_defaut: [],
          equipements_communs: [],
          compteurs: { electricite_pdl: '', eau_numero: '' },
        },
      })
      .select()
      .single()

    if (error || !appt) { setSaving(false); return }

    await supabase.from('user_appartements').insert({
      user_id: user.id,
      appartement_id: appt.id,
    })

    setSaving(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nouvel appartement</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 touch-manipulation">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nom</label>
            <Input placeholder="Ex: D13 Carré Salambo" value={form.nom} onChange={e => set('nom', e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Adresse</label>
            <Input placeholder="412 rue Gustave Flaubert" value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Code postal</label>
              <Input placeholder="34070" inputMode="numeric" value={form.codePostal} onChange={e => set('codePostal', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Ville</label>
              <Input placeholder="Montpellier" value={form.ville} onChange={e => set('ville', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Surface (m²)</label>
              <Input placeholder="45" inputMode="decimal" value={form.surface} onChange={e => set('surface', e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nb pièces</label>
              <Input placeholder="2" inputMode="numeric" value={form.nbPieces} onChange={e => set('nbPieces', e.target.value)} />
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!isValid || saving}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : null}
          {saving ? 'Création...' : 'Créer l\'appartement'}
        </Button>
      </div>
    </div>
  )
}
