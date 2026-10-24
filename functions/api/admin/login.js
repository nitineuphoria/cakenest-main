export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!body.password || body.password !== env.ADMIN_PASSWORD) {
    return json({ error: 'Invalid password' }, 401)
  }
  const token = await makeToken(env.ADMIN_PASSWORD)
  return json({ token })
}

async function makeToken(password) {
  const week = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('cakenest-admin:' + week))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
