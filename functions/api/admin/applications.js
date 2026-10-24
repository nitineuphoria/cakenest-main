export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status') || ''
  const jobId  = url.searchParams.get('job') || ''

  let q = 'SELECT * FROM applications'
  const conds = [], vals = []
  if (status && status !== 'all') { conds.push('status = ?'); vals.push(status) }
  if (jobId) { conds.push('job_id = ?'); vals.push(Number(jobId)) }
  if (conds.length) q += ' WHERE ' + conds.join(' AND ')
  q += ' ORDER BY id DESC'

  const stmt = vals.length ? env.DB.prepare(q).bind(...vals) : env.DB.prepare(q)
  const { results } = await stmt.all()
  return json({ applications: results })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' }
  })
}
