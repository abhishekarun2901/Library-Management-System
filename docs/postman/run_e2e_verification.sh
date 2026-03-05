#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"
RUN_ID="$(date +%s)"
REPORT_JSON="docs/postman/e2e_test_report.json"
REPORT_TXT="docs/postman/e2e_test_report.txt"

ADMIN_EMAIL="admin_${RUN_ID}@lbms.test"
ADMIN_PASS="Admin@12345"
MEM1_EMAIL="member1_${RUN_ID}@lbms.test"
MEM2_EMAIL="member2_${RUN_ID}@lbms.test"
MEM3_EMAIL="member3_${RUN_ID}@lbms.test"
MEM_PASS="Member@12345"

RESULTS=()
FAILURES=0

BODY=""
CODE=""

record() {
  local name="$1"
  local expected="$2"
  local code="$3"
  local status="$4"
  local detail="$5"
  RESULTS+=("$(jq -nc --arg name "$name" --arg expected "$expected" --arg code "$code" --arg status "$status" --arg detail "$detail" '{name:$name,expected:$expected,code:$code,status:$status,detail:$detail}')")
  if [[ "$status" != "PASS" ]]; then
    FAILURES=$((FAILURES+1))
  fi
}

call_api() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local payload="${4:-}"

  local resp
  if [[ -n "$payload" ]]; then
    if [[ -n "$token" ]]; then
      resp=$(curl -sS -X "$method" "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$payload" -w "\n%{http_code}")
    else
      resp=$(curl -sS -X "$method" "$url" -H "Content-Type: application/json" -d "$payload" -w "\n%{http_code}")
    fi
  else
    if [[ -n "$token" ]]; then
      resp=$(curl -sS -X "$method" "$url" -H "Authorization: Bearer $token" -w "\n%{http_code}")
    else
      resp=$(curl -sS -X "$method" "$url" -w "\n%{http_code}")
    fi
  fi

  CODE="${resp##*$'\n'}"
  BODY="${resp%$'\n'*}"
}

assert_code() {
  local name="$1"
  local expected="$2"
  local detail="$3"
  if [[ "$CODE" == "$expected" ]]; then
    record "$name" "$expected" "$CODE" "PASS" "$detail"
  else
    record "$name" "$expected" "$CODE" "FAIL" "$detail :: body=$(echo "$BODY" | tr -d '\n' | cut -c1-260)"
  fi
}

assert_not_code() {
  local name="$1"
  local not_expected="$2"
  local detail="$3"
  if [[ "$CODE" != "$not_expected" ]]; then
    record "$name" "!= $not_expected" "$CODE" "PASS" "$detail"
  else
    record "$name" "!= $not_expected" "$CODE" "FAIL" "$detail"
  fi
}

extract_field() {
  local jq_expr="$1"
  echo "$BODY" | jq -r "$jq_expr"
}

jq_bool_or_false() {
  local expr="$1"
  echo "$BODY" | jq -r "try ($expr) catch false"
}

wait_for_api() {
  local tries=45
  local i
  local status
  for ((i=1; i<=tries; i++)); do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/v1/books?page=0&size=1" || true)
    if [[ "$status" == "200" ]]; then
      return 0
    fi
    sleep 1
  done
  echo "API did not become ready at $BASE_URL after ${tries}s" >&2
  exit 1
}

wait_for_api

# 0. health
call_api GET "$BASE_URL/v1/books?page=0&size=1" ""
assert_code "Public books endpoint reachable" "200" "Base API availability"

# 1. register users
call_api POST "$BASE_URL/v1/auth/register" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\",\"fullName\":\"LBMS Admin\",\"role\":\"admin\"}"
assert_code "Register admin candidate" "201" "Bootstrap admin candidate"
ADMIN_USER_ID=$(extract_field '.userId')

