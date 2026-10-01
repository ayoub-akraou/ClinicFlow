const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, { token, withMeta = false, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error?.message || 'Une erreur est survenue. Réessayez.')
  }
  return withMeta ? payload : payload.data
}
