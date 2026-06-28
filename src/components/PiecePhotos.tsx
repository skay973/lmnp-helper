import { useRef, useState, useEffect } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { compressPhoto } from '@/lib/compressPhoto'

interface Props {
  photos: string[]
  userId: string
  onChange: (photos: string[]) => void
}

function PhotoThumb({ path, onRemove }: { path: string; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    supabase.storage.from('edl-photos').createSignedUrl(path, 3600).then(({ data }) => {
      if (data) setUrl(data.signedUrl)
    })
  }, [path])

  if (!url) return <div className="aspect-square bg-gray-100 rounded-xl animate-pulse" />

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
      <img src={url} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 touch-manipulation"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export function PiecePhotos({ photos, userId, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const blob = await compressPhoto(file)
      const path = `${userId}/${Date.now()}.jpg`
      const { error } = await supabase.storage.from('edl-photos').upload(path, blob, { contentType: 'image/jpeg' })
      if (!error) onChange([...photos, path])
    } finally {
      setUploading(false)
    }
  }

  const remove = async (path: string) => {
    await supabase.storage.from('edl-photos').remove([path])
    onChange(photos.filter(p => p !== path))
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Photos</p>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map(path => (
            <PhotoThumb key={path} path={path} onRemove={() => remove(path)} />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors touch-manipulation border border-dashed border-blue-200 rounded-xl disabled:opacity-50"
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        {uploading ? 'Upload en cours…' : 'Prendre une photo'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
