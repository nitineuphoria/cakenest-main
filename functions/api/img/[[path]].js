export async function onRequestGet({ env, params }) {
  const key = 'cms/' + (params.path || []).join('/')
  const obj = await env.R2.get(key)
  if (!obj) return new Response('Not found', { status: 404 })
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}
