import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { formatPrice } from './pricingItems'
import ThemeToggle from './ThemeToggle'
import './admin.css'

const endpoint = '/.netlify/functions/admin'
const pricingEndpoint = '/.netlify/functions/pricing'

async function adminRequest(method = 'GET', body, path = endpoint) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) {
    const error = new Error(result.detail || `Request failed (${response.status}).`)
    error.status = response.status
    throw error
  }
  return result
}

function formatDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function PricingEditor({ onUnauthorized }) {
  const [pricing, setPricing] = useState([])
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState('')
  const [saved, setSaved] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    adminRequest('GET', undefined, pricingEndpoint).then(result => {
      if (!active) return
      setPricing(result.items)
      setDrafts(Object.fromEntries(result.items.map(item => [item.id, String(item.amount)])))
    }).catch(failure => {
      if (!active) return
      if (failure.status === 401) onUnauthorized()
      else setError(failure.message)
    })
    return () => { active = false }
  }, [onUnauthorized])

  async function save(item) {
    const raw = drafts[item.id]?.trim() ?? ''
    const amount = Number(raw)
    if (!raw || !Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000 ||
        Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-6) {
      setError(`Enter a valid amount for ${item.cardName}.`)
      return
    }
    setError('')
    setSaved('')
    setSaving(item.id)
    try {
      const result = await adminRequest('PUT', { id: item.id, amount }, pricingEndpoint)
      setPricing(current => current.map(entry => entry.id === item.id ? result.item : entry))
      setDrafts(current => ({ ...current, [item.id]: String(result.item.amount) }))
      setSaved(item.id)
    } catch (failure) {
      if (failure.status === 401) onUnauthorized()
      else setError(failure.message)
    } finally {
      setSaving('')
    }
  }

  return <section className="admin-pricing-card" aria-labelledby="pricing-title">
    <h2 id="pricing-title">Pricing amounts</h2>
    <p>Edit the numeric price shown on each pricing page card. Other card content is managed in the site.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-pricing-scroll"><table className="admin-pricing-table">
      <thead><tr><th scope="col">CARD</th><th scope="col">CURRENT AMOUNT</th><th scope="col">DEFAULT</th><th scope="col">SAVE</th></tr></thead>
      <tbody>{pricing.map(item => <tr key={item.id}>
        <th scope="row">{item.cardName}</th>
        <td><input type="number" min="0" max="1000000000" step="0.01" inputMode="decimal" aria-label={`Current amount for ${item.cardName}`} value={drafts[item.id] ?? ''} onChange={event => { setDrafts(current => ({ ...current, [item.id]: event.target.value })); setSaved('') }} /></td>
        <td>{formatPrice(item.defaultAmount)}{item.amount === item.defaultAmount && <span className="admin-default-marker">(in use)</span>}</td>
        <td><button type="button" className="admin-price-save" disabled={Boolean(saving)} onClick={() => save(item)}>{saving === item.id ? 'Saving…' : 'Save'}</button>{saved === item.id && <span className="admin-saved" role="status">Saved</span>}</td>
      </tr>)}</tbody>
    </table></div>
    {pricing.length === 0 && !error && <p className="admin-pricing-loading" role="status">Loading pricing…</p>}
  </section>
}

