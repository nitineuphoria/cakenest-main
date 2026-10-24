export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM jobs ORDER BY id DESC'
  ).all()
  return json({ jobs: results })
}

export async function onRequestPost({ request, env }) {
  const b = await request.json()
  if (!b.title?.trim()) return json({ error: 'Title is required' }, 400)
  const { meta } = await env.DB.prepare(
    `INSERT INTO jobs (title, department, location, type, description, requirements, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    b.title.trim(), b.department || '', b.location || 'Mohali Aerocity',
    b.type || 'Full-time', b.description || '', b.requirements || '',
    b.status || 'active'
  ).run()
  const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(meta.last_row_id).first()
  return json({ job }, 201)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
