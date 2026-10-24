export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, value FROM content').all()
  const content = Object.fromEntries(results.map(r => [r.key, r.value]))
  return json({ content })
}

export async function onRequestPut({ request, env }) {
  const updates = await request.json()
  const stmts = Object.entries(updates).map(([k, v]) =>
    env.DB.prepare(
      `INSERT INTO content (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`
    ).bind(k, String(v))
  )
  await env.DB.batch(stmts)
  return json({ success: true })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
