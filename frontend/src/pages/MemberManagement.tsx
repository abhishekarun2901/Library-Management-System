import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, Input, Select } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import {
  FormField,
  SearchCard,
  ListItemCard,
  Banner,
} from '../components/composite'
import { Modal } from '../components/overlay'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'
import {
  getUsers,
  registerUser,
  updateUser,
  deleteUser,
  type UserResponse,
} from '../services/userService'

type Status = 'active' | 'blacklisted' | 'inactive'

const statusBadgeVariant: Record<Status, 'available' | 'overdue' | 'pending'> =
  {
    active: 'available',
    blacklisted: 'overdue',
    inactive: 'pending',
  }

const deriveStatus = (user: UserResponse): Status => {
  if (!user.isActive) return user.blacklistReason ? 'blacklisted' : 'inactive'
  return 'active'
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const emptyForm = { name: '', email: '', password: '', role: '' }
const emptyEditForm = { name: '', isActive: true, blacklistReason: '' }

const ITEMS_PER_PAGE = 8

export const MemberManagement = () => {
  const { token } = useAuthStore()

  const [members, setMembers] = useState<UserResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<UserResponse | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [isBlacklistOpen, setIsBlacklistOpen] = useState(false)
  const [blacklistTarget, setBlacklistTarget] = useState<UserResponse | null>(
    null
  )
  const [blacklistReasonInput, setBlacklistReasonInput] = useState('')
  const [blacklisting, setBlacklisting] = useState(false)

  const loadMembers = (page: number) => {
    if (!token) return
    setLoading(true)
    getUsers({ page: page - 1, size: ITEMS_PER_PAGE }, token)
      .then((data) => {
        setMembers(data.content)
        setTotalElements(data.totalElements)
        setTotalPages(Math.max(1, data.totalPages))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMembers(1)
  }, [token])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadMembers(page)
  }

  /** Immediately updates a member in local state (optimistic UI). */
  const patchMember = (userId: string, patch: Partial<UserResponse>) => {
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, ...patch } : m))
    )
  }

  const handleAdd = async () => {
    if (!token) return
    setSaving(true)
    try {
      await registerUser(
        {
          email: form.email,
          password: form.password,
          fullName: form.name,
          role: form.role || 'member',
        },
        token
      )
      setShowSuccess(`Member "${form.name}" registered successfully.`)
      setForm(emptyForm)
      setIsAddOpen(false)
      setCurrentPage(1)
      loadMembers(1)
    } catch (e: unknown) {
      setShowSuccess(e instanceof Error ? e.message : 'Failed to add member.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!token || !editingMember) return
    setSaving(true)
    try {
      await updateUser(
        editingMember.userId,
        {
          fullName: editForm.name || undefined,
          isActive: editForm.isActive,
          blacklistReason: editForm.blacklistReason || null,
        },
        token
      )
      patchMember(editingMember.userId, {
        fullName: editForm.name || editingMember.fullName,
        isActive: editForm.isActive,
        blacklistReason: editForm.blacklistReason || null,
      })
      setShowSuccess(
        `Member "${editForm.name || editingMember.fullName}" updated successfully.`
      )
      setEditingMember(null)
      setEditForm(emptyEditForm)
      setIsEditOpen(false)
    } catch (e: unknown) {
      setShowSuccess(
        e instanceof Error ? e.message : 'Failed to update member.'
      )
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (member: UserResponse) => {
    setEditingMember(member)
    setEditForm({
      name: member.fullName,
      isActive: member.isActive,
      blacklistReason: member.blacklistReason ?? '',
    })
    setIsEditOpen(true)
  }

  const openDelete = (member: UserResponse) => {
    setDeleteTarget(member)
    setIsDeleteOpen(true)
  }

  const handleSetActive = async (member: UserResponse) => {
    if (!token) return
    patchMember(member.userId, { isActive: true, blacklistReason: null })
    try {
      await updateUser(
        member.userId,
        { isActive: true, blacklistReason: null },
        token
      )
      setShowSuccess(`${member.fullName} is now Active.`)
    } catch (e) {
      patchMember(member.userId, {
        isActive: member.isActive,
        blacklistReason: member.blacklistReason,
      })
      setShowSuccess(
        e instanceof Error ? e.message : 'Failed to update status.'
      )
    }
  }

  const handleSetInactive = async (member: UserResponse) => {
    if (!token) return
    patchMember(member.userId, { isActive: false, blacklistReason: null })
    try {
      await updateUser(
        member.userId,
        { isActive: false, blacklistReason: null },
        token
      )
      setShowSuccess(`${member.fullName} is now Inactive.`)
    } catch (e) {
      patchMember(member.userId, {
        isActive: member.isActive,
        blacklistReason: member.blacklistReason,
      })
      setShowSuccess(
        e instanceof Error ? e.message : 'Failed to update status.'
      )
    }
  }

  const openBlacklist = (member: UserResponse) => {
    setBlacklistTarget(member)
    setBlacklistReasonInput(member.blacklistReason ?? '')
    setIsBlacklistOpen(true)
  }

  const handleBlacklist = async () => {
    if (!token || !blacklistTarget) return
    setBlacklisting(true)
    const reason = blacklistReasonInput.trim() || 'Blacklisted by admin'
    patchMember(blacklistTarget.userId, {
      isActive: false,
      blacklistReason: reason,
    })
    try {
      await updateUser(
        blacklistTarget.userId,
        { isActive: false, blacklistReason: reason },
        token
      )
      setShowSuccess(`${blacklistTarget.fullName} has been blacklisted.`)
      setIsBlacklistOpen(false)
      setBlacklistTarget(null)
      setBlacklistReasonInput('')
    } catch (e) {
      patchMember(blacklistTarget.userId, {
        isActive: blacklistTarget.isActive,
        blacklistReason: blacklistTarget.blacklistReason,
      })
      setShowSuccess(
        e instanceof Error ? e.message : 'Failed to blacklist member.'
      )
    } finally {
      setBlacklisting(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!token || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteUser(deleteTarget.userId, token)
      setMembers((prev) => prev.filter((m) => m.userId !== deleteTarget.userId))
      setTotalElements((prev) => prev - 1)
      setShowSuccess(
        `Member "${deleteTarget.fullName}" has been permanently removed.`
      )
      setIsDeleteOpen(false)
      setDeleteTarget(null)
    } catch (e: unknown) {
      setShowSuccess(
        e instanceof Error ? e.message : 'Failed to delete member.'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Client-side filter of current page by search/status
  const filtered = members.filter((m) => {
    const matchSearch =
      search.length < 2 ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || deriveStatus(m) === filterStatus
    return matchSearch && matchStatus
  })

  const activeCount = members.filter(
    (m) => m.isActive && !m.blacklistReason
  ).length
  const blacklistedCount = members.filter((m) => !!m.blacklistReason).length
  const inactiveCount = members.filter(
    (m) => !m.isActive && !m.blacklistReason
  ).length

  const isAddFormValid =
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.trim().length >= 6

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (currentPage > 4) pages.push('...')
    const s = Math.max(2, currentPage - 2),
      e = Math.min(totalPages - 1, currentPage + 2)
    for (let i = s; i <= e; i++) pages.push(i)
    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Member Management">
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title="Member Management"
          description="View, add, and manage library members"
          action={
            <div className="flex items-center gap-3">
              <Button
                onClick={() => {
                  setForm(emptyForm)
                  setIsAddOpen(true)
                }}
              >
                Add Member
              </Button>
              <Link to="/librarian">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {showSuccess ? (
          <Banner
            title={showSuccess}
            variant="info"
            onClose={() => setShowSuccess(null)}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Members',
              value: String(totalElements),
              color: 'text-gray-900',
            },
            {
              label: 'Active',
              value: String(activeCount),
              color: 'text-green-600',
            },
            {
              label: 'Blacklisted',
              value: String(blacklistedCount),
              color: 'text-red-600',
            },
            {
              label: 'Inactive',
              value: String(inactiveCount),
              color: 'text-yellow-600',
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <SearchCard
          title="Search Members"
          description="Find members by name or email"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search by name or email…"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="All"
                options={[
                  { label: 'All', value: '' },
                  { label: 'Active', value: 'active' },
                  { label: 'Blacklisted', value: 'blacklisted' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setFilterStatus('')
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </SearchCard>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium text-gray-900">{filtered.length}</span>{' '}
            member{filtered.length !== 1 ? 's' : ''} on this page
            {' · '}
            <span className="font-medium text-gray-900">
              {totalElements}
            </span>{' '}
            total
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading members…
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((member) => {
              const status = deriveStatus(member)
              return (
                <ListItemCard
                  key={member.userId}
                  title={member.fullName}
                  subtitle={`${member.email} · ${member.role} · Joined ${fmtDate(member.createdAt)}`}
                  meta={
                    member.blacklistReason
                      ? `Blacklist reason: ${member.blacklistReason}`
                      : undefined
                  }
                  action={
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        variant={statusBadgeVariant[status]}
                      />
                      <div className="flex items-center gap-1">
                        <button
                          disabled={status === 'active'}
                          onClick={() => handleSetActive(member)}
                          title="Set Active"
                          className="rounded-md border border-green-300 px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          Activate
                        </button>
                        <button
                          disabled={status === 'inactive'}
                          onClick={() => handleSetInactive(member)}
                          title="Set Inactive"
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          Deactivate
                        </button>
                        <button
                          disabled={status === 'blacklisted'}
                          onClick={() => openBlacklist(member)}
                          title="Blacklist member"
                          className="rounded-md border border-orange-300 px-2 py-1 text-xs font-medium text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          Blacklist
                        </button>
                      </div>
                      <Button
                        variant="secondary"
                        className="text-xs"
                        onClick={() => openEdit(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="text-xs text-red-600 hover:text-red-700"
                        onClick={() => openDelete(member)}
                      >
                        Delete
                      </Button>
                    </div>
                  }
                />
              )
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No members found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
            <p className="text-sm text-gray-600">
              Page{' '}
              <span className="font-medium text-gray-900">{currentPage}</span>{' '}
              of <span className="font-medium text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ← Previous
              </Button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-sm text-gray-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                )
              )}
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        open={isAddOpen}
        title="Register New Member"
        onClose={() => {
          setIsAddOpen(false)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleAdd} disabled={!isAddFormValid || saving}>
            {saving ? 'Saving…' : 'Add Member'}
          </Button>
        }
      >
        <div className="space-y-4">
          <FormField label="Full Name" htmlFor="add-name" required>
            <Input
              id="add-name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Email Address" htmlFor="add-email" required>
            <Input
              id="add-email"
              type="email"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField
            label="Password"
            htmlFor="add-password"
            required
            helperText="Minimum 6 characters"
          >
            <Input
              id="add-password"
              type="password"
              placeholder="Initial password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          <FormField label="Role" htmlFor="add-role" required>
            <Select
              id="add-role"
              placeholder="Select a role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { label: 'Member', value: 'member' },
                { label: 'Librarian (Admin)', value: 'librarian' },
              ]}
            />
          </FormField>
        </div>
      </Modal>

      {/* Blacklist Member Modal */}
      <Modal
        open={isBlacklistOpen}
        title="Blacklist Member"
        onClose={() => {
          setIsBlacklistOpen(false)
          setBlacklistTarget(null)
          setBlacklistReasonInput('')
        }}
        primaryAction={
          <Button
            className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
            onClick={handleBlacklist}
            disabled={blacklisting}
          >
            {blacklisting ? 'Blacklisting…' : 'Confirm Blacklist'}
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are blacklisting{' '}
            <span className="font-semibold text-gray-900">
              {blacklistTarget?.fullName}
            </span>
            . Their account will be deactivated. Provide a reason below.
          </p>
          <FormField
            label="Blacklist Reason"
            htmlFor="blacklist-reason"
            helperText="Defaults to 'Blacklisted by admin' if left blank"
          >
            <Input
              id="blacklist-reason"
              placeholder="e.g. Repeated overdue returns, damaged book…"
              value={blacklistReasonInput}
              onChange={(e) => setBlacklistReasonInput(e.target.value)}
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Member Modal (Soft Delete) */}
      <Modal
        open={isDeleteOpen}
        title="Delete Member"
        onClose={() => {
          setIsDeleteOpen(false)
          setDeleteTarget(null)
        }}
        primaryAction={
          <Button
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            onClick={handleDeleteMember}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Member'}
          </Button>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-gray-900">
            {deleteTarget?.fullName}
          </span>
          ? This is a soft delete — the account will be removed from the system
          and can only be restored directly in the database.
        </p>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={isEditOpen}
        title="Edit Member"
        onClose={() => {
          setIsEditOpen(false)
          setEditingMember(null)
          setEditForm(emptyEditForm)
        }}
        primaryAction={
          <Button onClick={handleEdit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      >
        {editingMember ? (
          <div className="space-y-4">
            <FormField label="Full Name" htmlFor="edit-name">
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </FormField>
            <FormField label="Account Status" htmlFor="edit-status">
              <Select
                id="edit-status"
                value={
                  editForm.isActive
                    ? 'active'
                    : editForm.blacklistReason
                      ? 'blacklisted'
                      : 'inactive'
                }
                onChange={(e) => {
                  const v = e.target.value
                  if (v === 'active')
                    setEditForm({
                      ...editForm,
                      isActive: true,
                      blacklistReason: '',
                    })
                  else if (v === 'inactive')
                    setEditForm({
                      ...editForm,
                      isActive: false,
                      blacklistReason: '',
                    })
                  else setEditForm({ ...editForm, isActive: false })
                }}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Blacklisted', value: 'blacklisted' },
                ]}
              />
            </FormField>
            {!editForm.isActive && (
              <FormField
                label="Blacklist Reason"
                htmlFor="edit-blacklist"
                helperText={
                  editForm.blacklistReason
                    ? 'Clear this field to switch to plain inactive'
                    : 'Enter a reason to mark as blacklisted'
                }
              >
                <Input
                  id="edit-blacklist"
                  placeholder="e.g. Overdue books, damage…"
                  value={editForm.blacklistReason}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      blacklistReason: e.target.value,
                    })
                  }
                />
              </FormField>
            )}
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  )
}
