export async function onRequestPut({ request, env, params }) {
  const id = Number(params.id)
  const b = await request.json()
  if (!b.title?.trim()) return json({ error: 'Title is required' }, 400)
  await env.DB.prepare(
    `UPDATE jobs SET title=?, department=?, location=?, type=?, description=?, requirements=?, status=? WHERE id=?`
  ).bind(
    b.title.trim(), b.department || '', b.location || 'Mohali Aerocity',
    b.type || 'Full-time', b.description || '', b.requirements || '',
    b.status || 'active', id
  ).run()
  const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(id).first()
  return json({ job })
}

export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(Number(params.id)).run()
  return json({ success: true })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