call_api POST "$BASE_URL/v1/auth/register" "" "{\"email\":\"$MEM1_EMAIL\",\"password\":\"$MEM_PASS\",\"fullName\":\"Member One\",\"role\":\"member\"}"
assert_code "Register member1" "201" "Member account creation"
MEM1_USER_ID=$(extract_field '.userId')

call_api POST "$BASE_URL/v1/auth/register" "" "{\"email\":\"$MEM2_EMAIL\",\"password\":\"$MEM_PASS\",\"fullName\":\"Member Two\",\"role\":\"member\"}"
assert_code "Register member2" "201" "Member account creation"
MEM2_USER_ID=$(extract_field '.userId')

call_api POST "$BASE_URL/v1/auth/register" "" "{\"email\":\"$MEM3_EMAIL\",\"password\":\"$MEM_PASS\",\"fullName\":\"Member Three\",\"role\":\"member\"}"
assert_code "Register member3" "201" "Member account creation"
MEM3_USER_ID=$(extract_field '.userId')

# 2. promote admin in DB
enum_admin=$(docker exec -i library_db psql -U postgres -d library -Atqc "select enumlabel from pg_enum e join pg_type t on t.oid=e.enumtypid where t.typname='user_role' and lower(enumlabel)='admin' limit 1;")
if [[ -z "$enum_admin" ]]; then
  echo "Could not find admin enum in DB" >&2
  exit 1
fi

docker exec -i library_db psql -U postgres -d library -c "update users set role='${enum_admin}'::user_role where email='${ADMIN_EMAIL}';" >/dev/null

# 3. login
call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}"
assert_code "Admin login" "200" "Admin JWT"
ADMIN_TOKEN=$(extract_field '.token')

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM1_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_code "Member1 login" "200" "Member JWT"
MEM1_TOKEN=$(extract_field '.token')

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM2_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_code "Member2 login" "200" "Member JWT"
MEM2_TOKEN=$(extract_field '.token')

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM3_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_code "Member3 login" "200" "Member JWT"
MEM3_TOKEN=$(extract_field '.token')

# 4. user/profile scope
call_api GET "$BASE_URL/v1/users?scope=me" "$MEM1_TOKEN"
assert_code "Member scope=me" "200" "Member profile access"

# 4a. member self-update profile
MEM1_NEW_NAME="Member One Updated"
call_api PATCH "$BASE_URL/v1/users/$MEM1_USER_ID" "$MEM1_TOKEN" "{\"fullName\":\"$MEM1_NEW_NAME\",\"isActive\":false,\"blacklistReason\":\"should be ignored\"}"
assert_code "Member self-update profile" "200" "Member can update own full name"
MEM1_NAME_UPDATED=$(echo "$BODY" | jq -r --arg n "$MEM1_NEW_NAME" 'try (.fullName == $n) catch false')
if [[ "$MEM1_NAME_UPDATED" == "true" ]]; then
  record "Member self-update reflected" "true" "200" "PASS" "Member fullName updated"
else
  record "Member self-update reflected" "true" "200" "FAIL" "Member fullName not updated"
fi
MEM1_FLAGS_PROTECTED=$(echo "$BODY" | jq -r 'try (.isActive == true and ((.blacklistReason // "") | length == 0)) catch false')
if [[ "$MEM1_FLAGS_PROTECTED" == "true" ]]; then
  record "Member cannot change admin-only user flags" "true" "200" "PASS" "isActive/blacklistReason unchanged for member"
else
  record "Member cannot change admin-only user flags" "true" "200" "FAIL" "Admin-only user flags changed by member patch"
fi

call_api GET "$BASE_URL/v1/users" "$ADMIN_TOKEN"
assert_code "Admin get all users" "200" "User management list"

