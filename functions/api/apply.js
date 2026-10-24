const MAX_CV_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export async function onRequestPost({ request, env }) {
  let formData
  try { formData = await request.formData() } catch {
    return json({ error: 'Invalid form data' }, 400)
  }

  const name        = (formData.get('name') || '').trim()
  const email       = (formData.get('email') || '').trim()
  const phone       = (formData.get('phone') || '').trim()
  const coverLetter = (formData.get('coverLetter') || '').trim()
  const jobId       = formData.get('jobId')
  const jobTitle    = (formData.get('jobTitle') || '').trim()
  const cvFile      = formData.get('cv')

  if (!name || !email || !jobId) return json({ error: 'Missing required fields' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email' }, 400)

  // Upload CV to R2
  let cvKey = null, cvFilename = null
  if (cvFile && cvFile.size > 0) {
    if (cvFile.size > MAX_CV_BYTES) return json({ error: 'CV must be under 5 MB' }, 400)
    if (!ALLOWED_TYPES.includes(cvFile.type)) return json({ error: 'CV must be PDF or Word document' }, 400)
    const uid = crypto.randomUUID()
    cvFilename = cvFile.name
    cvKey = `cvs/${uid}/${cvFile.name}`
    const buf = await cvFile.arrayBuffer()
    await env.R2.put(cvKey, buf, { httpMetadata: { contentType: cvFile.type } })
  }

  const { meta } = await env.DB.prepare(
    `INSERT INTO applications (job_id, job_title, name, email, phone, cover_letter, cv_key, cv_filename, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`
  ).bind(jobId || null, jobTitle, name, email, phone, coverLetter, cvKey, cvFilename).run()

  // Email notification via Resend
  if (env.RESEND_API_KEY) {
    const html = `
      <p>A new application was submitted on <strong>www.cakenest.in/careers</strong></p>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
        <tr><td style="padding:6px 16px 6px 0;color:#857e74">Position</td><td><strong>${esc(jobTitle)}</strong></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#857e74">Name</td><td>${esc(name)}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#857e74">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#857e74">Phone</td><td>${esc(phone)}</td></tr>
      </table>
      ${coverLetter ? `<p style="margin-top:16px"><strong>Cover letter:</strong><br>${esc(coverLetter).replace(/\n/g, '<br>')}</p>` : ''}
      <p style="margin-top:20px"><a href="https://www.cakenest.in/admin" style="background:#C9973F;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin Panel</a></p>
    `
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CakeNest Careers <careers@cakenest.in>',
        to: ['cakenestindia@gmail.com'],
        subject: `New application: ${jobTitle} — ${name}`,
        html
      })
    })
  }

  return json({ success: true })
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
