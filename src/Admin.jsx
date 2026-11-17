import React, { useEffect, useMemo, useState } from 'react'
import './admin.css'

const endpoint = '/.netlify/functions/admin'

async function adminRequest(method = 'GET', body) {
  const response = await fetch(endpoint, {
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

export default function Admin() {
  const [authorized, setAuthorized] = useState(false)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    adminRequest().then(result => {
      if (active) { setItems(result.items); setAuthorized(true) }
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
      if (failure.status === 401) { setAuthorized(false); setItems([]) }
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
      if (failure.status === 401) { setAuthorized(false); setItems([]) }
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
      setSearch('')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <div className="admin-page">
    {!authorized ? <div className="admin-login-shell"><form className="admin-login-card" onSubmit={login}>
      <a className="admin-brand" href="/">nexum<span>.</span> <small>DIGITAL STUDIO</small></a>
      <p className="admin-eyebrow">PRIVATE DASHBOARD</p>
      <h1>Admin sign in</h1>
      <p>Enter your credentials to view website inquiries.</p>
      <label>Username<input name="user" autoComplete="username" required /></label>
      <label>Password<input name="pass" type="password" autoComplete="current-password" required /></label>
      <button className="admin-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </form></div> : <div className="admin-dashboard">
      <header className="admin-dashboard-head">
        <div><a className="admin-brand" href="/">nexum<span>.</span> <small>DIGITAL STUDIO</small></a><p className="admin-eyebrow">PRIVATE DASHBOARD</p><h1>Website inquiries</h1><p>Contact form submissions, newest first.</p></div>
        <div className="admin-controls"><button type="button" onClick={refresh} disabled={busy}>Refresh</button><button type="button" onClick={logout} disabled={busy}>Logout</button></div>
      </header>
      <div className="admin-toolbar"><label>Search inquiries<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, message, service…" /></label><span>{visible.length} of {items.length} inquiries</span></div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {visible.length === 0 ? <div className="admin-empty">{items.length ? 'No inquiries match your search.' : 'No inquiries yet.'}</div> : <div className="admin-inquiry-list">
        {visible.map(item => <article className="admin-inquiry" key={item.id}>
          <div className="admin-inquiry-head"><div><h2>{item.name || 'Unnamed inquiry'}</h2><time dateTime={item.createdAt || undefined}>{formatDate(item.createdAt)}</time></div><button type="button" className="admin-delete" onClick={() => remove(item)} disabled={busy} aria-label={`Delete inquiry from ${item.name || item.email}`}>Delete</button></div>
          <dl className="admin-fields"><div><dt>Email</dt><dd>{item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : '—'}</dd></div><div><dt>Phone</dt><dd>{item.phone || '—'}</dd></div><div><dt>Company</dt><dd>{item.company || '—'}</dd></div><div><dt>Service</dt><dd>{item.service || '—'}</dd></div><div><dt>Page source</dt><dd>{item.pageSource || '—'}</dd></div></dl>
          <div className="admin-message"><strong>Message</strong><p>{item.message || '—'}</p></div>
        </article>)}
      </div>}
    </div>}
  </div>
}
