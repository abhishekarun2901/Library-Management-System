import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BookOpen, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Button, Input } from "../components/ui"
import { FormField } from "../components/composite"
import { registerPublic } from "../services/authService"

const features = [
  "Access the complete book catalog instantly",
  "Track your loans and due dates",
  "Manage reservations with ease",
]

export const SignUpPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const setField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      setError("") 
    }

  const handleCreate = async () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    
    setLoading(true)
    setError("")
    try {
      await registerPublic({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
      })
      navigate("/login", { state: { registered: true } })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-600 to-indigo-700 lg:flex lg:w-2/5 lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative blobs */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute left-1/4 top-1/3 h-40 w-40 rounded-full bg-purple-400/20" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BooKing</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Join the digital<br />library revolution.
          </h2>
          <p className="text-lg leading-relaxed text-indigo-200">
            Create your account and get instant access to a world of books and library services.
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
        <p className="relative text-sm text-indigo-400">© 2026 BooKing. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-6 py-12 sm:px-12">
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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-600">Join BooKing and start managing your library</p>
          </div>

          {/* Error */}
          {error ? (
            <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          ) : null}

          {/* Form */}
          <div className="space-y-5">
            <FormField label="Full Name" htmlFor="fullName" required>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={setField("fullName")}
              />
            </FormField>

            <FormField label="Email address" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                placeholder="name@booking.com"
                value={formData.email}
                onChange={setField("email")}
              />
            </FormField>

            <FormField label="Password" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={setField("password")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField label="Confirm Password" htmlFor="confirmPassword" required>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={setField("confirmPassword")}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <Button className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
