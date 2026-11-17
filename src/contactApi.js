export async function submitContact(fields) {
  const response = await fetch('/.netlify/functions/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...fields, pageSource: window.location.pathname + window.location.hash }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.ok) {
    throw new Error(result?.detail || 'Could not send your message. Please try again.')
  }
  return result
}
