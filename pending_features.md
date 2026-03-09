# LBMS — Architecture Reference & Remaining Work

Last updated: March 8, 2026

---

## System Architecture

### Infrastructure

- Frontend: React + Vite + TypeScript, served on port 5173
- Backend: Spring Boot 3 (Java 17), served on port 8080 (mapped to 8000 on host)
- Database: PostgreSQL 15, port 5432
- All three run as Docker containers via `docker-compose.yml`
- Container names: `library_frontend`, `library_backend`, `library_db`

### Request Flow

```
Browser → frontend (port 5173)
       → fetch(`http://localhost:8000/v1/...`)   [direct, no Vite proxy]
       → Spring Boot controller
       → Service layer
       → JPA Repository
       → PostgreSQL
```

---

## Frontend Architecture

### API Layer

- `src/lib/apiClient.ts` — single `apiFetch<T>(path, options, token)` function
  - Prepends `http://localhost:8000` (or `VITE_API_BASE_URL` env var)
  - Attaches `Authorization: Bearer <token>` header
  - On non-2xx: parses JSON body, extracts `detail` > `message` > `error` > raw text
  - On 204 / empty body: returns `undefined` without calling `.json()`

### Auth State

- `src/store/authStore.ts` — Zustand store, persisted to localStorage as `lbms-auth`
- Stores: `token`, `role` (`admin` | `member`), `fullName`, `memberSince`, `isAuthenticated`
- Does NOT persist `userId` — pages that need it call `getCurrentUser(token)` on mount

### Service Files → API Endpoints

| Service file             | Calls                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `authService.ts`         | `POST /v1/auth/login`, `POST /v1/auth/register`, `GET /v1/auth/me`                                                             |
| `bookService.ts`         | `GET /v1/books`, `POST /v1/books`, `PATCH /v1/books/{id}`, `DELETE /v1/books/{id}`, `POST /v1/copies`, `PATCH /v1/copies/{id}` |
| `userService.ts`         | `GET /v1/users`, `PATCH /v1/users/{id}`, `DELETE /v1/users/{id}`, `GET /v1/users?scope=fines`, `GET /v1/users?scope=history`   |
| `reservationService.ts`  | `GET /v1/reservations`, `POST /v1/reservations`, `PATCH /v1/reservations/{id}`, `DELETE /v1/reservations/{id}`                 |
| `transactionService.ts`  | `GET /v1/transactions`, `POST /v1/transactions`, `PATCH /v1/transactions/{id}`                                                 |
| `fineService.ts`         | `GET /v1/fines`, `PATCH /v1/fines/{id}`                                                                                        |
| `notificationService.ts` | `GET /v1/notifications`, `POST /v1/notifications/{id}/mark-read`                                                               |
| `reportService.ts`       | `GET /v1/reports`                                                                                                              |

### Pages → Services → Routes

| Page                       | Role         | Services used                                                            | Route                       |
| -------------------------- | ------------ | ------------------------------------------------------------------------ | --------------------------- |
| `LoginPage.tsx`            | public       | `authService`                                                            | `/login`                    |
| `SignUpPage.tsx`           | public       | `authService`                                                            | `/signup`                   |
| `MemberDashboard.tsx`      | member       | `userService`, `transactionService`, `notificationService`               | `/member`                   |
| `BookCatalog.tsx`          | member       | `bookService`, `reservationService`                                      | `/member/catalog`           |
| `MyActivityPage.tsx`       | member       | `transactionService`, `reservationService`, `fineService`, `userService` | `/member/activity`          |
| `ProfilePage.tsx`          | member       | `userService`, `transactionService`, `reservationService`                | `/member/profile`           |
| `FinesPaymentsPage.tsx`    | member       | `userService` (getUserFines)                                             | `/member/fines` (if routed) |
| `LibrarianDashboard.tsx`   | admin        | `transactionService`, `bookService`, `userService`                       | `/librarian`                |
| `BookManagement.tsx`       | admin        | `bookService`, `transactionService`                                      | `/librarian/books`          |
| `MemberManagement.tsx`     | admin        | `userService`                                                            | `/librarian/members`        |
| `ReservationsPage.tsx`     | admin/member | `reservationService`                                                     | `/librarian/reservations`   |
| `FinesPaymentsPage.tsx`    | admin        | `fineService`                                                            | `/librarian/fines`          |
| `ReportsPage.tsx`          | admin        | `reportService`                                                          | `/librarian/reports`        |
| `LibrarianProfilePage.tsx` | admin        | `authService` (getCurrentUser)                                           | `/librarian/profile`        |

