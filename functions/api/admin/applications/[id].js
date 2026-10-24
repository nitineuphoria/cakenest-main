export async function onRequestPatch({ request, env, params }) {
  const id = Number(params.id)
  const { status } = await request.json()
  const valid = ['new', 'reviewed', 'selected']
  if (!valid.includes(status)) return json({ error: 'Invalid status' }, 400)
  await env.DB.prepare('UPDATE applications SET status = ? WHERE id = ?').bind(status, id).run()
  return json({ success: true })
}

export async function onRequestDelete({ env, params }) {
  const id = Number(params.id)
  // clean up CV from R2 first
  const app = await env.DB.prepare('SELECT cv_key FROM applications WHERE id = ?').bind(id).first()
  if (app?.cv_key) {
    try { await env.R2.delete(app.cv_key) } catch {}
  }
  await env.DB.prepare('DELETE FROM applications WHERE id = ?').bind(id).run()
  return json({ success: true })
}


function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
