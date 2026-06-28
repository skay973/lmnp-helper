import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import _sodium from 'libsodium-wrappers'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const env = {}
readFileSync(resolve(root, '.env'), 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k?.trim()) env[k.trim()] = v.join('=').trim()
})

const GITHUB_TOKEN = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN
const REPO = 'skay973/lmnp-helper'

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN manquant dans .env')
  console.error('   → GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token')
  console.error('   → Permissions : Repository secrets (read & write)')
  process.exit(1)
}

const secrets = {
  VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
}

await _sodium.ready
const sodium = _sodium

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
}

// Récupérer la clé publique du repo
const keyRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, { headers })
const { key, key_id } = await keyRes.json()

async function encryptSecret(value) {
  const keyBytes = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const valueBytes = sodium.from_string(value)
  const encrypted = sodium.crypto_box_seal(valueBytes, keyBytes)
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL)
}

for (const [name, value] of Object.entries(secrets)) {
  const encrypted_value = await encryptSecret(value)
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ encrypted_value, key_id }),
  })
  if (res.status === 201 || res.status === 204) {
    console.log(`✅ Secret défini : ${name}`)
  } else {
    const err = await res.json()
    console.error(`❌ Erreur pour ${name}:`, err.message)
  }
}

console.log('\n🚀 Relance du workflow...')
const dispatchRes = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/deploy.yml/dispatches`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ ref: 'master' }),
})
console.log(dispatchRes.status === 204 ? '✅ Workflow déclenché !' : `❌ Status: ${dispatchRes.status}`)
