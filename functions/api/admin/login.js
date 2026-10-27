import { json } from '../../../lib/security.js'
import { makeToken, sameBytes } from '../../../lib/admin-token.js'

// Reached only after _middleware.js has verified Cloudflare Access.
export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  const given = typeof body.password === 'string' ? body.password : ''
  if (!env.ADMIN_PASSWORD || !(await sameBytes(given, env.ADMIN_PASSWORD))) {
    return json({ error: 'Invalid password' }, 401)
  }
  return json({ token: await makeToken(env.ADMIN_PASSWORD) })
}
