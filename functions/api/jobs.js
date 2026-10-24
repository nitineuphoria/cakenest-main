export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, title, department, location, type, description, requirements FROM jobs WHERE status = ? ORDER BY id DESC'
    ).bind('active').all()
    return json({ jobs: results })
  } catch (e) {
    return json({ error: 'Failed to load jobs' }, 500)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
