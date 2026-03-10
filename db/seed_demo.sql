-- =============================================================================
-- seed_demo.sql
-- Full demo seed: users, issued books, overdue transactions, fines,
-- reservations, notifications — simulates all LBMS features.
--
-- All demo user passwords: Password@123
--
-- NOTE: The second admin (robert.kim) can only be assigned via an authenticated
--       admin in the live app. Here it is inserted directly for demo purposes.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. USERS  (7 new — 6 members + 1 admin)
-- =============================================================================
INSERT INTO users (
  user_id, email, password_hash, full_name, role,
  is_active, blacklist_reason,
  created_at, updated_at, last_login_at
) VALUES

  -- ── Second Admin (assigned by existing admin) ──────────────────────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'robert.kim@library.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'Robert Kim', 'admin', true, NULL,
    NOW() - INTERVAL '180 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),

  -- ── Member: good standing, has returned books historically ─────────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000002',
    'james.wilson@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'James Wilson', 'member', true, NULL,
    NOW() - INTERVAL '90 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),

  -- ── Member: currently has a book issued (due in 7 days) ────────────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000003',
    'sarah.chen@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'Sarah Chen', 'member', true, NULL,
    NOW() - INTERVAL '60 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),

  -- ── Member: overdue book + unpaid fine ─────────────────────────────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000004',
    'michael.brown@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'Michael Brown', 'member', true, NULL,
    NOW() - INTERVAL '120 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  -- ── Member: active reservation, has a book currently issued ────────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000005',
    'emily.davis@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'Emily Davis', 'member', true, NULL,
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),

  -- ── Member: blacklisted — overdue 21 days, unpaid fine $12.50 ──────────────
  (
    'a1b2c3d4-0001-0001-0001-000000000006',
    'david.garcia@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'David Garcia', 'member', false,
    'Account suspended: unpaid fines exceed $10.00 and book overdue > 20 days.',
    NOW() - INTERVAL '200 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ),

  -- ── Member: full history — borrowed many books, one late (fine paid) ───────
  (
    'a1b2c3d4-0001-0001-0001-000000000007',
    'lisa.johnson@gmail.com',
    crypt('Password@123', gen_salt('bf', 10)),
    'Lisa Johnson', 'member', true, NULL,
    NOW() - INTERVAL '150 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  );


-- =============================================================================
-- 2. TRANSACTIONS
--
-- Uses the following copies (from existing seeded books):
--   copy 7e0ec866  → "A Walk in the Woods"       (will be set ISSUED)
--   copy 472f30e3  → "The Cowboy"                 (will be set ISSUED — overdue)
--   copy 4c131c1f  → "Chesapeake Blue"            (will be set ISSUED — overdue)
--   copy 32e48226  → "The big foundations"        (will be set ISSUED)
--   copy c9e78686  → "Love, Janis"                (will be set ISSUED)
--   copy 16d79d94  → "Summerland"                 (returned — AVAILABLE)
--   copy 7c6bc4dc  → "God's Promises"             (returned — AVAILABLE)
--   copy 7db50cb5  → "Savage Art"                 (returned late — AVAILABLE)
--   copy 0914e3c0  → "Sounding The Waters"        (returned — AVAILABLE)
--   copy 51f2aaa3  → "Little Wilson and Big God"  (returned — AVAILABLE)
-- =============================================================================
INSERT INTO transactions (
  transaction_id, copy_id, user_id,
  issue_date, due_date, return_date, status
) VALUES

  -- ── ACTIVE / ISSUED ─────────────────────────────────────────────────────────

  -- Sarah: checked out "A Walk in the Woods" 7 days ago, due in 7 more days
  (
    'b1000000-0000-0000-0000-000000000001',
    '7e0ec866-9987-49d9-881a-b30622ae1c78',
    'a1b2c3d4-0001-0001-0001-000000000003',
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '7 days',
    NULL, 'issued'
  ),

  -- member@library.com: checked out "The big foundations" 3 days ago, due in 11 days
  (
    'b1000000-0000-0000-0000-000000000002',
    '32e48226-d1c0-4727-a93c-0386f97b31f8',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '11 days',
    NULL, 'issued'
  ),

  -- Emily: checked out "Love, Janis" 5 days ago, due in 9 days
  (
    'b1000000-0000-0000-0000-000000000003',
    'c9e78686-ebe0-4f85-97f2-73ef27eb8cb7',
    'a1b2c3d4-0001-0001-0001-000000000005',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '9 days',
    NULL, 'issued'
  ),

  -- ── OVERDUE ─────────────────────────────────────────────────────────────────

  -- Michael: "The Cowboy" — issued 30 days ago, due 16 days ago → OVERDUE
  (
    'b1000000-0000-0000-0000-000000000004',
    '472f30e3-5466-4124-95e5-262225070f85',
    'a1b2c3d4-0001-0001-0001-000000000004',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '16 days',
    NULL, 'overdue'
  ),

  -- David: "Chesapeake Blue" — issued 35 days ago, due 21 days ago → OVERDUE
  (
    'b1000000-0000-0000-0000-000000000005',
    '4c131c1f-0d7d-42bc-9414-0fc22af68270',
    'a1b2c3d4-0001-0001-0001-000000000006',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '21 days',
    NULL, 'overdue'
  ),

  -- ── RETURNED (on time) ──────────────────────────────────────────────────────

  -- James: "Summerland" — returned 5 days ago, was on time
  (
    'b1000000-0000-0000-0000-000000000006',
    '16d79d94-c1de-4d23-8acd-c8f2a8b4a82a',
    'a1b2c3d4-0001-0001-0001-000000000002',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '5 days',
    'returned'
  ),

  -- Lisa: "God's Promises" — returned on time 30 days ago
  (
    'b1000000-0000-0000-0000-000000000007',
    '7c6bc4dc-c050-40e6-a126-7d3bbaf24f93',
    'a1b2c3d4-0001-0001-0001-000000000007',
    NOW() - INTERVAL '75 days',
    NOW() - INTERVAL '61 days',
    NOW() - INTERVAL '65 days',
    'returned'
  ),

  -- Sarah: "Sounding The Waters" — returned on time 20 days ago
  (
    'b1000000-0000-0000-0000-000000000008',
    '0914e3c0-d888-4f08-805d-c43f84438511',
    'a1b2c3d4-0001-0001-0001-000000000003',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '31 days',
    NOW() - INTERVAL '33 days',
    'returned'
  ),

  -- admin@library.com: "Little Wilson and Big God" — returned 75 days ago
  (
    'b1000000-0000-0000-0000-000000000009',
    '51f2aaa3-5e77-42a1-aab7-2ab64ee3c682',
    '97365294-e515-41e1-bc32-bed35bd79fc5',
    NOW() - INTERVAL '100 days',
    NOW() - INTERVAL '86 days',
    NOW() - INTERVAL '75 days',
    'returned'
  ),

  -- ── RETURNED (late — fine was applied) ──────────────────────────────────────

  -- Lisa: "Savage Art" — issued 55 days ago, due 41 days ago,
  --        returned 33 days ago (8 days late) → fine paid
  (
    'b1000000-0000-0000-0000-000000000010',
    '7db50cb5-5819-401d-8946-37711b29c4d4',
    'a1b2c3d4-0001-0001-0001-000000000007',
    NOW() - INTERVAL '55 days',
    NOW() - INTERVAL '41 days',
    NOW() - INTERVAL '33 days',
    'returned'
  ),

  -- James: second borrow — "Sounding The Waters" (different copy via second copy row)
  --        returned slightly late (2 days) — fine paid
  (
    'b1000000-0000-0000-0000-000000000011',
    '3da1cddb-3cba-405e-8f57-1d0899644dd4',
    'a1b2c3d4-0001-0001-0001-000000000002',
    NOW() - INTERVAL '50 days',
    NOW() - INTERVAL '36 days',
    NOW() - INTERVAL '34 days',
    'returned'
  ),

  -- robert.kim (admin): "Savage Art" second copy — returned on time
  (
    'b1000000-0000-0000-0000-000000000012',
    'f39fda68-e399-46f5-aa02-3709237a260d',
    'a1b2c3d4-0001-0001-0001-000000000001',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '18 days',
    'returned'
  ),

  -- ── ADDITIONAL OVERDUE (more fine demo data) ─────────────────────────────────

  -- Emily: "The Lake of Dead Languages" — issued 26 days ago, due 12 days ago → OVERDUE
  (
    'b1000000-0000-0000-0000-000000000013',
    'c781cfb6-9e1b-4cf3-8ff7-cc90bb0b9a8e',
    'a1b2c3d4-0001-0001-0001-000000000005',
    NOW() - INTERVAL '26 days',
    NOW() - INTERVAL '12 days',
    NULL, 'overdue'
  ),

  -- Alice (member@library.com): "The Body in the Ivy" — issued 21 days ago, due 7 days ago → OVERDUE
  (
    'b1000000-0000-0000-0000-000000000014',
    '2a241b5f-f841-4dc0-a796-925f1a88c230',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '7 days',
    NULL, 'overdue'
  ),

  -- Robert Kim: "Waiting: A Novel" — issued 19 days ago, due 5 days ago → OVERDUE
  (
    'b1000000-0000-0000-0000-000000000015',
    'b1f77495-c1de-4dae-9655-f274ae28dba8',
    'a1b2c3d4-0001-0001-0001-000000000001',
    NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '5 days',
    NULL, 'overdue'
  ),

  -- Sarah Chen: "The Sorcerer's Companion" — returned 4 days late
  (
    'b1000000-0000-0000-0000-000000000016',
    'f95823f9-1611-473c-a501-d3f82d3d77e7',
    'a1b2c3d4-0001-0001-0001-000000000003',
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '10 days',
    'returned'
  );


-- =============================================================================
-- 3. UPDATE COPY STATUSES to match active/overdue transactions
-- =============================================================================
UPDATE book_copies SET status = 'ISSUED' WHERE copy_id IN (
  '7e0ec866-9987-49d9-881a-b30622ae1c78',  -- Sarah's copy
  '32e48226-d1c0-4727-a93c-0386f97b31f8',  -- member@library's copy
  'c9e78686-ebe0-4f85-97f2-73ef27eb8cb7',  -- Emily's copy
  '472f30e3-5466-4124-95e5-262225070f85',  -- Michael's overdue copy
  '4c131c1f-0d7d-42bc-9414-0fc22af68270',  -- David's overdue copy
  'c781cfb6-9e1b-4cf3-8ff7-cc90bb0b9a8e',  -- Emily's overdue (Lake of Dead Languages)
  '2a241b5f-f841-4dc0-a796-925f1a88c230',  -- Alice's overdue (The Body in the Ivy)
  'b1f77495-c1de-4dae-9655-f274ae28dba8'   -- Robert's overdue (Waiting: A Novel)
);


-- =============================================================================
-- 4. FINES
-- =============================================================================
INSERT INTO fines (
  fine_id, transaction_id, user_id,
  amount, reason, issued_at, paid
) VALUES

  -- Michael: overdue 16 days × $0.50/day = $8.00 — UNPAID
  (
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000004',
    'a1b2c3d4-0001-0001-0001-000000000004',
    8.00,
    'Book overdue by 16 days. Fine charged at $0.50/day.',
    NOW() - INTERVAL '16 days',
    false
  ),

  -- David: overdue 21 days × $0.50/day + $2 admin fee = $12.50 — UNPAID
  (
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000005',
    'a1b2c3d4-0001-0001-0001-000000000006',
    12.50,
    'Book overdue by 21 days. Fine charged at $0.50/day plus $2.00 admin fee.',
    NOW() - INTERVAL '21 days',
    false
  ),

  -- Lisa: returned "Savage Art" 8 days late — $4.00 fine — PAID
  (
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000010',
    'a1b2c3d4-0001-0001-0001-000000000007',
    4.00,
    'Book returned 8 days past due date. Fine charged at $0.50/day.',
    NOW() - INTERVAL '33 days',
    true
  ),

  -- James: returned "A Walk in the Woods (2nd copy)" 2 days late — $1.00 — PAID
  (
    'c1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000011',
    'a1b2c3d4-0001-0001-0001-000000000002',
    1.00,
    'Book returned 2 days past due date. Fine charged at $0.50/day.',
    NOW() - INTERVAL '34 days',
    true
  ),

  -- Emily: "The Lake of Dead Languages" — 12 days overdue × $0.50 = $6.00 — UNPAID
  (
    'c1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000013',
    'a1b2c3d4-0001-0001-0001-000000000005',
    6.00,
    'Book overdue by 12 days. Fine charged at $0.50/day.',
    NOW() - INTERVAL '12 days',
    false
  ),

  -- Alice (member@library.com): "The Body in the Ivy" — 7 days overdue × $0.50 = $3.50 — UNPAID
  (
    'c1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000014',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    3.50,
    'Book overdue by 7 days. Fine charged at $0.50/day.',
    NOW() - INTERVAL '7 days',
    false
  ),

  -- Robert Kim: "Waiting: A Novel" — 5 days overdue × $0.50 = $2.50 — UNPAID
  (
    'c1000000-0000-0000-0000-000000000007',
    'b1000000-0000-0000-0000-000000000015',
    'a1b2c3d4-0001-0001-0001-000000000001',
    2.50,
    'Book overdue by 5 days. Fine charged at $0.50/day.',
    NOW() - INTERVAL '5 days',
    false
  ),

  -- Sarah Chen: "The Sorcerer's Companion" — returned 4 days late × $0.50 = $2.00 — PAID
  (
    'c1000000-0000-0000-0000-000000000008',
    'b1000000-0000-0000-0000-000000000016',
    'a1b2c3d4-0001-0001-0001-000000000003',
    2.00,
    'Book returned 4 days past due date. Fine charged at $0.50/day.',
    NOW() - INTERVAL '10 days',
    true
  );


-- =============================================================================
-- 5. RESERVATIONS
-- =============================================================================
INSERT INTO reservations (
  reservation_id, user_id, book_id,
  reserved_at, expires_at, status
) VALUES

  -- Emily: active reservation for "The Cowboy" (copy issued to Michael, so she's waiting)
  (
    'd1000000-0000-0000-0000-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000005',
    '90ddb23b-6d3a-4a47-ad4a-1275089b3331',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '22 hours',
    'active'
  ),

  -- James: active reservation for "Chesapeake Blue" (overdue by David, waiting)
  (
    'd1000000-0000-0000-0000-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000002',
    'e308344d-23ba-4370-8807-37622ae105a8',
    NOW() - INTERVAL '3 hours',
    NOW() + INTERVAL '21 hours',
    'active'
  ),

  -- Sarah: active reservation for "Summerland" (copy is available now)
  (
    'd1000000-0000-0000-0000-000000000003',
    'a1b2c3d4-0001-0001-0001-000000000003',
    '0f05c0f5-d00f-4b12-aaff-606bb4d11b03',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '23 hours',
    'active'
  ),

  -- member@library.com: FULFILLED — reserved "The big foundations" and picked it up
  (
    'd1000000-0000-0000-0000-000000000004',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    '853224d2-eb17-43de-b977-3df3f2ddba82',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '3 days',
    'fulfilled'
  ),

  -- Lisa: CANCELLED — changed her mind about reserving "Sounding The Waters"
  (
    'd1000000-0000-0000-0000-000000000005',
    'a1b2c3d4-0001-0001-0001-000000000007',
    '348489c0-0ecc-4c6e-b787-57df906ca25f',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '14 days',
    'cancelled'
  ),

  -- Michael: EXPIRED — reserved "God's Promises" but didn't collect in time
  (
    'd1000000-0000-0000-0000-000000000006',
    'a1b2c3d4-0001-0001-0001-000000000004',
    '21a3b54b-a35a-4fdc-be4d-930017bffe66',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days',
    'expired'
  ),

  -- robert.kim (admin): FULFILLED — reserved and returned "Little Wilson and Big God"
  (
    'd1000000-0000-0000-0000-000000000007',
    'a1b2c3d4-0001-0001-0001-000000000001',
    '7f80068b-66ec-4515-b45f-ad9fc459b90e',
    NOW() - INTERVAL '35 days',
    NOW() - INTERVAL '34 days',
    'fulfilled'
  );


-- =============================================================================
-- 6. NOTIFICATIONS
-- =============================================================================
INSERT INTO notifications (
  notification_id, user_id, message, type, is_read, created_at
) VALUES

  -- Michael: overdue alert
  (
    'e1000000-0000-0000-0000-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000004',
    'Your copy of "The Cowboy" is overdue by 16 days. A fine of $8.00 has been issued. Please return it immediately.',
    'OVERDUE', false,
    NOW() - INTERVAL '2 days'
  ),

  -- Michael: first overdue warning
  (
    'e1000000-0000-0000-0000-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000004',
    'Reminder: Your copy of "The Cowboy" was due on ' || TO_CHAR(NOW() - INTERVAL '16 days', 'Mon DD, YYYY') || '. Please return it as soon as possible.',
    'OVERDUE', true,
    NOW() - INTERVAL '16 days'
  ),

  -- David: account suspended
  (
    'e1000000-0000-0000-0000-000000000003',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'Your account has been suspended due to an overdue book and unpaid fine of $12.50. Please contact the library to resolve this.',
    'ACCOUNT', false,
    NOW() - INTERVAL '10 days'
  ),

  -- David: overdue fine issued
  (
    'e1000000-0000-0000-0000-000000000004',
    'a1b2c3d4-0001-0001-0001-000000000006',
    'A fine of $12.50 has been issued for "Chesapeake Blue (The Chesapeake Bay Saga, Book 4)". Your book is 21 days overdue.',
    'FINE', false,
    NOW() - INTERVAL '21 days'
  ),

  -- Sarah: due soon reminder
  (
    'e1000000-0000-0000-0000-000000000005',
    'a1b2c3d4-0001-0001-0001-000000000003',
    'Reminder: "A Walk in the Woods" is due in 7 days on ' || TO_CHAR(NOW() + INTERVAL '7 days', 'Mon DD, YYYY') || '. Please return or renew on time.',
    'DUE_SOON', false,
    NOW() - INTERVAL '1 hour'
  ),

  -- Sarah: checkout confirmation
  (
    'e1000000-0000-0000-0000-000000000006',
    'a1b2c3d4-0001-0001-0001-000000000003',
    'You have checked out "A Walk in the Woods: Rediscovering America on the Appalachian Trail". Due date: ' || TO_CHAR(NOW() + INTERVAL '7 days', 'Mon DD, YYYY') || '.',
    'CHECKOUT', true,
    NOW() - INTERVAL '7 days'
  ),

  -- Emily: reservation confirmed
  (
    'e1000000-0000-0000-0000-000000000007',
    'a1b2c3d4-0001-0001-0001-000000000005',
    'Your reservation for "The Cowboy" is confirmed.',
    'RESERVATION', false,
    NOW() - INTERVAL '2 hours'
  ),

  -- Emily: checkout confirmation for "Love, Janis"
  (
    'e1000000-0000-0000-0000-000000000008',
    'a1b2c3d4-0001-0001-0001-000000000005',
    'You have checked out "Love, Janis". Due date: ' || TO_CHAR(NOW() + INTERVAL '9 days', 'Mon DD, YYYY') || '.',
    'CHECKOUT', true,
    NOW() - INTERVAL '5 days'
  ),

  -- James: reservation confirmed
  (
    'e1000000-0000-0000-0000-000000000009',
    'a1b2c3d4-0001-0001-0001-000000000002',
    'Your reservation for "Chesapeake Blue (The Chesapeake Bay Saga, Book 4)" is confirmed.',
    'RESERVATION', false,
    NOW() - INTERVAL '3 hours'
  ),

  -- James: return confirmation
  (
    'e1000000-0000-0000-0000-000000000010',
    'a1b2c3d4-0001-0001-0001-000000000002',
    'Thank you for returning "Summerland: A Novel" on time. No fines applied.',
    'RETURN', true,
    NOW() - INTERVAL '5 days'
  ),

  -- Lisa: fine payment confirmation
  (
    'e1000000-0000-0000-0000-000000000011',
    'a1b2c3d4-0001-0001-0001-000000000007',
    'Your fine of $4.00 for "Savage Art" has been paid successfully. Your account is in good standing.',
    'FINE', true,
    NOW() - INTERVAL '33 days'
  ),

  -- Lisa: return notification
  (
    'e1000000-0000-0000-0000-000000000012',
    'a1b2c3d4-0001-0001-0001-000000000007',
    'You have returned "Savage Art". A late fine of $4.00 was applied (8 days overdue).',
    'RETURN', true,
    NOW() - INTERVAL '33 days'
  ),

  -- member@library.com: reservation fulfilled
  (
    'e1000000-0000-0000-0000-000000000013',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    'Your reservation for "The big foundations" has been fulfilled. Enjoy your book! Due date: ' || TO_CHAR(NOW() + INTERVAL '11 days', 'Mon DD, YYYY') || '.',
    'RESERVATION', true,
    NOW() - INTERVAL '3 days'
  ),

  -- member@library.com: checkout confirmation
  (
    'e1000000-0000-0000-0000-000000000014',
    '283b8b89-4438-418d-89e7-8df1e73a75b7',
    'You have checked out "The big foundations". Due date: ' || TO_CHAR(NOW() + INTERVAL '11 days', 'Mon DD, YYYY') || '.',
    'CHECKOUT', true,
    NOW() - INTERVAL '3 days'
  ),

  -- admin@library.com: system alert
  (
    'e1000000-0000-0000-0000-000000000015',
    '97365294-e515-41e1-bc32-bed35bd79fc5',
    'System Alert: 2 books are currently overdue. Members affected: Michael Brown, David Garcia.',
    'SYSTEM', false,
    NOW() - INTERVAL '1 day'
  ),

  -- admin@library.com: new member registered
  (
    'e1000000-0000-0000-0000-000000000016',
    '97365294-e515-41e1-bc32-bed35bd79fc5',
    'New member registered: Lisa Johnson (lisa.johnson@gmail.com).',
    'SYSTEM', true,
    NOW() - INTERVAL '150 days'
  ),

  -- robert.kim: checkout confirmation (admin borrowing too)
  (
    'e1000000-0000-0000-0000-000000000017',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'You have returned "Little Wilson and Big God" on time. No fines applied.',
    'RETURN', true,
    NOW() - INTERVAL '18 days'
  );

COMMIT;
