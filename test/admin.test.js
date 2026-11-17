import assert from 'node:assert/strict'
import { test } from 'node:test'
import bcrypt from 'bcryptjs'
import { createAdminHandler } from '../netlify/functions/admin.js'

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