# 5. create book and copies
ISBN="978${RUN_ID}001"
call_api POST "$BASE_URL/v1/books" "$ADMIN_TOKEN" "{\"title\":\"E2E Book $RUN_ID\",\"isbn\":\"$ISBN\",\"description\":\"E2E validation\",\"publishDate\":\"2024-01-01\",\"categories\":[\"Testing\"],\"authorNames\":[\"QA Bot\"],\"publisherName\":\"LBMS Press\",\"numberOfCopies\":2}"
assert_code "Admin create book" "201" "Book catalog create"
BOOK_ID=$(extract_field '.bookId')

call_api GET "$BASE_URL/v1/books?isbn=$ISBN" ""
assert_code "Public ISBN search" "200" "Catalog ISBN search"

call_api GET "$BASE_URL/v1/copies?book_id=$BOOK_ID" "$ADMIN_TOKEN"
assert_code "Get book copies" "200" "Copy management list"
COPY1_ID=$(echo "$BODY" | jq -r '.[0].copyId')
COPY2_ID=$(echo "$BODY" | jq -r '.[1].copyId')

# 6. transactions
call_api POST "$BASE_URL/v1/transactions" "$MEM1_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"copyId\":\"$COPY1_ID\"}"
assert_code "Member cannot issue own copy" "403" "Member issue action is forbidden"

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"copyId\":\"$COPY1_ID\"}"
assert_code "Admin issue copy1 to member1" "201" "Borrowing via admin"
MEM1_TX1=$(extract_field '.transactionId')

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM2_USER_ID\",\"copyId\":\"$COPY2_ID\"}"
assert_code "Admin issue copy2 to member2" "201" "Borrowing via admin"
MEM2_TX1=$(extract_field '.transactionId')

# 7. reservations FIFO
call_api POST "$BASE_URL/v1/reservations" "$MEM3_TOKEN" "{\"userId\":\"$MEM3_USER_ID\",\"bookId\":\"$BOOK_ID\"}"
assert_code "Member3 reserve book" "201" "Reservation create"
RES1_ID=$(extract_field '.reservationId')

call_api POST "$BASE_URL/v1/reservations" "$MEM1_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"bookId\":\"$BOOK_ID\"}"
assert_code "Member1 reserve book" "201" "Reservation queue"
RES2_ID=$(extract_field '.reservationId')

call_api PATCH "$BASE_URL/v1/transactions/$MEM1_TX1" "$MEM1_TOKEN" "{\"status\":\"RETURNED\"}"
assert_code "Member1 return copy1" "200" "Return borrowed book"

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM2_USER_ID\",\"copyId\":\"$COPY1_ID\"}"
assert_not_code "Admin blocked by FIFO for member2" "201" "Queue jumping prevention"
if [[ "$CODE" == "500" ]]; then
  record "FIFO error code quality" "4xx" "$CODE" "FAIL" "Business rule works but wrong status code (500)"
fi

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM3_USER_ID\",\"copyId\":\"$COPY1_ID\"}"
assert_code "Admin issue copy1 to member3 via FIFO" "201" "Oldest reservation served first"
MEM3_TX1=$(extract_field '.transactionId')

# 8. notifications + reservation ready
call_api PATCH "$BASE_URL/v1/transactions/$MEM2_TX1" "$MEM2_TOKEN" "{\"status\":\"RETURNED\"}"
assert_code "Member2 return copy2" "200" "Trigger reservation ready alert"

call_api GET "$BASE_URL/v1/notifications" "$MEM1_TOKEN"
assert_code "Member1 view notifications" "200" "Notification retrieval"
MEM1_NOTIF_ID=$(echo "$BODY" | jq -r '[.[] | select(.type=="RESERVATION_READY")][0].notificationId // empty')
if [[ -n "$MEM1_NOTIF_ID" ]]; then
  record "Reservation ready notification generated" "present" "200" "PASS" "Member1 received RESERVATION_READY"
else
  record "Reservation ready notification generated" "present" "200" "FAIL" "No RESERVATION_READY found"
fi

