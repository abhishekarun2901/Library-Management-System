const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  userId: string | null
  role: string
  fullName: string | null
  memberSince: string | null
}

export type RegisterPayload = {
  email: string
  password: string
  fullName?: string
}

export async function registerPublic(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, role: 'member' }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = text || `HTTP ${res.status}`
    try {
      const err = JSON.parse(text)
      message = err.detail ?? err.message ?? err.error ?? message
    } catch {
      /* non-JSON */
    }
    throw new Error(message)
  }
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Invalid email or password.')
  }

  return res.json() as Promise<LoginResponse>
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE}/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    /* best-effort */
  })
}
