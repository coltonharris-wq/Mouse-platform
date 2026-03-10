#!/bin/bash
# Smoke test for critical API routes. Run with: ./scripts/smoke-test.sh [BASE_URL]
# Does NOT require auth - tests that endpoints respond (401/403 expected for protected routes)

set -e
BASE="${1:-http://localhost:3000}"

echo "=== Smoke test: $BASE ==="

# Public endpoints - should return 200 or redirect
echo -n "GET / ... "
curl -s -o /dev/null -w "%{http_code}" "$BASE/" | grep -qE "200|307|308" && echo "OK" || echo "FAIL"

echo -n "GET /api/reseller/stats ... "
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/reseller/stats")
[ "$code" = "200" ] && echo "OK ($code)" || echo "FAIL ($code)"

# Protected endpoints - should return 401 without token
echo -n "GET /api/reseller/customers (no auth) ... "
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/reseller/customers")
[ "$code" = "401" ] && echo "OK (401 expected)" || echo "FAIL ($code)"

echo -n "GET /api/reseller/revenue (no auth) ... "
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/reseller/revenue")
[ "$code" = "401" ] && echo "OK (401 expected)" || echo "FAIL ($code)"

echo -n "GET /api/admin/overview (no auth) ... "
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" "$BASE/api/admin/overview")
[ "$code" = "401" ] && echo "OK (401 expected)" || echo "FAIL ($code)"

# Login with bad creds - should return 401
echo -n "POST /api/auth/login (invalid) ... "
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"email":"bad@x.com","password":"wrong"}' "$BASE/api/auth/login")
[ "$code" = "401" ] && echo "OK (401 expected)" || echo "FAIL ($code)"

# Login with empty body - should return 400
echo -n "POST /api/auth/login (empty body) ... "
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$BASE/api/auth/login")
[ "$code" = "400" ] && echo "OK (400 expected)" || echo "FAIL ($code)"

echo "=== Smoke test complete ==="
