import { useEffect, useRef, useState } from 'react'
import { AppLayout, PageHeader } from '../components/layout'
import { StatCard } from '../components/composite'
import { memberSidebarItems } from '../config/sidebarConfig'
import {
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pencil,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import {
  getCurrentUser,
  getUserFines,
  getUserHistory,
  updateUser,
} from '../services/userService'
import { getTransactions } from '../services/transactionService'
import { getReservations } from '../services/reservationService'

// ── Inline-edit field ──────────────────────────────────────────────────────────

type EditFieldProps = {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  suffix?: React.ReactNode
}

const EditField = ({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
}: EditFieldProps) => (
  <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <div className="relative mt-1 flex items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        {suffix && (
          <div className="absolute right-2 flex items-center">{suffix}</div>
        )}
      </div>
    </div>
  </div>
)

// ── Read-only info row ─────────────────────────────────────────────────────────

type InfoRowProps = { icon: React.ReactNode; label: string; value: string }

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

// ── Util ───────────────────────────────────────────────────────────────────────

function showMsg(
  setter: React.Dispatch<React.SetStateAction<{ ok: boolean; text: string } | null>>,
  timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  msg: { ok: boolean; text: string }
) {
  if (timer.current) clearTimeout(timer.current)
  setter(msg)
  timer.current = setTimeout(() => setter(null), 4000)
}

