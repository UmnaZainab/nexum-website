import assert from 'node:assert/strict'
import { test } from 'node:test'
import bcrypt from 'bcryptjs'
import { createAdminHandler } from '../netlify/functions/admin.js'
import { createPricingHandler } from '../netlify/functions/pricing.js'

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test'
process.env.MONGODB_DB = 'nexum_digital_studio'
process.env.CORS_ORIGIN = 'https://nexum.example'

const user = {
  username: 'test-admin',
  password_hash: bcrypt.hashSync('test-password-123', 4),
  session_version: 'version-one',
  status: 'active',
  role: 'admin',
}
const inquiry = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  name: 'Test User', email: 'test@example.com', phone: '', company: 'Example',
  service: 'Consultation', message: 'Hello', pageSource: '/#contact',
  createdAt: new Date('2026-01-02T00:00:00.000Z'),
}
let deleted = false
const collections = {
  admin_users: { findOne: async ({ username }) => username === user.username ? user : null },
  nexum_website_inquiries: {
    find: () => ({ sort: () => ({ toArray: async () => deleted ? [] : [inquiry] }) }),
    deleteOne: async ({ _id }) => {
      if (_id.toString() !== inquiry._id.toString() || deleted) return { deletedCount: 0 }
      deleted = true
      return { deletedCount: 1 }
    },
  },
}
const handler = createAdminHandler(async settings => {
  assert.equal(settings.dbName, 'nexum_digital_studio')
  return { collection: name => collections[name] }
})

const request = (httpMethod, body, cookie, origin) => handler({
  httpMethod,
  body: body && JSON.stringify(body),
  headers: { ...(cookie ? { cookie } : {}), ...(origin ? { origin } : {}) },
})

test('admin rejects invalid credentials and unauthenticated data requests', async () => {
  assert.equal((await request('POST', { action: 'login', user: 'test-admin', pass: 'wrong' })).statusCode, 401)
  assert.equal((await request('GET')).statusCode, 401)
  assert.equal((await request('DELETE', { id: '507f1f77bcf86cd799439011' })).statusCode, 401)
})

test('MongoDB admin user can sign in, read inquiries, and delete one', async () => {
  const login = await request('POST', { action: 'login', user: ' TEST-ADMIN ', pass: 'test-password-123' }, null, 'https://nexum.example')
  assert.equal(login.statusCode, 200)
  const cookie = login.headers['Set-Cookie'].split(';')[0]
  assert.match(login.headers['Set-Cookie'], /NEXBMS_ADMIN=.*HttpOnly; SameSite=Lax; Secure/)
  assert.equal(login.headers['Access-Control-Allow-Origin'], 'https://nexum.example')
  assert.equal(login.headers['Access-Control-Allow-Credentials'], 'true')
  const list = await request('GET', null, cookie)
  assert.equal(list.statusCode, 200)
  assert.equal(JSON.parse(list.body).items[0].name, 'Test User')
  assert.equal((await request('DELETE', { id: 'invalid' }, cookie)).statusCode, 400)
  assert.equal((await request('GET', null, `${cookie}tampered`)).statusCode, 401)
  assert.equal((await request('DELETE', { id: '507f1f77bcf86cd799439011' }, cookie)).statusCode, 200)
  assert.deepEqual(JSON.parse((await request('GET', null, cookie)).body).items, [])
  user.session_version = 'version-two'
  assert.equal((await request('GET', null, cookie)).statusCode, 401)
  assert.equal((await request('POST', { action: 'logout' }, cookie)).statusCode, 200)
})

const pricingUser = { ...user, session_version: 'pricing-version' }
const pricingRows = new Map()
const pricingDb = {
  collection: name => {
    if (name === 'admin_users') return { findOne: async ({ username }) => username === pricingUser.username ? pricingUser : null }
    if (name === 'nexum_website_inquiries') return { find: () => ({ sort: () => ({ toArray: async () => [] }) }) }
    if (name === 'pricing_items') return {
      find: () => ({ toArray: async () => [...pricingRows.values()] }),
      updateOne: async ({ id }, { $set }) => { pricingRows.set(id, { id, ...$set }); return { matchedCount: 1 } },
    }
    throw new Error(`Unexpected collection: ${name}`)
  },
}
const pricingHandler = createPricingHandler(async settings => {
  assert.equal(settings.dbName, 'nexum_digital_studio')
  return pricingDb
})
const pricingAdminHandler = createAdminHandler(async () => pricingDb)
const pricingRequest = (httpMethod, body, cookie) => pricingHandler({
  httpMethod, body: body && JSON.stringify(body), headers: cookie ? { cookie } : {},
})

test('public pricing GET returns code defaults and updates require a session', async () => {
  const response = await pricingRequest('GET')
  assert.equal(response.statusCode, 200)
  const items = JSON.parse(response.body).items
  assert.deepEqual(items.map(({ id, amount, defaultAmount }) => [id, amount, defaultAmount]), [
    ['starter-growth', 35000, 35000],
    ['scale-performance', 75000, 75000],
    ['enterprise-custom', 150000, 150000],
  ])
  assert.equal((await pricingRequest('PUT', { id: 'starter-growth', amount: 40000 })).statusCode, 401)
  assert.equal((await pricingRequest('POST', { id: 'starter-growth', amount: 40000 })).statusCode, 401)
})

test('authenticated pricing updates validate amounts and upsert overrides', async () => {
  const login = await pricingAdminHandler({
    httpMethod: 'POST',
    body: JSON.stringify({ action: 'login', user: pricingUser.username, pass: 'test-password-123' }),
    headers: {},
  })
  assert.equal(login.statusCode, 200)
  const cookie = login.headers['Set-Cookie'].split(';')[0]
  assert.equal((await pricingRequest('PUT', { id: 'unknown', amount: 42000 }, cookie)).statusCode, 400)
  assert.equal((await pricingRequest('PUT', { id: 'starter-growth', amount: -1 }, cookie)).statusCode, 400)
  assert.equal((await pricingRequest('PUT', { id: 'starter-growth', amount: '42000' }, cookie)).statusCode, 400)
  assert.equal((await pricingRequest('PUT', { id: 'starter-growth', amount: 42000.123 }, cookie)).statusCode, 400)
  const update = await pricingRequest('PUT', { id: 'starter-growth', amount: 42000 }, cookie)
  assert.equal(update.statusCode, 200)
  assert.equal(JSON.parse(update.body).item.amount, 42000)
  assert.equal(pricingRows.get('starter-growth').updatedBy, pricingUser.username)
  assert.equal((await pricingRequest('POST', { id: 'scale-performance', amount: 80000 }, cookie)).statusCode, 200)
  const items = JSON.parse((await pricingRequest('GET')).body).items
  assert.equal(items.find(item => item.id === 'starter-growth').amount, 42000)
  assert.equal(items.find(item => item.id === 'scale-performance').amount, 80000)
  assert.equal(items.find(item => item.id === 'enterprise-custom').amount, 150000)
  pricingUser.session_version = 'revoked-version'
  assert.equal((await pricingRequest('PUT', { id: 'starter-growth', amount: 43000 }, cookie)).statusCode, 401)
})
