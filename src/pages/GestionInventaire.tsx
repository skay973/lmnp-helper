import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil } from 'lucide-react'
import {
  type Inventaire, type InventaireItem, type EtatPhysique,
  ETAT_PHYSIQUE_LABELS, ETAT_PHYSIQUE_BADGE, ETAT_PHYSIQUE_BTN,
  newInventaireItem,
} from '@/types/inventaire'

interface Props {
  inventaire: Inventaire
  onSave: (inventaire: Inventaire) => Promise<void>
  onBack: () => void
}

const ETATS_PHYSIQUES: EtatPhysique[] = ['neuf', 'tres_bon', 'bon', 'usage', 'mauvais']

interface SheetState {
  sectionIdx: number
  itemIdx: number | null
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
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">
            {state.itemIdx === null ? 'Nouvel élément' : "Modifier l'élément"}
          </h3>
          <button type="button" onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none touch-manipulation px-2">×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-4">
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
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantité</label>
            <Input
              value={item.quantite ?? ''}
              onChange={e => patch({ quantite: e.target.value })}
              placeholder="Ex. 4, lot de 5…"
              className="text-sm h-10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">État déclaré</label>
            <div className="grid grid-cols-5 gap-1">
              {ETATS_PHYSIQUES.map(etat => (
                <button key={etat} type="button" onClick={() => toggleEtat(etat)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all touch-manipulation leading-tight ${
                    item.etatDeclare === etat ? ETAT_PHYSIQUE_BTN[etat] : 'border-gray-200 text-gray-400 bg-white'
                  }`}>
                  {ETAT_PHYSIQUE_LABELS[etat]}
                </button>
              ))}
            </div>
          </div>
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

        <div className="px-4 py-3 border-t border-gray-100">
          <Button className="w-full"
            onClick={() => { onSave(state.sectionIdx, state.itemIdx, item); onClose() }}>
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  )
}

export function GestionInventaire({ inventaire, onSave, onBack }: Props) {
  const [local, setLocal] = useState<Inventaire>(inventaire)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(local.map((p, i) => [p.section, i === 0]))
  )
  const [sheet, setSheet] = useState<SheetState | null>(null)

  const toggleSection = (section: string) =>
    setOpenSections(s => ({ ...s, [section]: !s[section] }))

  const persist = (next: Inventaire) => {
    setLocal(next)
    onSave(next)
  }

  const updateItems = (si: number, items: InventaireItem[]) => {
    const next = [...local]
    next[si] = { ...next[si], items }
    persist(next)
  }

  const removeItem = (si: number, ii: number) =>
    updateItems(si, local[si].items.filter((_, i) => i !== ii))

  const handleSave = (si: number, ii: number | null, item: InventaireItem) => {
    if (ii === null) {
      updateItems(si, [...local[si].items, item])
    } else {
      const items = [...local[si].items]
      items[ii] = item
      updateItems(si, items)
    }
  }

  const openEdit = (si: number, ii: number) =>
    setSheet({ sectionIdx: si, itemIdx: ii, item: { ...local[si].items[ii] } })

  const openAdd = (si: number) => {
    setOpenSections(s => ({ ...s, [local[si].section]: true }))
    setSheet({ sectionIdx: si, itemIdx: null, item: newInventaireItem() })
  }

  return (
    <>
      <div className="space-y-3 pb-8">
        {local.map(({ section, items }, si) => {
          const declared = items.filter(it => it.etatDeclare).length
          const isOpen = openSections[section]

          return (
            <div key={section} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between px-4 py-3.5 touch-manipulation">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">{section}</span>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    declared === items.length && items.length > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>{declared}/{items.length}</span>
                </div>
                {isOpen
                  ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100">
                  <div className="divide-y divide-gray-50">
                    {items.map((item, ii) => {
                      const etatBadgeCls = item.etatDeclare
                        ? ETAT_PHYSIQUE_BADGE[item.etatDeclare]
                        : 'bg-gray-100 text-gray-500'
                      const etatLabel = item.etatDeclare
                        ? ETAT_PHYSIQUE_LABELS[item.etatDeclare]
                        : item.observations || null

                      return (
                        <div key={item.id} className="px-3 py-2.5 flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(si, ii)}
                            className="flex-1 flex items-center gap-2 min-w-0 text-left touch-manipulation">
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
                          <button type="button" onClick={() => removeItem(si, ii)}
                            className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors touch-manipulation">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="px-3 pb-3 pt-1">
                    <button type="button" onClick={() => openAdd(si)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl">
                      <Plus size={14} />Ajouter un élément
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <Button variant="outline" onClick={onBack} className="w-full mt-2">
          Retour à l'appartement
        </Button>
      </div>

      {sheet && (
        <InventaireItemSheet state={sheet} onSave={handleSave} onClose={() => setSheet(null)} />
      )}
    </>
  )
}
