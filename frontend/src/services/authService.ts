const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8000'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  type: string
  role: string
  fullName: string | null
  memberSince: string | null
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Invalid email or password.')
  }

  return res.json() as Promise<LoginResponse>
}
