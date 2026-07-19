import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function env(name, fallback = '') {
  return (process.env[name] || fallback).trim()
}

const cfg = {
  apiKey: env('VITE_FIREBASE_API_KEY', 'AIzaSyBq-jO-0acTpRr0DESA27CKvNMCzEHESlc'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN', 'studio9-medical.firebaseapp.com'),
  projectId: env('VITE_FIREBASE_PROJECT_ID', 'studio9-medical'),
  appId: env('VITE_FIREBASE_APP_ID', '1:872255591899:web:f21955ad7e22bc42af83fe'),
}

const out = `window.STUDIO9_FIREBASE = ${JSON.stringify(cfg, null, 2)};\n`
for (const dir of ['public', 'Public']) {
  const folder = path.join(__dirname, '..', dir)
  if (!fs.existsSync(folder)) continue
  const target = path.join(folder, 'firebase-config.js')
  fs.writeFileSync(target, out, 'utf8')
  console.log('Wrote', target)
}