### Route Guards

- `ProtectedRoute` component in `src/components/router/ProtectedRoute.tsx`
- Reads `isAuthenticated` and `role` from authStore
- Redirects to `/login` if not authenticated
- Redirects to `/` if role does not match `allowedRole`

### Navigation

- `src/config/sidebarConfig.tsx` — defines `librarianSidebarItems` and `memberSidebarItems`
- `src/components/navigation/Topbar.tsx` — notification bell, polls `GET /v1/notifications` every 60s
- `src/components/layout/AppLayout.tsx` — wraps all authenticated pages with sidebar + topbar

---

## Backend Architecture

### Package Structure

```
com.library.lbms
  controller/     HTTP layer — maps routes, validates input, returns ResponseEntity
  service/        Business logic interfaces
  service/impl/   Business logic implementations
  dao/            Spring Data JPA repositories (extends JpaRepository)
  entity/         JPA entities mapped to DB tables
  dto/request/    Inbound payload objects
  dto/response/   Outbound response objects
  exception/      Custom exceptions (BadRequestException, ResourceNotFoundException)
  security/       JWT filter, UserDetailsService, SecurityConfig
```

### Auth Flow

- `POST /v1/auth/login` → `AuthController` → `AuthServiceImpl` → verifies password via `PasswordEncoder` → generates JWT → returns `{token, role, fullName}`
- JWT secret stored in `application.yml` (`jwt.secret`)
- Every subsequent request: `JwtAuthFilter` extracts token from `Authorization` header, validates, loads `UserDetails`, sets `SecurityContextHolder`
- `@PreAuthorize("hasRole('ADMIN')")` used on librarian-only service methods

### Key Business Rules

- Reservation: requires at least one copy with status `AVAILABLE`; expires at next midnight if no pickup date given
- Soft delete: `deleteBook` and `deleteUser` set `isActive = false`, never call `deleteById`
- Fines: `GET /v1/fines` (admin) returns all fines with `memberName` (from `fine.getUser().getFullName()`)
- `GET /v1/users?scope=fines` returns current user's own fines only

### DB Schema Summary

| Table           | Key columns                                                                               |
| --------------- | ----------------------------------------------------------------------------------------- |
| `users`         | `user_id`, `email`, `password_hash`, `role` (enum: member/admin), `is_active`             |
| `books`         | `book_id`, `title`, `isbn`, `is_active`                                                   |
| `book_copies`   | `copy_id`, `book_id`, `status` (enum: AVAILABLE/ISSUED/LOST)                              |
| `transactions`  | `transaction_id`, `copy_id`, `user_id`, `issue_date`, `due_date`, `return_date`, `status` |
| `fines`         | `fine_id`, `transaction_id`, `user_id`, `amount`, `paid`                                  |
| `reservations`  | `reservation_id`, `user_id`, `book_id`, `reserved_at`, `expires_at`, `status`             |
| `notifications` | `notification_id`, `user_id`, `message`, `type`, `is_read`                                |

---

## Remaining Work

### 1. Password Change

- No `PATCH /v1/auth/password` endpoint exists on the backend.
- Frontend: `ProfilePage.tsx` and `LibrarianProfilePage.tsx` have no change-password form.
- Backend work: add endpoint accepting `{currentPassword, newPassword}`, verify with `PasswordEncoder.matches()`, re-encode and save.
- Frontend work: add modal with two fields in both profile pages, call the new endpoint via `authService`.

### 2. Copy Delete

- No `DELETE /v1/copies/{id}` endpoint exists.
- UI: Copy Management modal in `BookManagement.tsx` has Add + Mark Lost but no Delete.
- Backend work: add endpoint, check copy is not ISSUED before deleting.
- Frontend work: add delete button in the copies modal, call via `bookService`.

### 3. MyActivityPage Tab Pagination

