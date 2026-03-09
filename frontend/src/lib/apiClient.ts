const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000'

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text || `HTTP ${res.status}`
    try {
      const err = JSON.parse(text)
      message = err.detail ?? err.message ?? err.error ?? message
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message)
  }

  // 204 No Content or empty body
  const contentLength = res.headers.get('content-length')
  if (res.status === 204 || contentLength === '0') return undefined as T

  return res.json() as Promise<T>
}
