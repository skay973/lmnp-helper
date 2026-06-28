import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, ClipboardList } from 'lucide-react'
import {
  type Inventaire, type InventaireItem, type InventaireEtat, type EtatPhysique,
  INVENTAIRE_ETAT_LABELS, INVENTAIRE_ETAT_COLORS,
  ETAT_PHYSIQUE_LABELS, ETAT_PHYSIQUE_BADGE, ETAT_PHYSIQUE_BTN,
  newInventaireItem,
} from '@/types/inventaire'

interface Props {
  value: Inventaire
  onChange: (value: Inventaire) => void
  onSaveInventaire: (value: Inventaire) => Promise<void>
  onNext: () => void
  onBack: () => void
}

const ETATS_PHYSIQUES: EtatPhysique[] = ['neuf', 'tres_bon', 'bon', 'usage', 'mauvais']
const ETATS_ACCORD: InventaireEtat[] = ['accord', 'accord_obs', 'pas_accord']

interface SheetState {
  sectionIdx: number
  itemIdx: number | null  // null = new item
  item: InventaireItem
}

function InventaireItemSheet({
  state,
  onSave,
  onClose,
}: {
  state: SheetState
  onSave: (si: number, ii: number | null, item: InventaireItem) => void
  onClose: () => void
}) {
  const [item, setItem] = useState<InventaireItem>(state.item)
  const patch = (p: Partial<InventaireItem>) => setItem(i => ({ ...i, ...p }))
  const toggleEtat = (etat: EtatPhysique) =>
    patch({ etatDeclare: item.etatDeclare === etat ? undefined : etat })
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">
            {state.itemIdx === null ? 'Nouvel élément' : 'Modifier l\'élément'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none touch-manipulation px-2"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          {/* Désignation */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Désignation</label>
            <Input
              ref={inputRef}
              value={item.designation}
              onChange={e => patch({ designation: e.target.value })}
              placeholder="Ex. Assiettes plates"
              className="text-sm h-10"
            />
          </div>

          {/* Quantité */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantité</label>
            <Input
              value={item.quantite ?? ''}
              onChange={e => patch({ quantite: e.target.value })}
              placeholder="Ex. 4, lot de 5…"
              className="text-sm h-10"
            />
          </div>

          {/* État physique */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">État déclaré</label>
            <div className="grid grid-cols-5 gap-1">
              {ETATS_PHYSIQUES.map(etat => (
                <button
                  key={etat}
                  type="button"
                  onClick={() => toggleEtat(etat)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all touch-manipulation leading-tight ${
                    item.etatDeclare === etat
                      ? ETAT_PHYSIQUE_BTN[etat]
                      : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {ETAT_PHYSIQUE_LABELS[etat]}
                </button>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observations</label>
            <textarea
              placeholder="Ex. Neuf, fixation double face…"
              value={item.observations ?? ''}
              onChange={e => patch({ observations: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[72px]"
              rows={3}
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 pb-safe">
          <Button
            className="w-full"
            onClick={() => { onSave(state.sectionIdx, state.itemIdx, item); onClose() }}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  )
}

export function StepInventaire({ value, onChange, onSaveInventaire, onNext, onBack }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(value.map((p, i) => [p.section, i === 0]))
  )
  const [sheet, setSheet] = useState<SheetState | null>(null)

  const toggleSection = (section: string) =>
    setOpenSections(s => ({ ...s, [section]: !s[section] }))

  const updateItems = (sectionIdx: number, items: InventaireItem[], persist = false) => {
    const next = [...value]
    next[sectionIdx] = { ...next[sectionIdx], items }
    onChange(next)
    if (persist) onSaveInventaire(next)
  }

  const updateAccord = (si: number, ii: number, etat: InventaireEtat) => {
    const items = [...value[si].items]
    const current = items[ii].etatEntree
    items[ii] = { ...items[ii], etatEntree: current === etat ? undefined : etat }
    updateItems(si, items, false)
  }

  const removeItem = (si: number, ii: number) => {
    updateItems(si, value[si].items.filter((_, i) => i !== ii), true)
  }

  const openEdit = (si: number, ii: number) => {
    setSheet({ sectionIdx: si, itemIdx: ii, item: { ...value[si].items[ii] } })
  }

  const openAdd = (si: number) => {
    setOpenSections(s => ({ ...s, [value[si].section]: true }))
    setSheet({ sectionIdx: si, itemIdx: null, item: newInventaireItem() })
  }

  const handleSave = (si: number, ii: number | null, item: InventaireItem) => {
    if (ii === null) {
      updateItems(si, [...value[si].items, item], true)
    } else {
      const items = [...value[si].items]
      items[ii] = item
      updateItems(si, items, true)
    }
  }

  return (
    <>
      <div className="space-y-3 pb-24">
        <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
          <span className="text-blue-600"><ClipboardList size={18} /></span>
          <h3 className="font-semibold text-gray-900">Inventaire</h3>
        </div>

        {value.map(({ section, items }, sectionIdx) => {
          const filled = items.filter(it => it.etatEntree).length
          const isOpen = openSections[section]

          return (
            <div key={section} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-4 py-3.5 touch-manipulation"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">{section}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    filled === items.length && items.length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>{filled}/{items.length}</span>
                </div>
                {isOpen
                  ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  <div className="divide-y divide-gray-50">
                    {items.map((item, itemIdx) => {
                      const etatBadgeCls = item.etatDeclare
                        ? ETAT_PHYSIQUE_BADGE[item.etatDeclare]
                        : 'bg-gray-100 text-gray-500'
                      const etatLabel = item.etatDeclare
                        ? ETAT_PHYSIQUE_LABELS[item.etatDeclare]
                        : item.observations || null

                      return (
                        <div key={item.id} className="px-3 py-2.5">
                          {/* Top row: designation info + edit + trash */}
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(sectionIdx, itemIdx)}
                              className="flex-1 flex items-center gap-2 min-w-0 text-left touch-manipulation"
                            >
                              <span className="text-sm text-gray-800 font-medium leading-snug truncate">
                                {item.designation || <span className="text-gray-400 italic">Sans titre</span>}
                              </span>
                              {item.quantite && (
                                <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                  ×{item.quantite}
                                </span>
                              )}
                              {etatLabel && (
                                <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${etatBadgeCls}`}>
                                  {etatLabel}
                                </span>
                              )}
                              <Pencil size={12} className="shrink-0 text-gray-300 ml-auto" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(sectionIdx, itemIdx)}
                              className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Bottom row: accord buttons */}
                          <div className="flex gap-1.5 mt-2">
                            {ETATS_ACCORD.map(etat => (
                              <button
                                key={etat}
                                type="button"
                                onClick={() => updateAccord(sectionIdx, itemIdx, etat)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all touch-manipulation ${
                                  item.etatEntree === etat
                                    ? INVENTAIRE_ETAT_COLORS[etat]
                                    : 'border-gray-200 text-gray-400 bg-white'
                                }`}
                              >
                                {INVENTAIRE_ETAT_LABELS[etat]}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="px-3 pb-3 pt-1">
                    <button
                      type="button"
                      onClick={() => openAdd(sectionIdx)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl"
                    >
                      <Plus size={14} />Ajouter un élément
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">Retour</Button>
          <Button onClick={onNext} className="flex-1">Récapitulatif →</Button>
        </div>
      </div>

      {sheet && (
        <InventaireItemSheet
          state={sheet}
          onSave={handleSave}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}