if [[ -n "$MEM1_NOTIF_ID" ]]; then
  call_api PATCH "$BASE_URL/v1/notifications/$MEM1_NOTIF_ID" "$MEM1_TOKEN"
  assert_code "Member1 mark notification read" "200" "Notification mark-as-read"

  call_api PATCH "$BASE_URL/v1/notifications/$MEM1_NOTIF_ID" "$MEM2_TOKEN"
  assert_not_code "Member2 cannot mark member1 notification" "200" "Notification ownership enforcement"
fi

# 9. member transaction scope
call_api GET "$BASE_URL/v1/transactions" "$MEM1_TOKEN"
assert_code "Member1 transactions endpoint" "200" "Personal transaction history"
ONLY_MEM1=$(echo "$BODY" | jq -r --arg uid "$MEM1_USER_ID" 'try (if type=="array" then all(.[]; .user_id == $uid) else false end) catch false')
if [[ "$ONLY_MEM1" == "true" ]]; then
  record "Member transaction visibility restricted" "true" "200" "PASS" "Member sees only own transactions"
else
  record "Member transaction visibility restricted" "true" "200" "FAIL" "Member can see other users transactions"
fi

call_api GET "$BASE_URL/v1/transactions" "$ADMIN_TOKEN"
assert_code "Admin transactions endpoint" "200" "Admin transaction oversight"

# 10. member1 fulfills own reservation
call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"copyId\":\"$COPY2_ID\"}"
assert_code "Admin issue copy2 to member1 after notification" "201" "Reservation fulfillment"
MEM1_TX2=$(extract_field '.transactionId')
HAS_MEM1_TX2=true
if [[ -z "$MEM1_TX2" || "$MEM1_TX2" == "null" ]]; then
  HAS_MEM1_TX2=false
  record "Capture member1 reservation transaction id" "uuid" "$MEM1_TX2" "FAIL" "Could not capture transactionId for overdue test"
fi

# 11. deletion restrictions while active loan exists (member3 has active tx on copy1)
call_api DELETE "$BASE_URL/v1/copies/$COPY1_ID" "$ADMIN_TOKEN"
assert_not_code "Prevent delete active copy" "204" "Copy delete restriction"
if [[ "$CODE" == "500" ]]; then
  record "Copy delete restriction status code quality" "4xx" "$CODE" "FAIL" "Rule works but wrong error status"
fi

call_api DELETE "$BASE_URL/v1/books/$BOOK_ID" "$ADMIN_TOKEN"
assert_not_code "Prevent delete book with active loan" "204" "Book delete restriction"
if [[ "$CODE" == "500" ]]; then
  record "Book delete restriction status code quality" "4xx" "$CODE" "FAIL" "Rule works but wrong error status"
fi

# 12. overdue fine test (manual due_date backdate)
if [[ "$HAS_MEM1_TX2" == "true" ]]; then
  docker exec -i library_db psql -U postgres -d library -c "update transactions set due_date = now() - interval '3 day' where transaction_id='${MEM1_TX2}'::uuid;" >/dev/null
  call_api PATCH "$BASE_URL/v1/transactions/$MEM1_TX2" "$MEM1_TOKEN" "{\"status\":\"RETURNED\"}"
  assert_code "Return overdue transaction" "200" "Overdue return flow"

  call_api GET "$BASE_URL/v1/users?scope=fines" "$MEM1_TOKEN"
  assert_code "Member1 view own fines" "200" "Fine visibility"
  HAS_OVERDUE_FINE=$(jq_bool_or_false 'if type=="array" then any(.[]; ((.reason // "") | ascii_downcase | test("overdue")) and ((.amount|tonumber) >= 6)) else false end')
  if [[ "$HAS_OVERDUE_FINE" == "true" ]]; then
    record "Overdue fine generation (₹2/day)" "true" "200" "PASS" "Overdue fine found for member1"
  else
    record "Overdue fine generation (₹2/day)" "true" "200" "FAIL" "Expected overdue fine not found"
  fi
else
  record "Overdue fine generation (₹2/day)" "tested" "SKIP" "FAIL" "Skipped because reservation fulfillment transaction was not created"
