import { useState, useRef, useEffect } from 'react'
import { type PieceStock } from '@/types/appartement'
import { type TypePiece, TYPE_PIECE_LABELS, ELEMENTS_PAR_TYPE_PIECE } from '@/types/etatDesLieux'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil, ArrowUp, ArrowDown, LayoutGrid } from 'lucide-react'

const TYPES_COMMUNS: TypePiece[] = ['entree', 'wc', 'salon', 'cuisine', 'balcon', 'chambre', 'salle_de_bain']
const TYPES_AUTRES: TypePiece[] = ['salle_a_manger', 'bureau', 'couloir', 'cave', 'garage', 'autre']

interface Props {
  pieces: PieceStock[]
  onSave: (pieces: PieceStock[]) => Promise<void>
  onBack: () => void
}

function NameSheet({
  initial,
  title,
  onSave,
  onClose,
}: {
  initial: string
  title: string
  onSave: (v: string) => void
  onClose: () => void
}) {
  const [val, setVal] = useState(initial)
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [])
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <button type="button" onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none touch-manipulation px-2">×</button>
        </div>
        <div className="px-4 py-4 space-y-4">
          <Input
            ref={inputRef}
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="Nom..."
            className="text-sm h-10"
            onKeyDown={e => { if (e.key === 'Enter' && val.trim()) { onSave(val.trim()); onClose() } }}
          />
          <Button className="w-full" disabled={!val.trim()} onClick={() => { onSave(val.trim()); onClose() }}>
            Enregistrer
          </Button>
        </div>
      </div>
    </>
  )
}

