import { json, verifyTurnstile, sniffCv, safeFileName, escapeHtml } from '../../lib/security.js'

const MAX_CV_BYTES = 5 * 1024 * 1024
const NOTIFY_TO = 'cakenestindia@gmail.com'

export async function onRequestPost({ request, env, waitUntil }) {
  const url = new URL(request.url)

  // Reject oversized bodies before reading them (CV 5 MB + form fields).
  const len = Number(request.headers.get('Content-Length') || 0)
  if (len > MAX_CV_BYTES + 200 * 1024) return json({ error: 'Your CV must be under 5 MB.' }, 413)

  let form
  try { form = await request.formData() } catch {
    return json({ error: 'Please check the form and try again.' }, 400)
  }
  const text = (k) => (typeof form.get(k) === 'string' ? form.get(k).trim() : '')

  // 1. Human check (Cloudflare Turnstile)
  const human = await verifyTurnstile(text('cf-turnstile-response'), request.headers.get('CF-Connecting-IP'), env, url)
  if (!human.ok) {
    if (human.reason === 'not-configured') return json({ error: 'Applications are paused for a moment. Please try again later.' }, 503)
    return json({ error: 'Please complete the verification check and try again.' }, 400)
  }

  // 2. Fields
  const name = text('name'), email = text('email').toLowerCase(), phone = text('phone')
  const coverLetter = text('coverLetter'), jobId = Number(text('jobId'))
  if (!name || name.length > 100) return json({ error: 'Please enter your full name.' }, 400)
  if (email.length > 254 || !/^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i.test(email)) return json({ error: 'Please enter a valid email address.' }, 400)
  if (!/^[+0-9 ()-]{7,20}$/.test(phone)) return json({ error: 'Please enter a valid phone number.' }, 400)
  if (coverLetter.length > 5000) return json({ error: 'Please keep your cover letter under 5,000 characters.' }, 400)
  if (text('consent') !== 'yes') return json({ error: 'Please agree to the Privacy Policy to apply.' }, 400)
  if (!Number.isInteger(jobId) || jobId <= 0) return json({ error: 'Please choose a role to apply for.' }, 400)

  const job = await env.DB.prepare('SELECT id, title FROM jobs WHERE id = ? AND status = ?').bind(jobId, 'active').first()
  if (!job) return json({ error: 'This role is no longer open.' }, 400)

  // 3. Same person, same role, within 10 minutes → already received (stops double submissions)
  const recent = await env.DB.prepare(
    "SELECT id FROM applications WHERE email = ? AND job_id = ? AND created_at > datetime('now', '-10 minutes')"
  ).bind(email, job.id).first()
  if (recent) return json({ success: true })

  // 4. CV — must really be a PDF or Word file
  const cv = form.get('cv')
  if (!cv || typeof cv === 'string' || !cv.size) return json({ error: 'Please attach your CV.' }, 400)
  if (cv.size > MAX_CV_BYTES) return json({ error: 'Your CV must be under 5 MB.' }, 400)
  const bytes = new Uint8Array(await cv.arrayBuffer())
  const kind = sniffCv(bytes, cv.name)
  if (!kind) return json({ error: 'Your CV must be a PDF or Word document (.pdf, .doc or .docx).' }, 400)
  const cvFilename = safeFileName(cv.name, kind.ext)
  const cvKey = `cvs/${crypto.randomUUID()}/${cvFilename}`

  // 5. Save file, then record; if the record fails, remove the file
  try {
    await env.R2.put(cvKey, bytes, { httpMetadata: { contentType: kind.type } })
  } catch {
    return json({ error: "We couldn't upload your CV. Please try again." }, 500)
  }
  try {
    await env.DB.prepare(
      `INSERT INTO applications (job_id, job_title, name, email, phone, cover_letter, cv_key, cv_filename, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`
    ).bind(job.id, job.title, name, email, phone, coverLetter, cvKey, cvFilename).run()
  } catch {
    try { await env.R2.delete(cvKey) } catch {}
    return json({ error: "We couldn't save your application. Please try again." }, 500)
  }

  // 6. Email alert — runs after the response; a failure here never affects the applicant
  if (env.RESEND_API_KEY) {
    const send = notify(env.RESEND_API_KEY, { job, name, email, phone, coverLetter }).catch(() => {})
    if (typeof waitUntil === 'function') waitUntil(send); else await send
  }

  return json({ success: true })
}

async function notify(apiKey, { job, name, email, phone, coverLetter }) {
  const e = escapeHtml
  const html = `
    <p>A new application was submitted on <strong>www.cakenest.in/careers</strong></p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
      <tr><td style="padding:6px 16px 6px 0;color:#857e74">Position</td><td><strong>${e(job.title)}</strong></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#857e74">Name</td><td>${e(name)}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#857e74">Email</td><td><a href="mailto:${e(email)}">${e(email)}</a></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#857e74">Phone</td><td>${e(phone)}</td></tr>
    </table>
    ${coverLetter ? `<p style="margin-top:16px"><strong>Cover letter:</strong><br>${e(coverLetter).replace(/\n/g, '<br>')}</p>` : ''}
    <p style="margin-top:20px"><a href="https://www.cakenest.in/admin" style="background:#C9973F;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin Panel</a></p>
  `
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'CakeNest Careers <careers@cakenest.in>',
      to: [NOTIFY_TO],
      subject: `New application: ${job.title} — ${name}`.replace(/[\r\n]+/g, ' '),
      html
    })
  })
  if (!r.ok) throw new Error('resend ' + r.status)
}