- `MyActivityPage.tsx` loads all records for all tabs in one shot.
- No backend change needed — data is already loaded, just needs client-side slicing.
- Pattern to follow: same `resPage` / `RES_PER_PAGE` slice pattern used in `ReservationsPage.tsx`.
- Apply to: Loans tab, Reservations tab, Fines tab, History tab.

---

## Demo Credentials

| Role           | Email                                                                                                                                        | Password     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Admin          | admin@library.com                                                                                                                            | Admin@1234   |
| Member         | member@library.com                                                                                                                           | Member@1234  |
| Admin (seed)   | robert.kim@library.com                                                                                                                       | Password@123 |
| Members (seed) | sarah.chen@gmail.com, james.wilson@gmail.com, michael.brown@gmail.com, emily.davis@gmail.com, david.garcia@gmail.com, lisa.johnson@gmail.com | Password@123 |

---

## Feature Flows

### 1. Login / Registration

**Login**

- `LoginPage.tsx` → `authService.login(email, password)` → `POST /v1/auth/login`
- Backend: `AuthController` → `AuthServiceImpl.login()` → `PasswordEncoder.matches()` → `JwtUtil.generateToken()`
- Response: `{ token, role, fullName, memberSince }`
- Frontend: stores all fields in Zustand `lbms-auth` (localStorage), sets `isAuthenticated = true`
- `App.tsx` redirects to `/librarian` if role is `admin`, else `/member`

**Registration**

- `SignUpPage.tsx` → `authService.register(payload)` → `POST /v1/auth/register`
- Backend: `UserServiceImpl.createUser()` — checks email uniqueness, encodes password, saves with `role = member`
- On success: redirects to `/login` (does not auto-login)

---

### 2. Book Catalog & Reserve (Member)

**Page load** (`BookCatalog.tsx`)

- `getBooks({ page, size, title?, category? }, token)` → `GET /v1/books?page=0&size=8`
- `getReservations(token)` → `GET /v1/reservations` → filters `status === 'active'` → builds `myActiveBookIds` Set
- `getCurrentUser(token)` → `GET /v1/users?scope=me` → stores `currentUserId`
- Renders paginated grid; "Reserve" button disabled if `trueAvailableStock === 0` or book already in `myActiveBookIds`

**Search / Filter**

- User types title or selects category → `handleSearch()` resets page to 1, calls `getBooks({ title, category })`
- Pagination buttons call `fetchBooks(page)` → updates `currentPage` state

**Reserve a book**

- Client guard: blocks if `trueAvailableStock <= 0`
- `createReservation(currentUserId, bookId, token)` → `POST /v1/reservations` body `{ userId, bookId }`
- Backend: `ReservationServiceImpl.createReservation()`:
  - Checks user `isActive`, book `isActive`
  - Checks at least one copy `AVAILABLE`
  - Checks user has fewer than 3 active reservations
  - Checks no existing active reservation for same book by same user
  - Sets `expiresAt` = tomorrow midnight (or `pickupDate + 1 day` if scheduled)
  - Saves reservation with `status = active`
- Frontend: adds `bookId` to `myActiveBookIds`, shows success banner

---

### 3. Book Management (Librarian)

**Page load** (`BookManagement.tsx`)

- Parallel: `getBooks(...)` + `getTransactions(token)` + `getUsers(...)` on mount
- Tabs: "Manage Books" (CRUD) and "Issue / Return" (transaction management)

**Add Book**

- "Add Book" modal → `createBook(payload, token)` → `POST /v1/books`
- Payload: `{ title, authorNames[], publisherName, categories[], description, publishDate, numberOfCopies }`
- Backend: `BookServiceImpl.createBook()` — upserts publisher, authors, categories by name; creates `numberOfCopies` copies with `status = AVAILABLE`
- Frontend: refreshes book list on success

**Edit Book**

- "Edit" button on row → opens modal prefilled with book data
- `updateBook(id, payload, token)` → `PATCH /v1/books/{id}` — partial update, only non-null fields applied
- Backend: `BookServiceImpl.updateBook()` — re-links authors/publisher/categories if changed
v
**Delete Book (soft)**

- "Delete" → confirm modal → `deleteBook(id, token)` → `DELETE /v1/books/{id}`
- Backend: `BookServiceImpl.deleteBook()` → sets `book.isActive = false`, never removes row
- Deleted books no longer appear in `GET /v1/books` (query filters `is_active = true`)

