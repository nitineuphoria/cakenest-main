// Admin session tokens: HMAC of the admin password and the UTC day.
// A token works for the day it was issued and the next day only (at most 48 hours).
// Changing ADMIN_PASSWORD signs everyone out immediately.

const DAY = 86400000

export async function makeToken(password, day = Math.floor(Date.now() / DAY)) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('cakenest-admin-day:' + day))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

export async function verifyToken(token, password) {
  if (!token || !password) return false
  const today = Math.floor(Date.now() / DAY)
  for (let i = 0; i <= 1; i++) {
    if (await sameBytes(token, await makeToken(password, today - i))) return true
  }
  return false
}

// Constant-time comparison (compares SHA-256 digests so lengths never leak).
export async function sameBytes(a, b) {
  const h = async (s) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s))))
  const [ha, hb] = await Promise.all([h(a), h(b)])
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i]
  return diff === 0
}
