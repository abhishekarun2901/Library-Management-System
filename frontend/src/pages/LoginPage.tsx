import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { FormField } from '../components/composite'
import { useLogin } from '../hooks/useLogin'

const features = [
  'Manage books, loans, and reservations',
  'Track overdue fines automatically',
  'Real-time member activity dashboard',
]

export const LoginPage = () => {
  const location = useLocation()
  const registered =
    (location.state as { registered?: boolean } | null)?.registered === true

  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    handleSignIn,
  } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSignIn()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 lg:flex lg:w-2/5 lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative blobs */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-purple-400/20" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            BooKing
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Your digital library,
            <br />
            managed beautifully.
          </h2>
          <p className="text-lg leading-relaxed text-indigo-200">
            Everything a modern library needs — books, members, loans, and fines
            — in one elegant platform.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-indigo-100">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-300" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-sm text-indigo-400">
          © 2026 BooKing. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">BooKing</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your library account
            </p>
          </div>

          {/* Registration success */}
          {registered ? (
            <div className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
              Account created! You can now sign in.
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          ) : null}

          {/* Form */}
          <div className="space-y-5" onKeyDown={handleKeyDown}>
            <FormField label="Email address" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="name@booking.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormField>

            <Button
              className="w-full"
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
