export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT key, value FROM content').all()
  const content = {}
  for (const row of results) content[row.key] = row.value
  return new Response(JSON.stringify({ content }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    }
  })
}