fi

# 13. lost penalty test
call_api PATCH "$BASE_URL/v1/transactions/$MEM3_TX1" "$MEM3_TOKEN" "{\"status\":\"RETURNED\"}"
assert_code "Member3 return active tx" "200" "Close active transaction"

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM3_USER_ID\",\"copyId\":\"$COPY1_ID\"}"
assert_code "Admin issue copy1 to member3 again" "201" "Prepare lost penalty test"
MEM3_TX2=$(extract_field '.transactionId')

call_api PATCH "$BASE_URL/v1/transactions/$MEM3_TX2" "$MEM3_TOKEN" "{\"status\":\"LOST\"}"
assert_code "Mark transaction LOST" "200" "Lost book flow"

call_api GET "$BASE_URL/v1/users?scope=fines" "$MEM3_TOKEN"
assert_code "Member3 fines after LOST" "200" "Fine visibility"
HAS_LOST_FINE=$(jq_bool_or_false 'if type=="array" then any(.[]; ((.reason // "") | ascii_downcase | test("lost")) and ((.amount|tonumber) == 50)) else false end')
if [[ "$HAS_LOST_FINE" == "true" ]]; then
  record "Lost book penalty generation (₹50)" "true" "200" "PASS" "Lost fine found for member3"
else
  record "Lost book penalty generation (₹50)" "true" "200" "FAIL" "Expected lost penalty not found"
fi

# 14. soft deletes after active loans closed
call_api DELETE "$BASE_URL/v1/copies/$COPY1_ID" "$ADMIN_TOKEN"
assert_code "Soft delete copy (mark LOST)" "204" "Copy soft delete"

call_api DELETE "$BASE_URL/v1/books/$BOOK_ID" "$ADMIN_TOKEN"
assert_code "Soft delete book" "204" "Book soft delete"

# 15. admin scope checks
call_api GET "$BASE_URL/v1/users?scope=history&userId=$MEM1_USER_ID" "$ADMIN_TOKEN"
assert_code "Admin view member1 history" "200" "Admin user history"

call_api GET "$BASE_URL/v1/users?scope=fines&userId=$MEM1_USER_ID" "$ADMIN_TOKEN"
assert_code "Admin view member1 fines" "200" "Admin user fines"

# 16. deactivate + login block
call_api PATCH "$BASE_URL/v1/users/$MEM2_USER_ID" "$ADMIN_TOKEN" "{\"isActive\":false,\"blacklistReason\":\"E2E deactivation\"}"
assert_code "Admin deactivate member2" "200" "Activate/deactivate users"

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM2_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_not_code "Deactivated user login blocked" "200" "Inactive user cannot authenticate"

# 17. reports
call_api GET "$BASE_URL/v1/reports" "$ADMIN_TOKEN"
assert_code "Admin reports endpoint" "200" "Analytics endpoint"
HAS_REPORT_KEYS=$(jq_bool_or_false 'if type=="object" then has("totalInventory") and has("totalFineRevenue") and has("totalOutstandingFines") and has("overdueCount") and has("lostCount") and has("topBorrowedBooks") and has("mostActiveUsers") else false end')
if [[ "$HAS_REPORT_KEYS" == "true" ]]; then
  record "Reports payload shape" "true" "200" "PASS" "All expected analytics keys are present"
else
  record "Reports payload shape" "true" "200" "FAIL" "Missing one or more expected analytics keys"
fi

# 17.1 fine endpoint access control
call_api GET "$BASE_URL/v1/fines" "$ADMIN_TOKEN"
assert_code "Admin view all fines" "200" "Fine management list"

call_api GET "$BASE_URL/v1/fines" "$MEM1_TOKEN"
assert_code "Member cannot view all fines" "403" "Fine list restricted to ADMIN"

