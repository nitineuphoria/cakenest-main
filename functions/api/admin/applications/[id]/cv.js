import { json, safeFileName } from '../../../../../lib/security.js'

export async function onRequestGet({ env, params }) {
  const id = Number(params.id)
  const app = await env.DB.prepare('SELECT cv_key, cv_filename FROM applications WHERE id = ?').bind(id).first()
  if (!app?.cv_key) return json({ error: 'No CV on file' }, 404)

  const obj = await env.R2.get(app.cv_key)
  if (!obj) return json({ error: 'File not found in storage' }, 404)

  const ext = (String(app.cv_filename || '').toLowerCase().match(/\.(pdf|docx?)$/) || [])[1] || 'pdf'
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFileName(app.cv_filename, ext)}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    }
  })
}
