import { verifyAccess, isLocal, json } from '../../../lib/security.js'
import { verifyToken } from '../../../lib/admin-token.js'

// Every /api/admin/* request must pass two checks:
// 1. Cloudflare Access — the visitor signed in with a one-time code sent to an approved email.
//    Checked here as well, so the API stays locked on cakenest-main.pages.dev and preview URLs too.
// 2. The admin password token issued by /api/admin/login.
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url)

  if (!isLocal(url)) {
    const access = await verifyAccess(request, env)
    if (!access.ok) return json({ error: 'Forbidden' }, 403)
  }

  if (url.pathname !== '/api/admin/login') {
    const auth = request.headers.get('Authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!(await verifyToken(token, env.ADMIN_PASSWORD))) return json({ error: 'Unauthorized' }, 401)
  }

  const res = await next()
  const out = new Response(res.body, res)
  out.headers.set('Cache-Control', 'no-store')
  out.headers.set('X-Robots-Tag', 'noindex')
  return out
}
