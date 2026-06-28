import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Trash2, Plus, Pencil } from 'lucide-react'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { type ElementEtat, type Etat, ETAT_LABELS, ETAT_COLORS } from '@/types/etatDesLieux'
import { cn } from '@/lib/utils'

interface ElementsListProps {
  elements: Record<string, ElementEtat>
  onChange: (elements: Record<string, ElementEtat>) => void
  onStructureChange?: (elements: Record<string, ElementEtat>) => void
}

function ElementNameSheet({
  initial,
  onSave,
  onClose,
}: {
  initial: string
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [])
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">
            {initial ? 'Renommer l\'élément' : 'Nouvel élément'}
          </h3>
          <button type="button" onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none touch-manipulation px-2">×</button>
        </div>
        <div className="px-4 py-4 space-y-4">
          <Input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex. Fenêtre, Radiateur…"
            className="text-sm h-10"
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onSave(name.trim()); onClose() } }}
          />
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => { onSave(name.trim()); onClose() }}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  )
}

export function ElementsList({ elements, onChange, onStructureChange }: ElementsListProps) {
  const [openComment, setOpenComment] = useState<string | null>(null)
  const [sheet, setSheet] = useState<{ mode: 'add' | 'rename'; key: string } | null>(null)

  const setEtat = (key: string, etat: Etat) => {
    const updated = { ...elements, [key]: { ...elements[key], etat } }
    onChange(updated)
    if (etat === 'mauvais') setOpenComment(key)
  }

  const setCommentaire = (key: string, commentaire: string) => {
    onChange({ ...elements, [key]: { ...elements[key], commentaire } })
  }

  const addElement = (name: string) => {
    if (!name || elements[name] !== undefined) return
    const updated = { ...elements, [name]: {} }
    onChange(updated)
    onStructureChange?.(updated)
  }

  const renameElement = (oldKey: string, newKey: string) => {
    if (!newKey || newKey === oldKey) return
    const entries = Object.entries(elements)
    const idx = entries.findIndex(([k]) => k === oldKey)
    entries[idx] = [newKey, elements[oldKey]]
    const updated = Object.fromEntries(entries)
    onChange(updated)
    onStructureChange?.(updated)
    if (openComment === oldKey) setOpenComment(newKey)
  }

  const removeElement = (key: string) => {
    const { [key]: _removed, ...updated } = elements
    onChange(updated)
    onStructureChange?.(updated)
    if (openComment === key) setOpenComment(null)
  }

  return (
    <>
      <div className="space-y-2">
        {Object.entries(elements).map(([key, val]) => (
          <div
            key={key}
            className={cn(
              'rounded-xl border-2 bg-white overflow-hidden transition-colors',
              val.etat === 'mauvais' ? 'border-red-300' :
              val.etat === 'bon' ? 'border-green-300' :
              val.etat === 'usage' ? 'border-yellow-300' :
              'border-gray-200'
            )}
          >
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{key}</span>
                <button
                  type="button"
                  onClick={() => setSheet({ mode: 'rename', key })}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors touch-manipulation shrink-0"
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenComment(openComment === key ? null : key)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors shrink-0 touch-manipulation',
                    openComment === key || val.commentaire
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-300 hover:text-gray-500'
                  )}
                >
                  <MessageSquare size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => removeElement(key)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors touch-manipulation shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(ETAT_LABELS) as Etat[]).map((etat) => (
                  <button
                    key={etat}
                    type="button"
                    onClick={() => setEtat(key, etat)}
                    className={cn(
                      'rounded-lg border-2 py-2 text-xs font-semibold transition-all touch-manipulation active:scale-95',
                      val.etat === etat
                        ? ETAT_COLORS[etat] + ' shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                    )}
                  >
                    {ETAT_LABELS[etat]}
                  </button>
                ))}
              </div>
            </div>

            {(openComment === key || val.commentaire) && (
              <div className="px-3 pb-3">
                <Textarea
                  placeholder="Précisions..."
                  value={val.commentaire ?? ''}
                  onChange={e => setCommentaire(key, e.target.value)}
                  className="w-full text-sm min-h-[56px] bg-gray-50 resize-none"
                />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setSheet({ mode: 'add', key: '' })}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl"
        >
          <Plus size={14} />Ajouter un élément
        </button>
      </div>

      {sheet && (
        <ElementNameSheet
          initial={sheet.mode === 'rename' ? sheet.key : ''}
          onSave={name => {
            if (sheet.mode === 'add') addElement(name)
            else renameElement(sheet.key, name)
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}
