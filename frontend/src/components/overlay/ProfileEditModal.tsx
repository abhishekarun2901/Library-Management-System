import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { getCurrentUser, updateUser } from '../../services/userService'
import { loginUser } from '../../services/authService'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'security'

export type ProfileEditModalProps = {
  open: boolean
  onClose: () => void
  /** Called after a successful profile info save with updated name & email */
  onProfileUpdate?: (name: string, email: string) => void
}

// ── Sub-components ─────────────────────────────────────────────────────────────

type EditFieldProps = {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  suffix?: React.ReactNode
  readOnly?: boolean
}

const EditField = ({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  suffix,
  readOnly,
}: EditFieldProps) => (
  <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
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
          readOnly={readOnly}
          className={`h-9 w-full rounded-lg border px-3 pr-10 text-sm text-gray-900 shadow-sm outline-none transition ${
            readOnly
              ? 'cursor-default border-gray-100 bg-gray-50 text-gray-500'
              : 'border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
          }`}
        />
        {suffix && (
          <div className="absolute right-2 flex items-center">{suffix}</div>
        )}
      </div>
    </div>
  </div>
)

// ── Util ───────────────────────────────────────────────────────────────────────

function showMsg(
  setter: React.Dispatch<
    React.SetStateAction<{ ok: boolean; text: string } | null>
  >,
  timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  msg: { ok: boolean; text: string }
) {
  if (timer.current) clearTimeout(timer.current)
  setter(msg)
  timer.current = setTimeout(() => setter(null), 4000)
}

// ── Modal ──────────────────────────────────────────────────────────────────────

export const ProfileEditModal = ({
  open,
  onClose,
  onProfileUpdate,
}: ProfileEditModalProps) => {
  const { isAuthenticated, fullName, memberSince, role, setAuth } =
    useAuthStore()
  const isLibrarian = role === 'admin'

  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState({ name: fullName ?? '', email: '' })

  // Fetch fresh data whenever modal opens
  useEffect(() => {
    if (!isAuthenticated || !open) return
    getCurrentUser()
      .then((me) => {
        setUserId(me.userId)
        setProfile({ name: me.fullName, email: me.email })
        setDraftName(me.fullName)
        setDraftEmail(me.email)
      })
      .catch(console.error)
  }, [isAuthenticated, open])

  const initials =
    profile.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('info')

  // ── Profile info ───────────────────────────────────────────────────────────
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMsg, setInfoMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  )
  const infoMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveInfo = async () => {
    if (!userId) return
    setSavingInfo(true)
    setInfoMsg(null)
    try {
      const updated = await updateUser(userId, {
        fullName: draftName.trim() || undefined,
        email: draftEmail.trim() || undefined,
      })
      setProfile({ name: updated.fullName, email: updated.email })
      setAuth({
        userId: userId ?? null,
        role,
        fullName: updated.fullName,
        memberSince: memberSince ?? null,
      })
      onProfileUpdate?.(updated.fullName, updated.email)
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

  // ── Password ───────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const pwMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const savePassword = async () => {
    if (!userId) return
    if (!currentPw) {
      setPwMsg({ ok: false, text: 'Please enter your current password.' })
      return
    }
    if (newPw.length < 8) {
      setPwMsg({
        ok: false,
        text: 'New password must be at least 8 characters.',
      })
      return
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'Passwords do not match.' })
      return
    }
    setSavingPw(true)
    setPwMsg(null)
    try {
      await loginUser({ email: profile.email, password: currentPw })
    } catch {
      setSavingPw(false)
      setPwMsg({ ok: false, text: 'Current password is incorrect.' })
      return
    }
    try {
      await updateUser(userId, { password: newPw })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      showMsg(setPwMsg, pwMsgTimer, {
        ok: true,
        text: 'Password changed successfully.',
      })
    } catch (e) {
      setPwMsg({
        ok: false,
        text: e instanceof Error ? e.message : 'Failed to change password.',
      })
    } finally {
      setSavingPw(false)
    }
  }

  // ── Close handler ──────────────────────────────────────────────────────────
  const handleClose = () => {
    setTab('info')
    setInfoMsg(null)
    setPwMsg(null)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-5">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-16 h-28 w-28 rounded-full bg-purple-400/20" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg font-bold text-white ring-2 ring-white/30">
                {initials}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  {profile.name || 'Edit Profile'}
                </h2>
                <p className="text-xs text-indigo-200">{profile.email}</p>
                {isLibrarian ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-medium text-amber-100">
                    <Shield className="h-2.5 w-2.5" /> Librarian / Admin
                  </span>
                ) : (
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2 py-0.5 text-[10px] font-medium text-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{' '}
                    Active Member
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100">
          {(['info', 'security'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                tab === t
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'info' ? 'Profile Info' : 'Security'}
            </button>
          ))}
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-4">
          {tab === 'info' ? (
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
              <EditField
                icon={<Calendar className="h-4 w-4" />}
                label={isLibrarian ? 'Account Created' : 'Member Since'}
                value={memberSince ?? '—'}
                onChange={() => {}}
                readOnly
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <EditField
                icon={<Lock className="h-4 w-4" />}
                label="Current Password"
                value={currentPw}
                onChange={setCurrentPw}
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Enter your current password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((p) => !p)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
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
          )}

          {/* Feedback messages */}
          {tab === 'info' && infoMsg && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
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
          {tab === 'security' && pwMsg && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
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
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <X className="h-4 w-4" /> Close
          </button>
          {tab === 'info' ? (
            <button
              onClick={saveInfo}
              disabled={savingInfo}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingInfo ? 'Saving…' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={savePassword}
              disabled={savingPw}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
