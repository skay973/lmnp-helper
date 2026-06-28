import { type ElementEtat, type EquipementsEnergetiques, ETAT_LABELS, ETAT_COLORS, type Etat } from '@/types/etatDesLieux'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MessageSquare, Lock, Wrench, Zap, StickyNote } from 'lucide-react'
import { useState } from 'react'

interface Props {
  partiesPrivatives: Record<string, ElementEtat>
  equipements: Record<string, ElementEtat>
  equipementsEnergetiques: EquipementsEnergetiques
  observations: string
  onChangePartiesPrivatives: (v: Record<string, ElementEtat>) => void
  onChangeEquipements: (v: Record<string, ElementEtat>) => void
  onChangeEquipementsEnergetiques: (v: EquipementsEnergetiques) => void
  onChangeObservations: (v: string) => void
  onNext: () => void
  onBack: () => void
}

function EtatBtns({ value, onChange }: { value?: Etat; onChange: (e: Etat) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {(Object.keys(ETAT_LABELS) as Etat[]).map(etat => (
        <button key={etat} type="button" onClick={() => onChange(etat)}
          className={cn(
            'rounded-lg border-2 py-2 text-xs font-semibold transition-all touch-manipulation active:scale-95',
            value === etat ? ETAT_COLORS[etat] + ' shadow-sm' : 'border-gray-200 bg-gray-50 text-gray-400'
          )}>
          {ETAT_LABELS[etat]}
        </button>
      ))}
    </div>
  )
}

function ElementCard({ label, value, onChange }: { label: string; value: ElementEtat; onChange: (v: ElementEtat) => void }) {
  const [showComment, setShowComment] = useState(!!value.commentaire)
  return (
    <div className={cn('rounded-xl border-2 bg-white p-3 space-y-2',
      value.etat === 'mauvais' ? 'border-red-300' :
      value.etat === 'bon' ? 'border-green-300' :
      value.etat === 'usage' ? 'border-yellow-300' : 'border-gray-200')}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        <button type="button" onClick={() => setShowComment(!showComment)}
          className={cn('p-1.5 rounded-lg touch-manipulation', showComment || value.commentaire ? 'text-blue-600 bg-blue-50' : 'text-gray-300')}>
          <MessageSquare size={15} />
        </button>
      </div>
      <EtatBtns value={value.etat} onChange={etat => { onChange({ ...value, etat }); if (etat === 'mauvais') setShowComment(true) }} />
      {(showComment || value.commentaire) && (
        <Textarea placeholder="Précisions..." value={value.commentaire ?? ''} onChange={e => onChange({ ...value, commentaire: e.target.value })} className="w-full text-sm min-h-[56px] bg-gray-50 resize-none" />
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export function StepComplements({ partiesPrivatives, equipements, equipementsEnergetiques, observations,
  onChangePartiesPrivatives, onChangeEquipements, onChangeEquipementsEnergetiques, onChangeObservations,
  onNext, onBack }: Props) {

  const setEnergetique = (k: keyof EquipementsEnergetiques, v: string) =>
    onChangeEquipementsEnergetiques({ ...equipementsEnergetiques, [k]: v })

  const energetiqueEtatBtns = (key: keyof EquipementsEnergetiques, label: string) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <EtatBtns value={equipementsEnergetiques[key] as Etat | undefined}
        onChange={v => setEnergetique(key, v)} />
    </div>
  )

  return (
    <div className="space-y-6 pb-24">

      {/* Parties privatives */}
      <Section icon={<Lock size={18} />} title="Parties privatives">
        {Object.entries(partiesPrivatives).map(([key, val]) => (
          <ElementCard key={key} label={key} value={val}
            onChange={v => onChangePartiesPrivatives({ ...partiesPrivatives, [key]: v })} />
        ))}
      </Section>

      {/* Équipements et aménagements */}
      <Section icon={<Wrench size={18} />} title="Équipements et aménagements">
        {Object.entries(equipements).map(([key, val]) => (
          <ElementCard key={key} label={key} value={val}
            onChange={v => onChangeEquipements({ ...equipements, [key]: v })} />
        ))}
      </Section>

      {/* Équipements énergétiques */}
      <Section icon={<Zap size={18} />} title="Équipements énergétiques">
        <div className="bg-white rounded-xl p-4 space-y-4 border border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Ballon d'eau chaude (ECS)</p>
            {energetiqueEtatBtns('ballon_etat', 'État général')}
            <div className="mt-3 space-y-1">
              <label className="text-sm font-medium text-gray-700">Date du dernier entretien</label>
              <Input type="month" value={equipementsEnergetiques.ballon_date_entretien ?? ''}
                onChange={e => setEnergetique('ballon_date_entretien', e.target.value)} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Climatisation</p>
            {energetiqueEtatBtns('clim_salon_etat', 'Unité salon')}
            <div className="mt-3">
              {energetiqueEtatBtns('clim_chambre_etat', 'Unité chambre')}
            </div>
            <div className="mt-3 space-y-1">
              <label className="text-sm font-medium text-gray-700">Date du dernier entretien</label>
              <Input type="month" value={equipementsEnergetiques.clim_date_entretien ?? ''}
                onChange={e => setEnergetique('clim_date_entretien', e.target.value)} />
            </div>
          </div>
        </div>
      </Section>

      {/* Observations globales */}
      <Section icon={<StickyNote size={18} />} title="Observations générales">
        <Textarea
          placeholder="Observations générales sur l'état du logement..."
          value={observations}
          onChange={e => onChangeObservations(e.target.value)}
          className="min-h-[120px]"
        />
      </Section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">Retour</Button>
          <Button onClick={onNext} className="flex-1">Inventaire →</Button>
        </div>
      </div>
    </div>
  )
}
