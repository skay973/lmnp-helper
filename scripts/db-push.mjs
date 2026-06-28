import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')

// Lire le .env
const env = {}
try {
  readFileSync(resolve(root, '.env'), 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) env[k.trim()] = v.join('=').trim()
  })
} catch {
  console.error('❌ Fichier .env introuvable')
  process.exit(1)
}

const { SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, VITE_SUPABASE_URL } = env

if (!VITE_SUPABASE_URL || !SUPABASE_ACCESS_TOKEN || !SUPABASE_DB_PASSWORD) {
  console.error('❌ Variables manquantes dans .env : VITE_SUPABASE_URL, SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD')
  process.exit(1)
}

const projectRef = new URL(VITE_SUPABASE_URL).hostname.split('.')[0]
const sharedEnv = { ...process.env, SUPABASE_ACCESS_TOKEN }
const opts = { cwd: root, env: sharedEnv, stdio: 'pipe', encoding: 'utf8' }

const run = (cmd) => execSync(cmd, opts)

const isStatus = process.argv[2] === 'status'
console.log(`🚀 Project: ${projectRef}`)

try {
  // Lier le projet si pas encore fait
  console.log('🔗 Liaison au projet Supabase...')
  run(`npx supabase link --project-ref ${projectRef} --password ${SUPABASE_DB_PASSWORD}`)

  if (isStatus) {
    console.log('📋 Statut des migrations...')
    console.log(run('npx supabase migration list --linked'))
  } else {
    console.log('⬆️  Push des migrations...')
    console.log(run(`npx supabase db push --linked --password ${SUPABASE_DB_PASSWORD}`))
    console.log('✅ Migrations appliquées !')
  }
} catch (err) {
  console.error('❌ Erreur:', err.stderr || err.stdout || err.message)
  process.exit(1)
}
