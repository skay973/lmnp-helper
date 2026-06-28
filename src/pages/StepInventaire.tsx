import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import {
  type Inventaire, type InventaireItem, type InventaireEtat,
  INVENTAIRE_ETAT_COLORS, newInventaireItem,
} from '@/types/inventaire'

interface Props {
  value: Inventaire
  onChange: (value: Inventaire) => void
  onNext: () => void
  onBack: () => void
}

const ETATS: InventaireEtat[] = ['accord', 'accord_obs', 'pas_accord']
const ETATS_SHORT: Record<InventaireEtat, string> = {
  accord: "D'accord",
  accord_obs: 'Avec obs.',
  pas_accord: "Pas d'accord",
}

export function StepInventaire({ value, onChange, onNext, onBack }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(value.map((p, i) => [p.section, i === 0]))
  )

  const toggleSection = (section: string) =>
    setOpenSections(s => ({ ...s, [section]: !s[section] }))

  const updatePiece = (sectionIdx: number, items: InventaireItem[]) => {
    const next = [...value]
    next[sectionIdx] = { ...next[sectionIdx], items }
    onChange(next)
  }

  const updateItem = (sectionIdx: number, itemIdx: number, patch: Partial<InventaireItem>) => {
    const items = [...value[sectionIdx].items]
    items[itemIdx] = { ...items[itemIdx], ...patch }
    updatePiece(sectionIdx, items)
  }

  const addItem = (sectionIdx: number) => {
    const items = [...value[sectionIdx].items, newInventaireItem()]
    updatePiece(sectionIdx, items)
  }

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    const items = value[sectionIdx].items.filter((_, i) => i !== itemIdx)
    updatePiece(sectionIdx, items)
  }

  const setEtat = (sectionIdx: number, itemIdx: number, etat: InventaireEtat) => {
    const current = value[sectionIdx].items[itemIdx].etatEntree
    updateItem(sectionIdx, itemIdx, { etatEntree: current === etat ? undefined : etat })
  }

  return (
    <div className="space-y-3 pb-8">
      {value.map(({ section, items }, sectionIdx) => {
        const filled = items.filter(it => it.etatEntree).length
        const isOpen = openSections[section]

        return (
          <div key={section} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* En-tête section */}
            <button
              type="button"
              onClick={() => toggleSection(section)}
              className="w-full flex items-center justify-between px-4 py-3.5 touch-manipulation"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{section}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  filled === items.length && items.length > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>{filled}/{items.length}</span>
              </div>
              {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Items */}
                <div className="divide-y divide-gray-50">
                  {items.map((item, itemIdx) => {
                    const showObs = item.etatEntree === 'accord_obs' || item.etatEntree === 'pas_accord' || !!item.observations
                    return (
                      <div key={item.id} className="px-4 py-3 space-y-2">
                        {/* Ligne titre + qté + supprimer */}
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-1.5">
                            <Input
                              value={item.designation}
                              onChange={e => updateItem(sectionIdx, itemIdx, { designation: e.target.value })}
                              placeholder="Désignation"
                              className="text-sm h-8"
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.quantite ?? ''}
                                onChange={e => updateItem(sectionIdx, itemIdx, { quantite: e.target.value })}
                                placeholder="Qté (ex: 1, lot de 5…)"
                                className="text-xs h-7 w-36"
                              />
                              {item.noteInitiale && (
                                <span className="text-xs text-gray-400 italic truncate">{item.noteInitiale}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(sectionIdx, itemIdx)}
                            className="p-1.5 text-gray-300 hover:text-red-400 touch-manipulation shrink-0 mt-0.5"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Boutons état */}
                        <div className="flex gap-1.5">
                          {ETATS.map(etat => (
                            <button
                              key={etat}
                              type="button"
                              onClick={() => setEtat(sectionIdx, itemIdx, etat)}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all touch-manipulation ${
                                item.etatEntree === etat
                                  ? INVENTAIRE_ETAT_COLORS[etat]
                                  : 'border-gray-200 text-gray-400 bg-white'
                              }`}
                            >
                              {ETATS_SHORT[etat]}
                            </button>
                          ))}
                        </div>

                        {/* Observations */}
                        {showObs && (
                          <textarea
                            placeholder="Observations..."
                            value={item.observations ?? ''}
                            onChange={e => updateItem(sectionIdx, itemIdx, { observations: e.target.value })}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Ajouter un item */}
                <button
                  type="button"
                  onClick={() => addItem(sectionIdx)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border-t border-gray-100"
                >
                  <Plus size={14} />Ajouter un élément
                </button>
              </div>
            )}
          </div>
        )
      })}

      <div className="space-y-2 pt-2">
        <Button className="w-full" size="lg" onClick={onNext}>
          Continuer → Récap
        </Button>
        <button type="button" onClick={onBack}
          className="w-full text-sm text-gray-400 py-2 touch-manipulation">
          ← Retour
        </button>
      </div>
    </div>
  )
}
