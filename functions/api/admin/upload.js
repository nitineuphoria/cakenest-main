export async function onRequestPost({ request, env }) {
  const form = await request.formData()
  const file = form.get('file')
  if (!file || typeof file === 'string') return json({ error: 'No file provided' }, 400)

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  if (!allowed.includes(file.type)) return json({ error: 'Only JPEG, PNG, WebP, GIF or AVIF images are allowed' }, 400)
  if (file.size > 8 * 1024 * 1024) return json({ error: 'Image must be under 8 MB' }, 400)

  const uuid = crypto.randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100)
  const key = `cms/${uuid}/${safeName}`

  await env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type }
  })

  return json({ url: `/api/img/${uuid}/${safeName}` })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
