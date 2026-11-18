import { authenticatedUser, config, getDb, getSession } from './admin.js'
import { defaultPricingItems } from '../../src/pricingItems.js'

const reply = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  },
  body: JSON.stringify(body),
})

const validAmount = amount => typeof amount === 'number' && Number.isFinite(amount) &&
  amount >= 0 && amount <= 1_000_000_000 &&
  Math.abs(amount * 100 - Math.round(amount * 100)) < 1e-6

export function createPricingHandler(database = getDb) {
  return async event => {
    const method = event.httpMethod
    if (!['GET', 'POST', 'PUT'].includes(method)) return reply(405, { ok: false, detail: 'Method not allowed.' })

    const settings = config()
    if (method !== 'GET' && (!settings || !getSession(event, settings))) {
      return reply(401, { ok: false, detail: 'Authentication required.' })
    }

    let update
    if (method !== 'GET') {
      try { update = JSON.parse(event.body || '') }
      catch { return reply(400, { ok: false, detail: 'Invalid request.' }) }
      if (!defaultPricingItems.some(item => item.id === update?.id) || !validAmount(update?.amount)) {
        return reply(400, { ok: false, detail: 'A known card ID and valid numeric amount are required.' })
      }
    }

    if (!settings) return reply(500, { ok: false, detail: 'Pricing is not configured.' })

    try {
      const db = await database(settings)
      const collection = db.collection('pricing_items')
      if (method === 'GET') {
        const saved = await collection.find({ id: { $in: defaultPricingItems.map(item => item.id) } }).toArray()
        const overrides = new Map(saved.filter(item => validAmount(item.amount)).map(item => [item.id, item.amount]))
        const items = defaultPricingItems.map(item => ({
          ...item,
          amount: overrides.get(item.id) ?? item.defaultAmount,
        }))
        return reply(200, { ok: true, items })
      }

      const user = await authenticatedUser(event, db, settings)
      if (!user) return reply(401, { ok: false, detail: 'Authentication required.' })
      await collection.updateOne({ id: update.id }, {
        $set: { amount: update.amount, updatedAt: new Date(), updatedBy: user.username },
      }, { upsert: true })
      const item = defaultPricingItems.find(entry => entry.id === update.id)
      return reply(200, { ok: true, item: { ...item, amount: update.amount } })
    } catch (error) {
      console.error('[pricing] request failed:', error?.message)
      return reply(500, { ok: false, detail: 'Could not load or save pricing.' })
    }
  }
}

export const handler = createPricingHandler()