// ── Page ───────────────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const { fullName, token, memberSince, role, setAuth } = useAuthStore()

  const storedName = fullName ?? 'User'
  let storedEmail = ''
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      storedEmail = payload.sub ?? ''
    }
  } catch { /* ignore */ }

  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState({ name: storedName, email: storedEmail })

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [totalBorrowed, setTotalBorrowed] = useState<string>('—')
  const [activeLoans, setActiveLoans] = useState<string>('—')
  const [reservationCount, setReservationCount] = useState<string>('—')
  const [outstandingFines, setOutstandingFines] = useState<string>('—')

  useEffect(() => {
    if (!token) return
    Promise.all([
      getCurrentUser(token),
      getUserHistory(token),
      getUserFines(token),
      getTransactions(token),
      getReservations(token),
    ])
      .then(([me, history, fines, txs, reservations]) => {
        setUserId(me.userId)
        setProfile({ name: me.fullName, email: me.email })
        setTotalBorrowed(String(history.length))
        const active = txs.filter(
          (t) => t.status === 'issued' || t.status === 'overdue'
        )
        setActiveLoans(String(active.length))
        const activeRes = reservations.filter((r) => r.status === 'active')
        setReservationCount(String(activeRes.length))
        const unpaid = fines
          .filter((f) => !f.paid)
          .reduce((s, f) => s + (f.amount ?? 0), 0)
        setOutstandingFines(unpaid > 0 ? `$${unpaid.toFixed(2)}` : '$0.00')
      })
      .catch(console.error)
  }, [token])

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // ── Edit personal info ─────────────────────────────────────────────────────
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMsg, setInfoMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const infoMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openEditInfo = () => {
    setDraftName(profile.name)
    setDraftEmail(profile.email)
    setInfoMsg(null)
    setIsEditingInfo(true)
  }

  const cancelEditInfo = () => {
    setIsEditingInfo(false)
    setInfoMsg(null)
  }

  const saveInfo = async () => {
    if (!token || !userId) return
    setSavingInfo(true)
    setInfoMsg(null)
    try {
      const updated = await updateUser(
        userId,
        {
          fullName: draftName.trim() || undefined,
          email: draftEmail.trim() || undefined,
        },
        token
      )
      setProfile({ name: updated.fullName, email: updated.email })
      setAuth({ token, role, fullName: updated.fullName, memberSince: memberSince ?? null })
      setIsEditingInfo(false)
      showMsg(setInfoMsg, infoMsgTimer, { ok: true, text: 'Profile updated.' })
    } catch (e) {
      setInfoMsg({
        ok: false,
        text: e instanceof Error ? e.message : 'Failed to save.',
      })
    } finally {
      setSavingInfo(false)
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  const [isChangingPw, setIsChangingPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const pwMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openChangePw = () => {
    setNewPw('')
    setConfirmPw('')
    setPwMsg(null)
    setIsChangingPw(true)
  }

  const cancelChangePw = () => {
    setIsChangingPw(false)
    setPwMsg(null)
  }

  const savePassword = async () => {
    if (!token || !userId) return
    if (newPw.length < 8) {
      setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' })
      return
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'Passwords do not match.' })
      return
    }
    setSavingPw(true)
    setPwMsg(null)
    try {
      await updateUser(userId, { password: newPw }, token)
      setIsChangingPw(false)
      showMsg(setPwMsg, pwMsgTimer, { ok: true, text: 'Password changed successfully.' })
    } catch (e) {
      setPwMsg({
        ok: false,
        text: e instanceof Error ? e.message : 'Failed to change password.',
      })
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <AppLayout sidebarItems={memberSidebarItems} topbarTitle="My Profile">
      <div className="w-full space-y-6 p-6 pb-12">
        <PageHeader
          title="My Profile"
          description="Manage your personal information and account settings"
        />

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-purple-400/20" />
          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="mt-0.5 text-sm text-indigo-200">{profile.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Active Member
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Books Borrowed" value={totalBorrowed} />
          <StatCard label="Active Loans" value={activeLoans} />
          <StatCard label="Reservations" value={reservationCount} />
          <StatCard label="Outstanding Fines" value={outstandingFines} />
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Personal Information ───────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-500">Your account details on file</p>
              </div>
              {!isEditingInfo && (
                <button
                  onClick={openEditInfo}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="px-6 py-4">
              {isEditingInfo ? (
                <div className="divide-y divide-gray-100">
                  <EditField
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={draftName}
                    onChange={setDraftName}
                    placeholder="Your full name"
                  />
                  <EditField
                    icon={<Mail className="h-4 w-4" />}
                    label="Email Address"
                    value={draftEmail}
                    onChange={setDraftEmail}
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <InfoRow
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={profile.name}
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email Address"
                    value={profile.email}
                  />
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Member Since"
                    value={memberSince ?? '—'}
                  />
                </div>
              )}
            </div>

            {infoMsg && (
              <div
                className={`mx-6 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  infoMsg.ok
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {infoMsg.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                {infoMsg.text}
              </div>
            )}

            {isEditingInfo && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
                <button
                  onClick={cancelEditInfo}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={saveInfo}
                  disabled={savingInfo}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingInfo ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* ── Security ──────────────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Security</h3>
                <p className="text-xs text-gray-500">Manage your password</p>
              </div>
              {!isChangingPw && (
                <button
                  onClick={openChangePw}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <Lock className="h-3.5 w-3.5" /> Change Password
                </button>
              )}
            </div>

            <div className="px-6 py-4">
              {isChangingPw ? (
                <div className="divide-y divide-gray-100">
                  <EditField
                    icon={<Lock className="h-4 w-4" />}
                    label="New Password"
                    value={newPw}
                    onChange={setNewPw}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowNewPw((p) => !p)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showNewPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                  <EditField
                    icon={<Lock className="h-4 w-4" />}
                    label="Confirm New Password"
                    value={confirmPw}
                    onChange={setConfirmPw}
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((p) => !p)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPw ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <InfoRow
                    icon={<Lock className="h-4 w-4" />}
                    label="Password"
                    value="••••••••"
                  />
                </div>
              )}
            </div>

            {pwMsg && (
              <div
                className={`mx-6 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  pwMsg.ok
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {pwMsg.ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                {pwMsg.text}
              </div>
            )}

            {isChangingPw && (
              <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
                <button
                  onClick={cancelChangePw}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={savePassword}
                  disabled={savingPw}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {savingPw ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
