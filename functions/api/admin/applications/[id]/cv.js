export async function onRequestGet({ env, params }) {
  const id = Number(params.id)
  const app = await env.DB.prepare(
    'SELECT cv_key, cv_filename FROM applications WHERE id = ?'
  ).bind(id).first()

  if (!app?.cv_key) {
    return new Response(JSON.stringify({ error: 'No CV on file' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    })
  }

  const obj = await env.R2.get(app.cv_key)
  if (!obj) {
    return new Response(JSON.stringify({ error: 'File not found in storage' }), {
      status: 404, headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${app.cv_filename || 'resume.pdf'}"`
    }
  })
}
