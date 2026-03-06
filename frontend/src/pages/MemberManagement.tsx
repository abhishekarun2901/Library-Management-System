import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Input, Select } from "../components/ui"
import { AppLayout, PageHeader } from "../components/layout"
import { FormField, SearchCard, ListItemCard, Banner } from "../components/composite"
import { Modal } from "../components/overlay"
import { librarianSidebarItems as sidebarItems } from "../config/sidebarConfig"

type Member = {
  id: string
  name: string
  email: string
  phone: string
  status: "active" | "suspended" | "expired"
  joinDate: string
  activeLoans: number
}

const initialMembers: Member[] = [
  { id: "M001", name: "Alex Johnson", email: "alex@example.com", phone: "555-0101", status: "active", joinDate: "Jan 15, 2025", activeLoans: 2 },
  { id: "M002", name: "Maria Garcia", email: "maria@example.com", phone: "555-0102", status: "active", joinDate: "Mar 22, 2025", activeLoans: 0 },
  { id: "M003", name: "James Wilson", email: "james@example.com", phone: "555-0103", status: "suspended", joinDate: "Jun 10, 2025", activeLoans: 4 },
  { id: "M004", name: "Emily Chen", email: "emily@example.com", phone: "555-0104", status: "active", joinDate: "Aug 5, 2025", activeLoans: 1 },
  { id: "M005", name: "Robert Brown", email: "robert@example.com", phone: "555-0105", status: "expired", joinDate: "Sep 1, 2024", activeLoans: 0 },
  { id: "M006", name: "Sarah Davis", email: "sarah@example.com", phone: "555-0106", status: "active", joinDate: "Nov 18, 2025", activeLoans: 3 },
]

const statusBadgeVariant: Record<string, "available" | "overdue" | "pending"> = {
  active: "available",
  suspended: "overdue",
  expired: "pending",
}

const emptyForm = { name: "", email: "", phone: "", role: "" }

export const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      search.length < 2 ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || m.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleAdd = () => {
    const newMember: Member = {
      id: `M${String(members.length + 1).padStart(3, "0")}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      status: "active",
      joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      activeLoans: 0,
    }
    setMembers([newMember, ...members])
    setForm(emptyForm)
    setIsAddOpen(false)
    setShowSuccess(`Member "${newMember.name}" added successfully.`)
  }

  const handleEdit = () => {
    if (!editingMember) return
    setMembers(
      members.map((m) =>
        m.id === editingMember.id
          ? { ...m, name: form.name, email: form.email, phone: form.phone }
          : m
      )
    )
    setForm(emptyForm)
    setEditingMember(null)
    setIsEditOpen(false)
    setShowSuccess(`Member "${form.name}" updated successfully.`)
  }

  const openEdit = (member: Member) => {
    setEditingMember(member)
    setForm({ name: member.name, email: member.email, phone: member.phone, role: "" })
    setIsEditOpen(true)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setIsAddOpen(true)
  }

  const memberFormFields = (
    <div className="space-y-4">
      <FormField label="Full Name" htmlFor="member-name" required>
        <Input
          id="member-name"
          placeholder="e.g. John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </FormField>
      <FormField label="Email Address" htmlFor="member-email" required>
        <Input
          id="member-email"
          type="email"
          placeholder="e.g. john@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </FormField>
      <FormField label="Phone Number" htmlFor="member-phone">
        <Input
          id="member-phone"
          type="tel"
          placeholder="e.g. 555-0100"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </FormField>
    </div>
  )

  const addMemberFormFields = (
    <div className="space-y-4">
      {memberFormFields.props.children}
      <FormField label="Role" htmlFor="member-role" required>
        <Select
          id="member-role"
          placeholder="Select a role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          options={[
            { label: "Librarian (Admin)", value: "librarian" },
            { label: "Member", value: "member" },
          ]}
        />
      </FormField>
    </div>
  )

  const isFormValid = form.name.trim() !== "" && form.email.trim() !== ""

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Member Management">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Member Management"
          description="View, add, and manage library members"
          action={
            <div className="flex items-center gap-3">
              <Button onClick={openAdd}>Add Member</Button>
              <Link to="/librarian">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {/* Success Banner */}
        {showSuccess ? (
          <Banner
            title={showSuccess}
            variant="info"
            onClose={() => setShowSuccess(null)}
          />
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{members.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {members.filter((m) => m.status === "active").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Suspended</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {members.filter((m) => m.status === "suspended").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Expired</p>
            <p className="mt-1 text-2xl font-semibold text-yellow-600">
              {members.filter((m) => m.status === "expired").length}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchCard title="Search Members" description="Find members by name, email, or ID">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search by name, email, or member ID..."
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="All Statuses"
                options={[
                  { label: "All Statuses", value: "" },
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" },
                  { label: "Expired", value: "expired" },
                ]}
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setSearch("")
                  setFilterStatus("")
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </SearchCard>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredMembers.length}</span> of{" "}
            <span className="font-medium text-gray-900">{members.length}</span> members
          </p>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <ListItemCard
              key={member.id}
              title={
                <div className="flex items-center gap-2">
                  <span>{member.name}</span>
                  <Badge label={member.id} variant="issued" />
                </div>
              }
              subtitle={
                <span>
                  {member.email} · {member.phone} · Joined {member.joinDate}
                </span>
              }
              meta={`${member.activeLoans} active loan${member.activeLoans !== 1 ? "s" : ""}`}
              action={
                <div className="flex items-center gap-2">
                  <Badge
                    label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    variant={statusBadgeVariant[member.status]}
                  />
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => openEdit(member)}
                  >
                    Edit
                  </Button>
                </div>
              }
            />
          ))}

          {filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">No members found matching your search criteria.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        open={isAddOpen}
        title="Add New Member"
        onClose={() => {
          setIsAddOpen(false)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleAdd} disabled={!isFormValid}>
            Add Member
          </Button>
        }
      >
        {addMemberFormFields}
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        open={isEditOpen}
        title="Edit Member"
        onClose={() => {
          setIsEditOpen(false)
          setEditingMember(null)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleEdit} disabled={!isFormValid}>
            Save Changes
          </Button>
        }
      >
        {editingMember ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Member ID</p>
              <p className="font-medium text-gray-900">{editingMember.id}</p>
            </div>
            {memberFormFields}
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  )
}
