import { MongoClient } from 'mongodb'

let clientPromise

function getDb() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured')
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch(error => {
        clientPromise = null
        throw error
      })
  }
  return clientPromise.then(client => client.db(process.env.MONGODB_DB || 'nexum_bms'))
}

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})

const field = (value, max) => typeof value === 'string' && value.length <= max ? value.trim() : null

export const handler = async event => {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, detail: 'Method not allowed.' })

  let data
  try { data = JSON.parse(event.body || '') }
  catch { return reply(400, { ok: false, detail: 'Invalid JSON payload.' }) }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return reply(400, { ok: false, detail: 'Invalid JSON payload.' })
  }

  const name = field(data.name, 150)
  const email = field(data.email, 254)
  const phone = field(data.phone ?? '', 50)
  const company = field(data.company ?? '', 150)
  const service = field(data.service ?? '', 150)
  const message = field(data.message, 5000)
  const pageSource = field(data.pageSource, 500)

  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      phone === null || (phone && (phone.match(/\d/g) || []).length < 6) ||
      company === null || service === null || !message || !pageSource) {
    return reply(400, { ok: false, detail: 'Please provide a valid name, email, message, and page source. Check any other fields you entered.' })
  }
  if (!process.env.MONGODB_URI) {
    return reply(500, { ok: false, detail: 'The contact form is temporarily unavailable. Please try again later.' })
  }

  try {
    const db = await getDb()
    await db.collection('nexum_website_inquiries').insertOne({
      name, email: email.toLowerCase(), phone, company, service, message,
      pageSource, createdAt: new Date(),
    })
    return reply(200, { ok: true, detail: 'Your message has been received.' })
  } catch (error) {
    console.error('[contact] insert failed:', error?.message)
    return reply(500, { ok: false, detail: 'Could not send your message. Please try again shortly.' })
  }
}
