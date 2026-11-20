import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const cookieName = 'NEXBMS_ADMIN'
const sessionSeconds = 60 * 60 * 24
let clientPromise

const reply = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  },
  body: JSON.stringify(body),
})

export function config() {
  const uri = process.env.MONGODB_URI?.replace(/^["'\s]+|["'\s]+$/g, '')
  if (!uri) return null
  return {
    uri,
    dbName: process.env.MONGODB_DB || 'nexum_digital_studio',
    secret: createHash('sha256').update(`${uri}|NEXBMS-SESSION-V2`).digest(),
  }
}

function equal(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  return left.length === right.length && timingSafeEqual(left, right)
}

function signature(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function getSession(event, settings) {
  const cookies = (event.headers?.cookie || event.headers?.Cookie || '').split(';')
  const token = cookies.find(part => part.trim().startsWith(`${cookieName}=`))?.trim().slice(cookieName.length + 1)
  if (!token || token.length > 2048) return null
  const [payload, mac, extra] = token.split('.')
  if (!payload || !mac || extra || !equal(mac, signature(payload, settings.secret))) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof session.user === 'string' && typeof session.version === 'string' &&
      Number.isSafeInteger(session.exp) && session.exp > Math.floor(Date.now() / 1000) ? session : null
  } catch {
    return null
  }
}

function sessionCookie(user, version, settings) {
  const payload = Buffer.from(JSON.stringify({ user, version, exp: Math.floor(Date.now() / 1000) + sessionSeconds })).toString('base64url')
  return `${cookieName}=${payload}.${signature(payload, settings.secret)}; Max-Age=${sessionSeconds}; Path=/; HttpOnly; SameSite=Lax; Secure`
}

export function getDb(settings) {
  if (!clientPromise) {
    clientPromise = new MongoClient(settings.uri, { serverSelectionTimeoutMS: 8000 }).connect().catch(error => {
      clientPromise = null
      throw error
    })
  }
  return clientPromise.then(client => client.db(settings.dbName))
}

function corsHeaders(event) {
  const allowed = process.env.CORS_ORIGIN?.trim()
  if (!allowed) return {}
  const origin = event.headers?.origin || event.headers?.Origin
  if (allowed !== '*' && origin !== allowed) return {}
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...(allowed === '*' ? {} : { 'Access-Control-Allow-Credentials': 'true', Vary: 'Origin' }),
  }
}

function normalizeUsername(value) {
  return typeof value === 'string' ? value.replace(/^["'\s]+|["'\s]+$/g, '').toLowerCase() : ''
}

function verifyPassword(password, stored) {
  return typeof password === 'string' && typeof stored === 'string' &&
    /^\$2[aby]\$/.test(stored) && bcrypt.compareSync(password, stored)
}

export async function authenticatedUser(event, db, settings) {
  const session = getSession(event, settings)
  if (!session) return null
  const user = await db.collection('admin_users').findOne({ username: session.user })
  return user && typeof user.session_version === 'string' &&
    equal(user.session_version, session.version) && user.status === 'active' &&
    ['admin', 'super_admin'].includes(user.role) ? user : null
}

export function createAdminHandler(database = getDb) {
  return async event => {
    const respond = (statusCode, body, headers) => reply(statusCode, body, { ...corsHeaders(event), ...headers })
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(event), body: '' }
    const settings = config()
    if (!settings) return respond(500, { ok: false, detail: 'Admin is not configured.' })

    if (event.httpMethod === 'POST') {
      let data
      try { data = JSON.parse(event.body || '') }
      catch { return respond(400, { ok: false, detail: 'Invalid request.' }) }
      if (data?.action === 'logout') {
        return respond(200, { ok: true }, { 'Set-Cookie': `${cookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure` })
      }
      if (['change_password', 'add_user', 'set_status'].includes(data?.action)) {
        if (!getSession(event, settings)) return respond(401, { ok: false, detail: 'Authentication required.' })
        try {
          const db = await database(settings)
          const signedInUser = await authenticatedUser(event, db, settings)
          if (!signedInUser) return respond(401, { ok: false, detail: 'Authentication required.' })
          if (data.action === 'change_password') {
            if (typeof data.currentPassword !== 'string' || !verifyPassword(data.currentPassword, signedInUser.password_hash) ||
                typeof data.newPassword !== 'string' || data.newPassword.length < 12 || data.newPassword.length > 200) {
              return respond(400, { ok: false, detail: 'Check your current password and use a new password with at least 12 characters.' })
            }
            await db.collection('admin_users').updateOne({ username: signedInUser.username }, {
              $set: { password_hash: await bcrypt.hash(data.newPassword, 12), session_version: randomUUID() },
            })
            return respond(200, { ok: true, detail: 'Password changed. Please sign in again.' }, {
              'Set-Cookie': `${cookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`,
            })
          }
          if (data.action === 'add_user') {
            if (signedInUser.role !== 'super_admin') return respond(403, { ok: false, detail: 'Only a super admin can add users.' })
            const username = normalizeUsername(data.username)
            if (!/^[a-z0-9.-]{3,50}$/.test(username) || typeof data.password !== 'string' ||
                data.password.length < 12 || data.password.length > 200 ||
                !['admin', 'super_admin'].includes(data.role)) {
              return respond(400, { ok: false, detail: 'Use a valid username, role, and password with at least 12 characters.' })
            }
            if (await db.collection('admin_users').findOne({ username })) return respond(409, { ok: false, detail: 'Username already exists.' })
            await db.collection('admin_users').insertOne({
              username, password_hash: await bcrypt.hash(data.password, 12),
              session_version: randomUUID(), status: 'active', role: data.role, createdAt: new Date(),
            })
            return respond(200, { ok: true, detail: 'User added.' })
          }
          if (!/^[a-f\d]{24}$/i.test(data.id || '') || !['new', 'in_progress', 'resolved'].includes(data.status)) {
            return respond(400, { ok: false, detail: 'Invalid inquiry status.' })
          }
          const result = await db.collection('nexum_website_inquiries').updateOne(
            { _id: new ObjectId(data.id) }, { $set: { status: data.status } },
          )
          return result.matchedCount ? respond(200, { ok: true }) : respond(404, { ok: false, detail: 'Inquiry not found.' })
        } catch (error) {
          console.error('[admin] action failed:', error?.message)
          return respond(500, { ok: false, detail: 'Could not complete the admin request.' })
        }
      }
      if (data?.action !== 'login' || typeof data.user !== 'string' || typeof data.pass !== 'string') {
        return respond(400, { ok: false, detail: 'Invalid request.' })
      }
      const username = normalizeUsername(data.user)
      if (!username || !data.pass) return respond(401, { ok: false, detail: 'Invalid credentials.' })
      try {
        const db = await database(settings)
        const user = await db.collection('admin_users').findOne({ username })
        if (!user || user.status !== 'active' || !['admin', 'super_admin'].includes(user.role) ||
            typeof user.session_version !== 'string' || !verifyPassword(data.pass, user.password_hash)) {
          return respond(401, { ok: false, detail: 'Invalid credentials.' })
        }
        return respond(200, { ok: true }, { 'Set-Cookie': sessionCookie(user.username, user.session_version, settings) })
      } catch (error) {
        console.error('[admin] login failed:', error?.message)
        return respond(500, { ok: false, detail: 'Could not sign in.' })
      }
    }

    if (event.httpMethod !== 'GET' && event.httpMethod !== 'DELETE') {
      return respond(405, { ok: false, detail: 'Method not allowed.' })
    }
    if (!getSession(event, settings)) return respond(401, { ok: false, detail: 'Authentication required.' })

    let deleteId
    if (event.httpMethod === 'DELETE') {
      let data
      try { data = JSON.parse(event.body || '') }
      catch { return respond(400, { ok: false, detail: 'Invalid request.' }) }
      if (typeof data?.id !== 'string' || !/^[a-f\d]{24}$/i.test(data.id)) {
        return respond(400, { ok: false, detail: 'Invalid inquiry ID.' })
      }
      deleteId = new ObjectId(data.id)
    }

    try {
      const db = await database(settings)
      const signedInUser = await authenticatedUser(event, db, settings)
      if (!signedInUser) {
        return respond(401, { ok: false, detail: 'Authentication required.' })
      }
      const collection = db.collection('nexum_website_inquiries')
      if (event.httpMethod === 'GET') {
        const docs = await collection.find({}).sort({ createdAt: -1, _id: -1 }).toArray()
        const items = docs.map(({ _id, name, email, phone, company, service, message, pageSource, createdAt, status }) => ({
          id: _id.toString(), name: name || '', email: email || '', phone: phone || '',
          company: company || '', service: service || '', message: message || '',
          pageSource: pageSource || '', status: status || 'new', createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt || null,
        }))
        return respond(200, { ok: true, items, user: { username: signedInUser.username, role: signedInUser.role } })
      }
      const result = await collection.deleteOne({ _id: deleteId })
      if (!result.deletedCount) return respond(404, { ok: false, detail: 'Inquiry not found.' })
      return respond(200, { ok: true })
    } catch (error) {
      console.error('[admin] request failed:', error?.message)
      return respond(500, { ok: false, detail: 'Could not complete the admin request.' })
    }
  }
}

export const handler = createAdminHandler()