export function GestionModele({ pieces, onSave, onBack }: Props) {
  const [local, setLocal] = useState<PieceStock[]>(pieces)
  const [openPieces, setOpenPieces] = useState<Record<number, boolean>>({})
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [nameSheet, setNameSheet] = useState<{
    type: 'piece' | 'element'
    pieceIdx: number
    elemIdx?: number
    initial: string
    title: string
  } | null>(null)

  const persist = (next: PieceStock[]) => { setLocal(next); onSave(next) }

  const moveUp = (i: number) => {
    if (i === 0) return
    const next = [...local];
    [next[i - 1], next[i]] = [next[i], next[i - 1]]
    persist(next)
  }

  const moveDown = (i: number) => {
    if (i === local.length - 1) return
    const next = [...local];
    [next[i], next[i + 1]] = [next[i + 1], next[i]]
    persist(next)
  }

  const addPiece = (type: TypePiece) => {
    const count = local.filter(p => p.type === type).length
    const nom = count === 0 ? TYPE_PIECE_LABELS[type] : `${TYPE_PIECE_LABELS[type]} ${count + 1}`
    const elementKeys = [...(ELEMENTS_PAR_TYPE_PIECE[type] ?? [])]
    const next = [...local, { type, nom, elementKeys }]
    persist(next)
    setShowTypeModal(false)
    setOpenPieces(s => ({ ...s, [next.length - 1]: true }))
  }

  const renamePiece = (i: number, nom: string) => {
    const next = [...local]; next[i] = { ...next[i], nom }; persist(next)
  }

  const deletePiece = (i: number) => {
    persist(local.filter((_, idx) => idx !== i))
    setOpenPieces(s => {
      const next: Record<number, boolean> = {}
      Object.entries(s).forEach(([k, v]) => {
        const ki = parseInt(k)
        if (ki < i) next[ki] = v
        else if (ki > i) next[ki - 1] = v
      })
      return next
    })
  }

  const addElement = (pi: number, name: string) => {
    const next = [...local]
    next[pi] = { ...next[pi], elementKeys: [...(next[pi].elementKeys ?? []), name] }
    persist(next)
  }

  const renameElement = (pi: number, ei: number, name: string) => {
    const next = [...local]
    const keys = [...(next[pi].elementKeys ?? [])]
    keys[ei] = name
    next[pi] = { ...next[pi], elementKeys: keys }
    persist(next)
  }

  const deleteElement = (pi: number, ei: number) => {
    const next = [...local]
    next[pi] = { ...next[pi], elementKeys: (next[pi].elementKeys ?? []).filter((_, i) => i !== ei) }
    persist(next)
  }

  return (
    <>
      <div className="space-y-3 pb-24">
        <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
          <span className="text-blue-600"><LayoutGrid size={18} /></span>
          <h3 className="font-semibold text-gray-900">Modèle des pièces</h3>
        </div>

        {local.map((piece, pi) => {
          const isOpen = !!openPieces[pi]
          const elements = piece.elementKeys ?? []

          return (
            <div key={pi} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center px-3 py-3 gap-1">
                {/* Reorder */}
                <div className="flex flex-col mr-1">
                  <button type="button" onClick={() => moveUp(pi)} disabled={pi === 0}
                    className="p-1 text-gray-300 disabled:opacity-25 hover:text-gray-600 touch-manipulation">
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveDown(pi)} disabled={pi === local.length - 1}
                    className="p-1 text-gray-300 disabled:opacity-25 hover:text-gray-600 touch-manipulation">
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Toggle expand */}
                <button type="button"
                  onClick={() => setOpenPieces(s => ({ ...s, [pi]: !s[pi] }))}
                  className="flex-1 flex items-center gap-2 text-left touch-manipulation min-w-0">
                  <span className="font-semibold text-gray-900 text-sm truncate">{piece.nom}</span>
                  <span className="text-xs text-gray-400 shrink-0">{elements.length} él.</span>
                  {isOpen
                    ? <ChevronUp size={15} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
                </button>

                {/* Rename + delete */}
                <button type="button"
                  onClick={() => setNameSheet({ type: 'piece', pieceIdx: pi, initial: piece.nom, title: 'Renommer la pièce' })}
                  className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg touch-manipulation">
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => deletePiece(pi)}
                  className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg touch-manipulation">
                  <Trash2 size={13} />
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 px-3 pb-3 pt-2 space-y-1.5">
                  {elements.map((key, ei) => (
                    <div key={ei} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50">
                      <span className="flex-1 text-sm text-gray-700 truncate">{key}</span>
                      <button type="button"
                        onClick={() => setNameSheet({ type: 'element', pieceIdx: pi, elemIdx: ei, initial: key, title: "Renommer l'élément" })}
                        className="p-1 text-gray-300 hover:text-blue-500 touch-manipulation">
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => deleteElement(pi, ei)}
                        className="p-1 text-gray-300 hover:text-red-400 touch-manipulation">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setNameSheet({ type: 'element', pieceIdx: pi, elemIdx: undefined, initial: '', title: 'Nouvel élément' })}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl mt-1">
                    <Plus size={14} />Ajouter un élément
                  </button>
                </div>
              )}
            </div>
          )
        })}

        <button type="button" onClick={() => setShowTypeModal(true)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl">
          <Plus size={14} />Ajouter une pièce
        </button>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button variant="outline" onClick={onBack} className="w-full">Retour à l'appartement</Button>
        </div>
      </div>

      {/* Type picker modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowTypeModal(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Ajouter une pièce</h3>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Principales</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_COMMUNS.map(type => (
                  <button key={type} type="button" onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors">
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Autres</p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES_AUTRES.map(type => (
                  <button key={type} type="button" onClick={() => addPiece(type)}
                    className="p-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-800 text-left hover:border-blue-400 hover:bg-blue-50 touch-manipulation transition-colors">
                    {TYPE_PIECE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => setShowTypeModal(false)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Name sheet */}
      {nameSheet && (
        <NameSheet
          initial={nameSheet.initial}
          title={nameSheet.title}
          onSave={v => {
            if (nameSheet.type === 'piece') renamePiece(nameSheet.pieceIdx, v)
            else if (nameSheet.elemIdx !== undefined) renameElement(nameSheet.pieceIdx, nameSheet.elemIdx, v)
            else addElement(nameSheet.pieceIdx, v)
          }}
          onClose={() => setNameSheet(null)}
        />
      )}
    </>
  )
}
