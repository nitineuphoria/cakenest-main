import { json } from '../../../lib/security.js'

// Retention (see /privacy): applications and CVs are deleted 12 months after they were submitted,
// unless the applicant was selected. Runs whenever the admin opens the Applications list.
async function purgeExpired(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, cv_key FROM applications WHERE created_at < datetime('now', '-365 days') AND status != 'selected'"
  ).all()
  for (const row of results || []) {
    if (row.cv_key) { try { await env.R2.delete(row.cv_key) } catch {} }
    await env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(row.id).run()
  }
}

export async function onRequestGet({ request, env }) {
  try { await purgeExpired(env) } catch {}

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || ''
  const jobId  = url.searchParams.get('job') || ''

  let q = 'SELECT * FROM applications'
  const conds = [], vals = []
  if (status && status !== 'all') { conds.push('status = ?'); vals.push(status) }
  if (jobId) { conds.push('job_id = ?'); vals.push(Number(jobId)) }
  if (conds.length) q += ' WHERE ' + conds.join(' AND ')
  q += ' ORDER BY id DESC'

  const stmt = vals.length ? env.DB.prepare(q).bind(...vals) : env.DB.prepare(q)
  const { results } = await stmt.all()
  return json({ applications: results })
}