**Copy Management**

- "Copies" button → modal showing all `book_copies` rows for that book
- `getCopies(bookId, token)` → `GET /v1/copies?bookId={id}`
- "Add Copy" → `createCopy(bookId, token)` → `POST /v1/copies` body `{ bookId }` → new copy with `status = AVAILABLE`
- "Mark Lost" → `updateCopyStatus(copyId, 'LOST', token)` → `PATCH /v1/copies/{id}` body `{ status: 'LOST' }`

**Issue a Book (Manage tab)**

- Librarian searches for member by name/email, selects member → `getUsers(...)` populates dropdown
- Librarian searches for book, selects available copy
- `issueBook({ userId, copyId }, token)` → `POST /v1/transactions`
- Backend: `TransactionServiceImpl.issueBook()`:
  - Only admin can call this
  - Validates user `isActive`, copy `status === AVAILABLE`, no active transaction on that copy
  - Blocks if user has unpaid fines
  - If an active reservation exists for this book, the first queue entry must belong to this user
  - Sets `copy.status = ISSUED`, saves transaction with `status = issued`, `dueDate = issueDate + 14 days`

**Return a Book**

- `returnBook(transactionId, token)` → `PATCH /v1/transactions/{id}` body `{ status: 'returned' }`
- Backend: `TransactionServiceImpl.updateTransaction()`:
  - Sets `tx.status = returned`, `tx.returnDate = now`, `copy.status = AVAILABLE`
  - Calls `applyOverdueFineIfNeeded(tx, returnTime)`:
    - If `returnTime > dueDate`: calculates `daysLate`, fine = `daysLate * 0.50`
    - Upserts fine row in `fines` table (`paid = false`)
  - Calls `notifyNextReservationIfAny(copy)`:
    - Finds oldest active reservation for that book (FIFO by `reservedAt`)
    - Creates notification row: `"Reservation ready for: {bookTitle}"` for that user

**Mark as Lost**

- `PATCH /v1/transactions/{id}` body `{ status: 'lost' }`
- Backend: sets `copy.status = LOST`, `tx.status = lost`, applies flat $50 lost book fine

---

### 4. Reservations (Librarian)

**Page load** (`ReservationsPage.tsx`, role=librarian)

- `getReservations(token)` → `GET /v1/reservations` (no `userId` param)
- Backend: admin sees all reservations; member sees only their own
- Response includes `queuePosition` (1-based FIFO rank among active reservations for the same book)

**Fulfill a Reservation**

- "Fulfill" button → `updateReservationStatus(reservationId, 'fulfilled', token)` → `PATCH /v1/reservations/{id}?status=fulfilled`
- Backend: sets `reservation.status = fulfilled`
- Typically called after librarian issues the physical book

**Cancel a Reservation**

- Confirm modal → `cancelReservation(reservationId, token)` → `DELETE /v1/reservations/{id}`
- Backend: validates `status === 'active'`, sets `status = cancelled`
- Both admin and the reservation's owner can cancel

**Member view** (role=member)

- Same page, same `GET /v1/reservations` — backend filters to current user's reservations only
- Member sees only "Cancel" action; no Fulfill button

---

### 5. Fines & Payments

**Librarian view** (`FinesPaymentsPage.tsx`, role=librarian)

- `getAllFines(token)` → `GET /v1/fines`
- Backend: `FineController.getAllFines()` → `FineServiceImpl.getAllFines()` → returns all rows
- Response: `{ fineId, transactionId, bookTitle, memberName, amount, reason, issuedAt, paid }`
- `memberName` set from `fine.getUser().getFullName()` in `FineServiceImpl.mapToResponse()`
- Table columns: Member, Book, Issued At, Amount, Status, Action
- "Mark Paid" → `payFine(transactionId, token)` → `PATCH /v1/fines/{transactionId}`
- Backend: finds fine by `transactionId`, sets `paid = true`
- Frontend: updates `paid` flag in local state without refetch

**Member view** (role=member)

