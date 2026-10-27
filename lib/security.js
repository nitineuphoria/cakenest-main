// Shared security helpers for Pages Functions.
// Lives outside functions/ so it is bundled as a module, not exposed as a route.

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra }
  })
}

// Local development (`wrangler pages dev`) has no Cloudflare Access in front of it.
// Requests through Cloudflare's edge can never carry a localhost hostname, so this is safe in production.
export function isLocal(url) {
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1'
}

/* ---------- Cloudflare Access ---------- */

const b64urlToBytes = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
}
const b64urlToJson = (s) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)))

let certCache = { team: '', keys: null, at: 0 }

async function accessKeys(team, fetcher, force = false) {
  const fresh = certCache.team === team && certCache.keys && Date.now() - certCache.at < 60 * 60 * 1000
  if (fresh && !force) return certCache.keys
  const r = await fetcher(`https://${team}/cdn-cgi/access/certs`)
  if (!r.ok) throw new Error('certs ' + r.status)
  const { keys } = await r.json()
  certCache = { team, keys: keys || [], at: Date.now() }
  return certCache.keys
}

function readCookie(header, name) {
  const m = (header || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return m ? m[1] : ''
}

/**
 * Verifies the JWT that Cloudflare Access adds to every request it lets through.
 * env.ACCESS_TEAM_DOMAIN — e.g. "cakenest.cloudflareaccess.com"
 * env.ACCESS_AUD        — the Application Audience (AUD) tag of the Access application
 * Fails closed: if either is missing or the token is invalid, access is denied.
 */
export async function verifyAccess(request, env, fetcher = fetch) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '')
  const aud = env.ACCESS_AUD || ''
  if (!team || !aud) return { ok: false, reason: 'not-configured' }

  const token = request.headers.get('Cf-Access-Jwt-Assertion') || readCookie(request.headers.get('Cookie'), 'CF_Authorization')
  if (!token) return { ok: false, reason: 'no-token' }

  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, reason: 'malformed' }
  let header, payload
  try { header = b64urlToJson(parts[0]); payload = b64urlToJson(parts[1]) } catch { return { ok: false, reason: 'malformed' } }
  if (header.alg !== 'RS256') return { ok: false, reason: 'alg' }

  let keys
  try { keys = await accessKeys(team, fetcher) } catch { return { ok: false, reason: 'certs-unavailable' } }
  let jwk = keys.find((k) => k.kid === header.kid)
  if (!jwk) { // keys rotate — refresh once
    try { keys = await accessKeys(team, fetcher, true) } catch { return { ok: false, reason: 'certs-unavailable' } }
    jwk = keys.find((k) => k.kid === header.kid)
  }
  if (!jwk) return { ok: false, reason: 'unknown-key' }

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]))
  if (!valid) return { ok: false, reason: 'signature' }

  const now = Math.floor(Date.now() / 1000)
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!auds.includes(aud)) return { ok: false, reason: 'audience' }
  if (payload.iss !== `https://${team}`) return { ok: false, reason: 'issuer' }
  if (!payload.exp || payload.exp < now - 30) return { ok: false, reason: 'expired' }
  if (payload.nbf && payload.nbf > now + 30) return { ok: false, reason: 'not-yet-valid' }

  return { ok: true, email: payload.email || '' }
}

/* ---------- Cloudflare Turnstile ---------- */

export async function verifyTurnstile(token, ip, env, url, fetcher = fetch) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return isLocal(url) ? { ok: true, skipped: true } : { ok: false, reason: 'not-configured' }
  }
  if (!token || typeof token !== 'string' || token.length > 2048) return { ok: false, reason: 'missing-token' }
  const body = new FormData()
  body.append('secret', env.TURNSTILE_SECRET_KEY)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  try {
    const r = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const d = await r.json()
    return d.success ? { ok: true } : { ok: false, reason: (d['error-codes'] || []).join(',') || 'failed' }
  } catch {
    return { ok: false, reason: 'verify-unavailable' }
  }
}

/* ---------- CV files ---------- */

const CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

const startsWith = (bytes, sig) => sig.every((b, i) => bytes[i] === b)

/**
 * Checks what the file really is from its first bytes, not from the browser's label.
 * Returns { ext, type } for a genuine PDF / Word file whose extension matches, otherwise null.
 */
export function sniffCv(bytes, filename) {
  const ext = (String(filename || '').toLowerCase().match(/\.([a-z0-9]+)$/) || [])[1]
  if (!ext || !CV_TYPES[ext]) return null
  if (ext === 'pdf' && startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { ext, type: CV_TYPES.pdf } // %PDF-
  if (ext === 'doc' && startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return { ext, type: CV_TYPES.doc } // OLE2
  if (ext === 'docx' && startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) { // ZIP — must contain a Word document part
    const text = new TextDecoder('latin1').decode(bytes)
    if (text.includes('word/document.xml') || text.includes('[Content_Types].xml')) return { ext, type: CV_TYPES.docx }
  }
  return null
}

/** A filename that is safe to store and to put in a download header. */
export function safeFileName(name, ext) {
  const base = String(name || '').replace(/\.[^.]*$/, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^[._]+|[._]+$/g, '').slice(0, 80)
  return (base || 'cv') + (ext ? '.' + ext : '')
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