# 18. additional coverage: access control, search, copies, reservations, user soft-delete
# 18.1 role-based endpoint protection
SEC_ISBN="978${RUN_ID}902"
call_api POST "$BASE_URL/v1/books" "$MEM1_TOKEN" "{\"title\":\"Forbidden Book $RUN_ID\",\"isbn\":\"$SEC_ISBN\",\"description\":\"Should fail for member\",\"publishDate\":\"2024-01-02\",\"categories\":[\"Security\"],\"authorNames\":[\"Access Check\"],\"publisherName\":\"LBMS Press\",\"numberOfCopies\":1}"
assert_code "Member cannot create book" "403" "Strict ADMIN write protection"

call_api GET "$BASE_URL/v1/reports" "$MEM1_TOKEN"
assert_code "Member cannot access reports" "403" "ADMIN-only analytics endpoint"

call_api GET "$BASE_URL/v1/users" "$MEM1_TOKEN"
assert_code "Member cannot list all users" "403" "ADMIN-only user listing"

# bootstrap an extra clean member for additional scenarios
MEM4_EMAIL="member4_${RUN_ID}@lbms.test"
call_api POST "$BASE_URL/v1/auth/register" "" "{\"email\":\"$MEM4_EMAIL\",\"password\":\"$MEM_PASS\",\"fullName\":\"Member Four\",\"role\":\"member\"}"
assert_code "Register member4" "201" "Additional member for extended tests"
MEM4_USER_ID=$(extract_field '.userId')

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM4_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_code "Member4 login" "200" "Member JWT"
MEM4_TOKEN=$(extract_field '.token')

# 18.2 advanced catalog search + pagination/sorting + copy operations
ADV_ISBN="978${RUN_ID}903"
ADV_AUTHOR="Filter Author ${RUN_ID}"
ADV_CATEGORY="FilterCat${RUN_ID}"
call_api POST "$BASE_URL/v1/books" "$ADMIN_TOKEN" "{\"title\":\"Alpha Filter Book $RUN_ID\",\"isbn\":\"$ADV_ISBN\",\"description\":\"Advanced search seed\",\"publishDate\":\"2024-01-03\",\"categories\":[\"$ADV_CATEGORY\"],\"authorNames\":[\"$ADV_AUTHOR\"],\"publisherName\":\"LBMS Press\",\"numberOfCopies\":1}"
assert_code "Admin create advanced-search seed book" "201" "Catalog testing setup"
ADV_BOOK_ID=$(extract_field '.bookId')

ENC_ADV_AUTHOR="${ADV_AUTHOR// /%20}"
call_api GET "$BASE_URL/v1/books?author=$ENC_ADV_AUTHOR&category=$ADV_CATEGORY&page=0&size=1&sortBy=title" ""
assert_code "Catalog filter by author+category" "200" "Advanced catalog filter"
HAS_FILTER_RESULT=$(jq_bool_or_false 'if (has("content") and ((.content|length) >= 1)) then any(.content[]; .title == "Alpha Filter Book '"$RUN_ID"'") else false end')
if [[ "$HAS_FILTER_RESULT" == "true" ]]; then
  record "Catalog filter result contains seed book" "true" "200" "PASS" "Author/category filter returned expected book"
else
  record "Catalog filter result contains seed book" "true" "200" "FAIL" "Filtered result missing expected book"
fi
HAS_PAGING_SORT=$(jq_bool_or_false 'has("totalElements") and has("size") and (.size == 1)')
if [[ "$HAS_PAGING_SORT" == "true" ]]; then
  record "Catalog pagination+sorting response shape" "true" "200" "PASS" "Pagination metadata present with requested size"
else
  record "Catalog pagination+sorting response shape" "true" "200" "FAIL" "Pagination metadata missing or unexpected"
fi

