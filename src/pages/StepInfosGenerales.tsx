import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { type InfosGenerales } from '@/types/etatDesLieux'
import { type CleItem } from '@/types/appartement'
import { Home, User, Zap, Droplets, Key, CalendarDays } from 'lucide-react'

interface Props {
  value: InfosGenerales
  onChange: (value: InfosGenerales) => void
  onNext: () => void
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
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

function CleStepper({ item, onChange }: { item: CleItem; onChange: (item: CleItem) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
      <span className="text-sm text-gray-800 flex-1">{item.type}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...item, nombre: Math.max(0, item.nombre - 1) })}
          className="w-9 h-9 rounded-full bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg flex items-center justify-center touch-manipulation active:scale-95"
        >−</button>
        <span className="w-6 text-center font-bold text-gray-900 text-lg">{item.nombre}</span>
        <button
          type="button"
          onClick={() => onChange({ ...item, nombre: item.nombre + 1 })}
          className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center touch-manipulation active:scale-95"
        >+</button>
      </div>
    </div>
  )
}

export function StepInfosGenerales({ value, onChange, onNext }: Props) {
  const set = <K extends keyof InfosGenerales>(key: K, val: InfosGenerales[K]) =>
    onChange({ ...value, [key]: val })

  const setLocataire = (key: keyof InfosGenerales['locataire'], val: string) =>
    set('locataire', { ...value.locataire, [key]: val })

  const setCompteur = (key: keyof InfosGenerales['releveCompteurs'], val: string) =>
    set('releveCompteurs', { ...value.releveCompteurs, [key]: val })

  const updateCle = (index: number, item: CleItem) => {
    const cles = [...value.cles]
    cles[index] = item
    set('cles', cles)
  }

  const isValid =
    value.locataire.nom.trim() &&
    value.locataire.prenom.trim() &&
    value.dateEtat

  return (
    <div className="space-y-6 pb-24">

      {/* Type de mouvement */}
      <div className="flex gap-3">
        {(['entree', 'sortie'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('typeMouvement', t)}
            className={`flex-1 h-14 rounded-2xl border-2 text-base font-bold transition-all touch-manipulation ${
              value.typeMouvement === t
                ? t === 'entree'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-500 bg-white'
            }`}
          >
            {t === 'entree' ? '↓ Entrée' : '↑ Sortie'}
          </button>
        ))}
      </div>

      {/* Calendrier */}
      <Section icon={<CalendarDays size={18} />} title="Calendrier">
        <Field label="Date de l'état des lieux">
          <Input
            type="date"
            value={value.dateEtat}
            onChange={e => set('dateEtat', e.target.value)}
          />
        </Field>
        {value.bail !== undefined && (
          <>
            <Field label="Début du bail">
              <Input
                type="date"
                value={value.bail?.dateDebut ?? ''}
                onChange={e => set('bail', { ...value.bail, dateDebut: e.target.value })}
              />
            </Field>
            <Field label="Durée du bail">
              <Input
                placeholder="1 an"
                value={value.bail?.duree ?? ''}
                onChange={e => set('bail', { ...value.bail, duree: e.target.value })}
              />
            </Field>
          </>
        )}
      </Section>

      {/* Logement */}
      <Section icon={<Home size={18} />} title="Logement">
        <Field label="Adresse">
          <Input value={value.adresse} readOnly className="bg-gray-50 text-gray-600" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code postal">
            <Input value={value.codePostal} readOnly className="bg-gray-50 text-gray-600" />
          </Field>
          <Field label="Ville">
            <Input value={value.ville} readOnly className="bg-gray-50 text-gray-600" />
          </Field>
        </div>
        {value.identifiantFiscal && (
          <Field label="Identifiant fiscal">
            <Input value={value.identifiantFiscal} readOnly className="bg-gray-50 text-gray-600 font-mono text-sm" />
          </Field>
        )}
      </Section>

      {/* Locataire */}
      <Section icon={<User size={18} />} title="Locataire">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <Input
              placeholder="Prénom"
              value={value.locataire.prenom}
              autoComplete="given-name"
              onChange={e => setLocataire('prenom', e.target.value)}
            />
          </Field>
          <Field label="Nom">
            <Input
              placeholder="Nom"
              value={value.locataire.nom}
              autoComplete="family-name"
              onChange={e => setLocataire('nom', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <Input
            type="email"
            placeholder="email@exemple.com"
            value={value.locataire.email ?? ''}
            autoComplete="email"
            onChange={e => setLocataire('email', e.target.value)}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            type="tel"
            placeholder="06 00 00 00 00"
            value={value.locataire.telephone ?? ''}
            autoComplete="tel"
            inputMode="tel"
            onChange={e => setLocataire('telephone', e.target.value)}
          />
        </Field>
      </Section>

      {/* Électricité */}
      <Section icon={<Zap size={18} />} title="Électricité">
        <Field label="N° compteur (PDL)" hint="Référence de 14 chiffres sur votre facture">
          <Input
            placeholder="00 000 000 000 000"
            inputMode="numeric"
            value={value.releveCompteurs.electricite_pdl ?? ''}
            onChange={e => setCompteur('electricite_pdl', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Heures pleines (kWh)">
            <Input
              placeholder="00000"
              inputMode="numeric"
              value={value.releveCompteurs.electricite_hp ?? ''}
              onChange={e => setCompteur('electricite_hp', e.target.value)}
            />
          </Field>
          <Field label="Heures creuses (kWh)">
            <Input
              placeholder="00000"
              inputMode="numeric"
              value={value.releveCompteurs.electricite_hc ?? ''}
              onChange={e => setCompteur('electricite_hc', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Eau */}
      <Section icon={<Droplets size={18} />} title="Eau">
        <Field label="N° compteur eau">
          <Input
            placeholder="_______________"
            value={value.releveCompteurs.eau_numero ?? ''}
            onChange={e => setCompteur('eau_numero', e.target.value)}
          />
        </Field>
        <Field label="Eau froide (m³)">
          <Input
            placeholder="000"
            inputMode="decimal"
            value={value.releveCompteurs.eau_froide ?? ''}
            onChange={e => setCompteur('eau_froide', e.target.value)}
          />
        </Field>
      </Section>

      {/* Clés */}
      <Section icon={<Key size={18} />} title="Remise des clés">
        <div className="space-y-2">
          {value.cles.map((cle, i) => (
            <CleStepper key={i} item={cle} onChange={item => updateCle(i, item)} />
          ))}
        </div>
      </Section>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button className="w-full" size="lg" onClick={onNext} disabled={!isValid}>
            Continuer → Pièces
          </Button>
        </div>
      </div>
    </div>
  )
}