export default function Admin({ theme, setTheme }) {
  const [authorized, setAuthorized] = useState(false)
  const [username, setUsername] = useState('')
  const [tab, setTab] = useState('inquiries')
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const handleUnauthorized = useCallback(() => {
    setAuthorized(false)
    setItems([])
    setUsername('')
  }, [])

  useEffect(() => {
    let active = true
    adminRequest().then(result => {
      if (active) { setItems(result.items); setUsername(result.user?.username || 'Admin'); setAuthorized(true) }
    }).catch(failure => {
      if (active && failure.status !== 401) setError(failure.message)
    })
    return () => { active = false }
  }, [])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items
    return items.filter(item => [item.name, item.email, item.phone, item.company, item.service, item.message, item.pageSource, item.createdAt]
      .some(value => String(value || '').toLowerCase().includes(query)))
  }, [items, search])

  async function login(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget
    const values = new FormData(form)
    setBusy(true)
    setError('')
    try {
      await adminRequest('POST', { action: 'login', user: values.get('user'), pass: values.get('pass') })
      const result = await adminRequest()
      form.reset()
      setItems(result.items)
      setUsername(result.user?.username || 'Admin')
      setAuthorized(true)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function refresh() {
    setBusy(true)
    setError('')
    try {
      const result = await adminRequest()
      setItems(result.items)
    } catch (failure) {
      if (failure.status === 401) handleUnauthorized()
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete the inquiry from ${item.name || item.email}? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    try {
      await adminRequest('DELETE', { id: item.id })
      setItems(current => current.filter(entry => entry.id !== item.id))
    } catch (failure) {
      if (failure.status === 401) handleUnauthorized()
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError('')
    try {
      await adminRequest('POST', { action: 'logout' })
      setAuthorized(false)
      setItems([])
      setUsername('')
      setTab('inquiries')
      setSearch('')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="admin-page">
    {!authorized ? <div className="admin-login-shell"><form className="admin-login-card" onSubmit={login}>
      <div className="admin-login-top"><a className="admin-brand" href="/">nexum<span>.</span> <small>DIGITAL STUDIO</small></a><ThemeToggle theme={theme} setTheme={setTheme} /></div>
      <p className="admin-eyebrow">PRIVATE DASHBOARD</p>
      <h1>Admin sign in</h1>
      <p>Enter your credentials to manage inquiries and pricing.</p>
      <label>Username<input name="user" autoComplete="username" required /></label>
      <label>Password<input name="pass" type="password" autoComplete="current-password" required /></label>
      <button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </form></div> : <div className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div><a className="admin-brand" href="/">nexum<span>.</span> <small>DIGITAL STUDIO</small></a><p className="admin-eyebrow">PRIVATE DASHBOARD</p><h1>{tab === 'inquiries' ? 'Website inquiries' : 'Pricing management'}</h1><p>{tab === 'inquiries' ? 'Contact form submissions, newest first.' : 'Manage the amounts shown on the public pricing page.'}</p></div>
        <div className="admin-controls"><span className="admin-user-badge">Signed in: {username}</span><ThemeToggle theme={theme} setTheme={setTheme} /><button type="button" onClick={logout} disabled={busy}>Log out</button></div>
      </header>
      <nav className="admin-tabs" aria-label="Admin sections"><button type="button" className={tab === 'inquiries' ? 'active' : ''} aria-current={tab === 'inquiries' ? 'page' : undefined} onClick={() => { setTab('inquiries'); setError('') }}>Inquiries</button><button type="button" className={tab === 'pricing' ? 'active' : ''} aria-current={tab === 'pricing' ? 'page' : undefined} onClick={() => { setTab('pricing'); setError('') }}>Pricing</button></nav>
      {tab === 'pricing' ? <PricingEditor onUnauthorized={handleUnauthorized} /> : <>
      <div className="admin-toolbar"><label>Search inquiries<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, message, service…" /></label><span>{visible.length} of {items.length} inquiries <button type="button" onClick={refresh} disabled={busy}>Refresh</button></span></div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {visible.length === 0 ? <div className="admin-empty">{items.length ? 'No inquiries match your search.' : 'No inquiries yet.'}</div> : <div className="admin-inquiry-list">
        {visible.map(item => <article className="admin-inquiry" key={item.id}>
          <div className="admin-inquiry-head"><div><h2>{item.name || 'Unnamed inquiry'}</h2><time dateTime={item.createdAt || undefined}>{formatDate(item.createdAt)}</time></div><button type="button" className="admin-delete" onClick={() => remove(item)} disabled={busy} aria-label={`Delete inquiry from ${item.name || item.email}`}>Delete</button></div>
          <dl className="admin-fields"><div><dt>Email</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : '—'}</dd></div><div><dt>Phone</dt><dd>{item.phone || '—'}</dd></div><div><dt>Company</dt><dd>{item.company || '—'}</dd></div><div><dt>Service</dt><dd>{item.service || '—'}</dd></div><div><dt>Page source</dt><dd>{item.pageSource || '—'}</dd></div></dl>
          <div className="admin-message"><strong>Message</strong><p>{item.message || '—'}</p></div>
        </article>)}
      </div>}</>}
    </div>}
  </div>
}