- `getUserFines(token)` → `GET /v1/users?scope=fines`
- Backend: `UserController` scope `fines` → `UserServiceImpl.getCurrentUserFines()` → `fineRepository.findByUser_UserId(currentUserId)`
- No `memberName` needed (member sees only their own fines)
- "Pay Fine" triggers same `payFine(transactionId, token)` call
member/activity#history
**Fine creation (automatic)**

- Overdue: triggered on return → `daysLate * $0.50` per day
- Lost: triggered on mark-lost → flat $50 penalty
- No scheduled job — fines are created lazily at the time of the return/lost event

---

### 6. Member Management (Librarian)

**Page load** (`MemberManagement.tsx`)

- `getUsers({ page, size }, token)` → `GET /v1/users?page=0&size=8`
- Backend: `@PreAuthorize("hasRole('ADMIN')")` on `getAllUsers()` — returns paginated active users only (`isActive = true`)

**Add Member**

- "Add Member" modal → `registerUser(payload, token)` → `POST /v1/auth/register` (reuses auth endpoint)
- Payload: `{ email, password, fullName, role }`

**Edit Member**

- `updateUser(userId, { fullName, isActive, blacklistReason }, token)` → `PATCH /v1/users/{id}`
- Backend: non-admin can only update their own profile; admin can update anyone
- Setting `isActive = false` with a `blacklistReason` effectively blacklists the member

**Delete Member (soft)**

- Confirm modal → `deleteUser(userId, token)` → `DELETE /v1/users/{id}`
- Backend: `@PreAuthorize("hasRole('ADMIN')")` → checks no active loans and no unpaid fines → sets `isActive = false`, sets `blacklistReason = "Account deactivated by admin"`
- Deleted users no longer appear in `GET /v1/users`

---

### 7. Notifications

**Creation**

- Notifications are created server-side by `TransactionServiceImpl.notifyNextReservationIfAny(copy)`
- Triggered automatically when a book is returned: finds oldest `active` reservation for that book, writes a `notifications` row for that user

**Display**

- `Topbar.tsx` polls `GET /v1/notifications` every 60 seconds
- Backend: `NotificationController.getMyNotifications()` — filters by currently authenticated user's `userId`
- Bell icon shows unread count badge
- Clicking a notification → `markNotificationRead(id, token)` → `POST /v1/notifications/{id}/mark-read`
- Backend: sets `is_read = true`

---

### 8. Librarian Dashboard

**Page load** (`LibrarianDashboard.tsx`)

- Parallel: `getReports(token)` + `getTransactions(token)`
- `GET /v1/reports` → `ReportServiceImpl.getSystemAnalytics()`:
  - `totalInventory` = `SELECT COUNT(*) FROM book_copies`
  - `overdueCount` = transactions with `status = overdue`
  - `lostCount` = transactions with `status = lost`
  - `totalFineRevenue` = `SUM(amount) WHERE paid = true`
  - `totalOutstandingFines` = `SUM(amount) WHERE paid = false`
  - `topBorrowedBooks` = top 5 books by transaction count (custom JPQL query)
  - `mostActiveUsers` = top 5 users by transaction count (custom JPQL query)
- Recent transactions: last 5 sorted by `checkout_date` desc from the full transaction list

---

### 9. Member Dashboard

**Page load** (`MemberDashboard.tsx`)

- `getCurrentUser(token)` → `GET /v1/users?scope=me` → loads profile (but `fullName` already in store)
- `getTransactions(token)` → `GET /v1/transactions` — backend returns current user's transactions only for non-admin
- `getUserFines(token)` → `GET /v1/users?scope=fines`
- `getUserHistory(token)` → `GET /v1/users?scope=history`
- `getNotifications(token)` → `GET /v1/notifications`
- Displays: active loan count, overdue count, unread notifications, recent loans list

**Inline profile edit**

- Edit icon → toggles inline edit mode (name field only)
- `updateUser(userId, { fullName }, token)` → `PATCH /v1/users/{id}`
- On success: updates Zustand store `fullName`

---

### 10. IssueBook Page (Static Placeholder)

- `IssueBook.tsx` currently uses hardcoded dummy data (`dummyMembers`, `dummyBooks`)
- Not connected to any API — no `apiFetch` calls
- Functionality is fully covered by the "Issue" tab inside `BookManagement.tsx`
- This page is routed at `/librarian/issue` but is not in active use
