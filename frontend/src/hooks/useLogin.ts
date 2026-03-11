import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export type UseLoginReturn = {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error: string
  setError: (v: string) => void
  loading: boolean
  handleSignIn: () => Promise<void>
}

export function useLogin(): UseLoginReturn {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await loginUser({ email, password })
      setAuth({
        userId: data.userId ?? null,
        role: data.role === 'admin' ? 'admin' : 'member',
        fullName: data.fullName ?? null,
        memberSince: data.memberSince ?? null,
      })
      if (data.role === 'admin') {
        navigate('/librarian')
      } else {
        navigate('/member')
      }
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSignIn,
  }
}