call_api GET "$BASE_URL/v1/books?author=$ENC_ADV_AUTHOR&categories=$ADV_CATEGORY&page=0&size=1&sortBy=title" ""
assert_code "Catalog filter by author+categories" "200" "Advanced catalog filter (plural categories param)"
HAS_FILTER_RESULT_PLURAL=$(jq_bool_or_false 'if (has("content") and ((.content|length) >= 1)) then any(.content[]; .title == "Alpha Filter Book '"$RUN_ID"'") else false end')
if [[ "$HAS_FILTER_RESULT_PLURAL" == "true" ]]; then
  record "Catalog filter (categories param) contains seed book" "true" "200" "PASS" "Author/categories filter returned expected book"
else
  record "Catalog filter (categories param) contains seed book" "true" "200" "FAIL" "Filtered result missing expected book for categories param"
fi

call_api GET "$BASE_URL/v1/copies?book_id=$ADV_BOOK_ID" "$ADMIN_TOKEN"
assert_code "Get advanced-search book copies" "200" "Copy list for seed book"
ADV_COPY1_ID=$(echo "$BODY" | jq -r '.[0].copyId')

call_api POST "$BASE_URL/v1/copies?book_id=$ADV_BOOK_ID" "$ADMIN_TOKEN" "{\"status\":\"AVAILABLE\"}"
assert_code "Admin create extra physical copy" "201" "Copy creation endpoint"
ADV_COPY2_ID=$(extract_field '.copyId')

call_api PATCH "$BASE_URL/v1/copies/$ADV_COPY2_ID" "$ADMIN_TOKEN" "{\"status\":\"LOST\"}"
assert_code "Admin update copy status" "200" "Copy status update endpoint"

call_api POST "$BASE_URL/v1/transactions" "$MEM4_TOKEN" "{\"userId\":\"$MEM4_USER_ID\",\"copyId\":\"$ADV_COPY1_ID\"}"
assert_code "Member cannot issue seed copy" "403" "Member issue action is forbidden"

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM4_USER_ID\",\"copyId\":\"$ADV_COPY1_ID\"}"
assert_code "Admin issue seed copy to member4" "201" "Transaction creation for active-copy test"
ADV_TX1=$(extract_field '.transactionId')

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"copyId\":\"$ADV_COPY1_ID\"}"
assert_not_code "Enforce one active transaction per copy" "201" "Second concurrent issue should fail"

call_api PATCH "$BASE_URL/v1/transactions/$ADV_TX1" "$MEM4_TOKEN" "{\"status\":\"RETURNED\"}"
assert_code "Return seed copy from member4" "200" "Cleanup for active-copy test"

# 18.3 reservation oversight (view/update/cancel)
RES_ISBN="978${RUN_ID}904"
call_api POST "$BASE_URL/v1/books" "$ADMIN_TOKEN" "{\"title\":\"Reservation Queue Book $RUN_ID\",\"isbn\":\"$RES_ISBN\",\"description\":\"Reservation testing seed\",\"publishDate\":\"2024-01-04\",\"categories\":[\"QueueCat\"],\"authorNames\":[\"Queue Author\"],\"publisherName\":\"LBMS Press\",\"numberOfCopies\":1}"
assert_code "Admin create reservation-seed book" "201" "Reservation testing setup"
RES_BOOK_ID=$(extract_field '.bookId')

call_api GET "$BASE_URL/v1/copies?book_id=$RES_BOOK_ID" "$ADMIN_TOKEN"
assert_code "Get reservation-seed copies" "200" "Copy list for reservation setup"
RES_COPY_ID=$(echo "$BODY" | jq -r '.[0].copyId')

call_api POST "$BASE_URL/v1/transactions" "$ADMIN_TOKEN" "{\"userId\":\"$MEM4_USER_ID\",\"copyId\":\"$RES_COPY_ID\"}"
assert_code "Admin issue reservation-seed copy to member4" "201" "Reserve-only state setup"
MEM4_TX1=$(extract_field '.transactionId')

