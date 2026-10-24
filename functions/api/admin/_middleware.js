export async function onRequest({ request, env, next }) {
  const url = new URL(request.url)
  if (url.pathname === '/api/admin/login') return next()

  const auth = request.headers.get('Authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token || !env.ADMIN_PASSWORD || !await verify(token, env.ADMIN_PASSWORD)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  return next()
}

async function verify(token, password) {
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))
  for (let i = 0; i <= 1; i++) {
    if (token === await makeToken(password, week - i)) return true
  }
  return false
}

async function makeToken(password, week) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('cakenest-admin:' + week))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}
