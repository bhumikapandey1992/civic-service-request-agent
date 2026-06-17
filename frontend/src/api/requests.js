const BASE_URL = '/api'

export async function submitRequest(data) {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to submit request')
  return res.json()
}

export async function fetchRequests(filters = {}) {
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.priority) params.append('priority', filters.priority)
  const res = await fetch(`${BASE_URL}/requests?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch requests')
  return res.json()
}