call_api POST "$BASE_URL/v1/reservations" "$MEM1_TOKEN" "{\"userId\":\"$MEM1_USER_ID\",\"bookId\":\"$RES_BOOK_ID\"}"
assert_code "Member1 reserve reservation-seed book" "201" "Reservation queue entry #1"
RES_ADMIN_UPDATE_ID=$(extract_field '.reservationId')

call_api POST "$BASE_URL/v1/reservations" "$MEM3_TOKEN" "{\"userId\":\"$MEM3_USER_ID\",\"bookId\":\"$RES_BOOK_ID\"}"
assert_code "Member3 reserve reservation-seed book" "201" "Reservation queue entry #2"
RES_MEMBER_CANCEL_ID=$(extract_field '.reservationId')

call_api GET "$BASE_URL/v1/reservations" "$ADMIN_TOKEN"
assert_code "Admin view reservations" "200" "Reservation oversight listing"

call_api PATCH "$BASE_URL/v1/reservations/$RES_ADMIN_UPDATE_ID?status=cancelled" "$ADMIN_TOKEN"
assert_code "Admin update reservation status" "200" "Reservation status management"

call_api DELETE "$BASE_URL/v1/reservations/$RES_MEMBER_CANCEL_ID" "$MEM3_TOKEN"
assert_code "Member cancel own reservation" "200" "Reservation cancellation"

call_api PATCH "$BASE_URL/v1/transactions/$MEM4_TX1" "$MEM4_TOKEN" "{\"status\":\"RETURNED\"}"
assert_code "Member4 return reservation-seed copy" "200" "Cleanup reservation setup"

# 18.4 user update details + soft delete user
call_api PATCH "$BASE_URL/v1/users/$MEM4_USER_ID" "$ADMIN_TOKEN" "{\"fullName\":\"Member Four Updated\",\"blacklistReason\":\"Manual review complete\",\"isActive\":true}"
assert_code "Admin update user details" "200" "Update full name, active flag, blacklist reason"
UPDATED_MEM4_NAME=$(echo "$BODY" | jq -r '.fullName // empty')
UPDATED_MEM4_REASON=$(echo "$BODY" | jq -r '.blacklistReason // empty')
if [[ "$UPDATED_MEM4_NAME" == "Member Four Updated" && "$UPDATED_MEM4_REASON" == "Manual review complete" ]]; then
  record "User update reflected in response" "true" "200" "PASS" "Updated fields returned as expected"
else
  record "User update reflected in response" "true" "200" "FAIL" "Updated user fields missing or incorrect"
fi

call_api DELETE "$BASE_URL/v1/users/$MEM4_USER_ID" "$ADMIN_TOKEN"
assert_code "Admin soft delete user" "204" "User soft deletion"

call_api POST "$BASE_URL/v1/auth/login" "" "{\"email\":\"$MEM4_EMAIL\",\"password\":\"$MEM_PASS\"}"
assert_not_code "Soft-deleted user login blocked" "200" "Deleted/inactive user cannot authenticate"

# write report
{
  echo "LBMS E2E Verification Report"
  echo "Run ID: $RUN_ID"
  echo "Base URL: $BASE_URL"
  echo "Failures: $FAILURES"
  echo
  for line in "${RESULTS[@]}"; do
    echo "$line" | jq -r '"[\(.status)] \(.name) | expected=\(.expected) actual=\(.code) | \(.detail)"'
  done
} > "$REPORT_TXT"

jq -n --arg runId "$RUN_ID" --arg baseUrl "$BASE_URL" --argjson failures "$FAILURES" --arg generatedAt "$(date -Iseconds)" --argjson results "$(printf '%s\n' "${RESULTS[@]}" | jq -s '.')" '{generatedAt:$generatedAt, runId:$runId, baseUrl:$baseUrl, failures:$failures, results:$results}' > "$REPORT_JSON"

echo "Report written to: $REPORT_TXT"
echo "Report written to: $REPORT_JSON"

if [[ "$FAILURES" -gt 0 ]]; then
  exit 2
fi
