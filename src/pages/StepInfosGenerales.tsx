import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { type InfosGenerales } from '@/types/etatDesLieux'
import { Home, User, Calendar, Key } from 'lucide-react'

interface Props {
  value: InfosGenerales
  onChange: (value: InfosGenerales) => void
  onNext: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
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

export function StepInfosGenerales({ value, onChange, onNext }: Props) {
  const set = <K extends keyof InfosGenerales>(key: K, val: InfosGenerales[K]) =>
    onChange({ ...value, [key]: val })

  const setLocataire = (key: keyof InfosGenerales['locataire'], val: string) =>
    set('locataire', { ...value.locataire, [key]: val })

  const setBailleur = (key: keyof InfosGenerales['bailleur'], val: string) =>
    set('bailleur', { ...value.bailleur, [key]: val })

  const setCompteur = (key: keyof InfosGenerales['releveCompteurs'], val: string) =>
    set('releveCompteurs', { ...value.releveCompteurs, [key]: val })

  const isValid =
    value.adresse && value.ville && value.codePostal &&
    value.locataire.nom && value.locataire.prenom &&
    value.bailleur.nom && value.bailleur.prenom

  return (
    <div className="space-y-6 pb-8">
      <Section icon={<Home size={18} />} title="Logement">
        <Field label="Adresse">
          <Input
            placeholder="12 rue de la Paix"
            value={value.adresse}
            onChange={e => set('adresse', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Code postal">
            <Input
              placeholder="75001"
              value={value.codePostal}
              inputMode="numeric"
              onChange={e => set('codePostal', e.target.value)}
            />
          </Field>
          <Field label="Ville">
            <Input
              placeholder="Paris"
              value={value.ville}
              onChange={e => set('ville', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <Input
              type="date"
              value={value.dateEtat}
              onChange={e => set('dateEtat', e.target.value)}
            />
          </Field>
          <Field label="Type">
            <div className="flex gap-2">
              {(['entree', 'sortie'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('typeMouvement', t)}
                  className={`flex-1 h-12 rounded-lg border-2 text-sm font-medium transition-all touch-manipulation ${
                    value.typeMouvement === t
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  {t === 'entree' ? 'Entrée' : 'Sortie'}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      <Section icon={<User size={18} />} title="Locataire">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <Input
              placeholder="Jean"
              value={value.locataire.prenom}
              onChange={e => setLocataire('prenom', e.target.value)}
            />
          </Field>
          <Field label="Nom">
            <Input
              placeholder="Dupont"
              value={value.locataire.nom}
              onChange={e => setLocataire('nom', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <Input
            type="email"
            placeholder="jean.dupont@email.com"
            value={value.locataire.email ?? ''}
            onChange={e => setLocataire('email', e.target.value)}
          />
        </Field>
        <Field label="Téléphone">
          <Input
            type="tel"
            placeholder="06 00 00 00 00"
            value={value.locataire.telephone ?? ''}
            onChange={e => setLocataire('telephone', e.target.value)}
          />
        </Field>
      </Section>

      <Section icon={<User size={18} />} title="Bailleur">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom">
            <Input
              placeholder="Marie"
              value={value.bailleur.prenom}
              onChange={e => setBailleur('prenom', e.target.value)}
            />
          </Field>
          <Field label="Nom">
            <Input
              placeholder="Martin"
              value={value.bailleur.nom}
              onChange={e => setBailleur('nom', e.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <Input
            type="email"
            placeholder="marie.martin@email.com"
            value={value.bailleur.email ?? ''}
            onChange={e => setBailleur('email', e.target.value)}
          />
        </Field>
      </Section>

      <Section icon={<Calendar size={18} />} title="Relevés de compteurs">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Électricité (kWh)">
            <Input
              placeholder="12345"
              inputMode="numeric"
              value={value.releveCompteurs.electricite ?? ''}
              onChange={e => setCompteur('electricite', e.target.value)}
            />
          </Field>
          <Field label="Gaz (m³)">
            <Input
              placeholder="1234"
              inputMode="numeric"
              value={value.releveCompteurs.gaz ?? ''}
              onChange={e => setCompteur('gaz', e.target.value)}
            />
          </Field>
          <Field label="Eau froide (m³)">
            <Input
              placeholder="123"
              inputMode="numeric"
              value={value.releveCompteurs.eau ?? ''}
              onChange={e => setCompteur('eau', e.target.value)}
            />
          </Field>
          <Field label="Eau chaude (m³)">
            <Input
              placeholder="123"
              inputMode="numeric"
              value={value.releveCompteurs.eau_chaude ?? ''}
              onChange={e => setCompteur('eau_chaude', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section icon={<Key size={18} />} title="Remises de clés">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre de clés">
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              value={value.nombreCles}
              onChange={e => set('nombreCles', Number(e.target.value))}
            />
          </Field>
          <Field label="Nombre de badges">
            <Input
              type="number"
              min="0"
              inputMode="numeric"
              value={value.nombreBadges}
              onChange={e => set('nombreBadges', Number(e.target.value))}
            />
          </Field>
        </div>
      </Section>

      <Button
        className="w-full"
        size="lg"
        onClick={onNext}
        disabled={!isValid}
      >
        Continuer → Ajouter les pièces
      </Button>
    </div>
  )
}
