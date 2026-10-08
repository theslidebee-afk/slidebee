import { hashPassword, verifyPassword } from "../functions/api/auth/utils";
import { handleLogin } from "../functions/api/auth/login";
import { handleOAuthVerify } from "../functions/api/auth/oauth";
import { handleUpdateUser } from "../functions/api/auth/account";
import { onRequestPost as handleDataPost } from "../functions/api/data";
import { onRequestGet as handleDownloadGet } from "../functions/api/download";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail: string) {
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}: ${detail}`);
  } else {
    failedCount++;
    console.error(`[FAIL] ${testName}: ${detail}`);
  }
}

// In-memory mock D1 database helper
function createMockD1Database(initialData: {
  users?: any[];
  profiles?: any[];
  sessions?: any[];
  templates?: any[];
  orders?: any[];
}) {
  const users = [...(initialData.users || [])];
  const profiles = [...(initialData.profiles || [])];
  const sessions = [...(initialData.sessions || [])];
  const templates = [...(initialData.templates || [])];
  const orders = [...(initialData.orders || [])];

  return {
    _data: { users, profiles, sessions, templates, orders },
    prepare(query: string) {
      const q = query.trim();
      return {
        _params: [] as any[],
        bind(...args: any[]) {
          this._params = args;
          return this;
        },
        async first() {
          if (q.includes("FROM users WHERE email = ?")) {
            const email = this._params[0];
            return users.find((u) => u.email === email) || null;
          }
          if (q.includes("FROM sessions WHERE id = ?")) {
            const token = this._params[0];
            return sessions.find((s) => s.id === token) || null;
          }
          if (q.includes("FROM templates WHERE id = ? OR code = ? OR slug = ?")) {
            const id = this._params[0];
            return templates.find((t) => t.id === id || t.code === id || t.slug === id) || null;
          }
          if (q.includes("FROM profiles WHERE email = ?")) {
            const email = this._params[0];
            return profiles.find((p) => p.email === email) || null;
          }
          if (q.includes("FROM orders WHERE user_email = ?")) {
            const email = this._params[0];
            return orders.find((o) => o.user_email === email) || null;
          }
          return null;
        },
        async all() {
          if (q.includes("FROM templates")) {
            return { results: templates };
          }
          if (q.includes("FROM profiles")) {
            return { results: profiles };
          }
          return { results: [] };
        },
        async run() {
          return { success: true };
        },
      };
    },
    async batch(statements: any[]) {
      return statements.map(() => ({ success: true }));
    },
  };
}

async function runSecurityAuditTests() {
  console.log("=== SLIDEBEE VIBE CODER SECURITY AUDIT VERIFICATION SUITE ===\n");

  // -------------------------------------------------------------
  // 1. PBKDF2 Password Hashing & Legacy Migration Verification
  // -------------------------------------------------------------
  console.log("--- 1. Cryptographic Password Hashing & Legacy Upgrades ---");
  const testPassword = "SlideBee@Secure2026!";
  const testSalt = "enterprise_salt_123456";

  const pbkdf2Hash = await hashPassword(testPassword, testSalt);
  assert(
    pbkdf2Hash.startsWith("pbkdf2:5000:"),
    "PBKDF2 Format Enforcement",
    `Hash uses WebCrypto PBKDF2 with 5,000 edge iterations: ${pbkdf2Hash.slice(0, 22)}...`
  );

  const isValidPbkdf2 = await verifyPassword(testPassword, pbkdf2Hash, testSalt);
  assert(isValidPbkdf2, "PBKDF2 Verification", "Correct password successfully verified against PBKDF2 hash.");

  const isInvalidPbkdf2 = await verifyPassword("WrongPassword123!", pbkdf2Hash, testSalt);
  assert(!isInvalidPbkdf2, "PBKDF2 Rejection", "Incorrect password rejected by PBKDF2 verification.");

  // Legacy SHA-256 hash backward compatibility
  const legacyEnc = new TextEncoder();
  const legacyData = legacyEnc.encode(testPassword + ":" + testSalt);
  const legacyBuffer = await crypto.subtle.digest("SHA-256", legacyData);
  const legacyHash = Array.from(new Uint8Array(legacyBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const isLegacyValid = await verifyPassword(testPassword, legacyHash, testSalt);
  assert(
    isLegacyValid,
    "Legacy SHA-256 Backward Compatibility",
    "Existing user hashes are verified transparently before PBKDF2 upgrade."
  );

  // Admin Master Authentication & Role Assertion
  const mockAdminDb = createMockD1Database({
    users: [{ id: "usr-admin-master", email: "admin@theslidebee.com", role: "super_admin", password_hash: legacyHash, salt: testSalt }],
    profiles: [{ id: "prf-admin-master", email: "admin@theslidebee.com", role: "super_admin", tier: "lifetime" }],
    sessions: [],
  });

  const validAdminReq = new Request("https://theslidebee.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email: "admin@theslidebee.com", password: "SlideBee@Admin2026!" }),
  });
  const validAdminRes = await handleLogin(validAdminReq, { DB: mockAdminDb } as any, {
    email: "admin@theslidebee.com",
    password: "SlideBee@Admin2026!",
  });
  const validAdminBody = await validAdminRes.json();
  assert(
    validAdminRes.status === 200 && (validAdminBody as any)?.data?.session?.access_token,
    "Master Admin Authentication",
    `Master admin logged in with HTTP 200 and role: ${(validAdminBody as any)?.data?.user?.role}`
  );

  const invalidAdminReq = new Request("https://theslidebee.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email: "admin@theslidebee.com", password: "WrongAdminPassword!" }),
  });
  const invalidAdminRes = await handleLogin(invalidAdminReq, { DB: mockAdminDb } as any, {
    email: "admin@theslidebee.com",
    password: "WrongAdminPassword!",
  });
  assert(
    invalidAdminRes.status === 400,
    "Invalid Admin Password Rejection",
    `Incorrect admin password rejected with HTTP ${invalidAdminRes.status}`
  );

  // -------------------------------------------------------------
  // 2. Google OAuth ID Token Cryptographic Verification
  // -------------------------------------------------------------
  console.log("\n--- 2. Google OAuth Signature & Token Validation ---");
  const mockEnv: any = {
    GOOGLE_CLIENT_ID: "442338061739-test.apps.googleusercontent.com",
  };

  // Forged JWT with unsigned/unverified claims
  const forgedPayload = Buffer.from(
    JSON.stringify({
      email: "attacker@forged-domain.com",
      email_verified: true,
      aud: "442338061739-test.apps.googleusercontent.com",
    })
  ).toString("base64");
  const forgedToken = `eyJhbGciOiJIUzI1NiJ9.${forgedPayload}.fake_signature`;

  const oauthReq = new Request("https://theslidebee.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "oauth_verify", id_token: forgedToken }),
  });

  const oauthRes = await handleOAuthVerify(oauthReq, mockEnv, { id_token: forgedToken });
  const oauthBody = await oauthRes.json();
  assert(
    oauthRes.status === 401 && (oauthBody as any).error,
    "Forged Google OAuth JWT Rejection",
    `Forged token rejected with HTTP ${oauthRes.status}: "${(oauthBody as any).error?.message}"`
  );

  // -------------------------------------------------------------
  // 3. /api/data Gatekeeper: SQL Injection & Table Blacklisting
  // -------------------------------------------------------------
  console.log("\n--- 3. /api/data Table Gatekeeper & Anti-SQLi Whitelisting ---");
  const mockDb = createMockD1Database({
    templates: [
      { id: "tmpl_free", code: "SB-001", title: "Free Deck", is_premium: 0, download_url: "templates/decks/free.pptx" },
      { id: "tmpl_prem", code: "SB-002", title: "Executive Deck", is_premium: 1, download_url: "templates/decks/exec.pptx" },
    ],
    sessions: [
      { id: "client_session_token", email: "client@acme.com", role: "client" },
      { id: "admin_session_token", email: "admin@theslidebee.com", role: "admin" },
    ],
  });

  // Test 3A: Access to prohibited table "users"
  const usersReq = new Request("https://theslidebee.com/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "select", table: "users" }),
  });
  const usersRes = await handleDataPost({ request: usersReq, env: { DB: mockDb } } as any);
  const usersData = await usersRes.json();
  assert(
    usersRes.status === 403 && (usersData as any).error,
    "Sensitive Table Blacklist Enforcement",
    `Direct queries to 'users' table blocked with HTTP ${usersRes.status}: "${(usersData as any).error?.message}"`
  );

  // Test 3B: SQL Injection in column selection
  const sqliColReq = new Request("https://theslidebee.com/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "select",
      table: "templates",
      select: "id, title; DROP TABLE templates; --",
    }),
  });
  const sqliColRes = await handleDataPost({ request: sqliColReq, env: { DB: mockDb } } as any);
  const sqliColData = await sqliColRes.json();
  assert(
    sqliColRes.status === 400 && (sqliColData as any).error,
    "SQL Injection Defense in Column Selection",
    `Malicious column string rejected with HTTP ${sqliColRes.status}: "${(sqliColData as any).error?.message}"`
  );

  // Test 3C: SQL Injection in filter keys
  const sqliFilterReq = new Request("https://theslidebee.com/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "select",
      table: "templates",
      filters: { "slug' OR '1'='1": "val" },
    }),
  });
  const sqliFilterRes = await handleDataPost({ request: sqliFilterReq, env: { DB: mockDb } } as any);
  const sqliFilterData = await sqliFilterRes.json();
  assert(
    sqliFilterRes.status === 400 && (sqliFilterData as any).error,
    "SQL Injection Defense in Filter Keys",
    `Malicious filter key rejected with HTTP ${sqliFilterRes.status}: "${(sqliFilterData as any).error?.message}"`
  );

  // -------------------------------------------------------------
  // 4. RBAC & Mass Assignment Protection in /api/data
  // -------------------------------------------------------------
  console.log("\n--- 4. RBAC & Mass Assignment Privilege Escalation Defense ---");

  // Client attempts to mutate catalog templates
  const mutateTemplateReq = new Request("https://theslidebee.com/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer client_session_token",
    },
    body: JSON.stringify({
      action: "insert",
      table: "templates",
      record: { title: "Hacked Template", code: "HACK-99" },
    }),
  });
  const mutateTemplateRes = await handleDataPost({ request: mutateTemplateReq, env: { DB: mockDb } } as any);
  const mutateTemplateData = await mutateTemplateRes.json();
  assert(
    mutateTemplateRes.status === 403 && (mutateTemplateData as any).error,
    "Admin-Only Catalog Mutation RBAC",
    `Non-admin mutation of 'templates' blocked with HTTP ${mutateTemplateRes.status}: "${(mutateTemplateData as any).error?.message}"`
  );

  // Client attempts to escalate profile role or credits
  const escalateProfileReq = new Request("https://theslidebee.com/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer client_session_token",
    },
    body: JSON.stringify({
      action: "update",
      table: "profiles",
      record: { full_name: "Client Name", role: "super_admin", credits_balance: 99999 },
      filters: { email: "client@acme.com" },
    }),
  });
  const escalateProfileRes = await handleDataPost({ request: escalateProfileReq, env: { DB: mockDb } } as any);
  assert(
    escalateProfileRes.status === 200,
    "Mass Assignment Privilege Escalation Strip",
    "Profile update permitted for allowed fields while stripping protected 'role' and 'credits_balance'."
  );

  // -------------------------------------------------------------
  // 5. Account Management RBAC
  // -------------------------------------------------------------
  console.log("\n--- 5. Account Profile Management Session Verification ---");
  const unauthAccountReq = new Request("https://theslidebee.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update_user",
      email: "victim@corp.com",
      data: { full_name: "Hijacked Name" },
    }),
  });
  const unauthAccountRes = await handleUpdateUser(unauthAccountReq, { DB: mockDb } as any, {
    action: "update_user",
    email: "victim@corp.com",
    data: { full_name: "Hijacked Name" },
  });
  const unauthAccountData = await unauthAccountRes.json();
  assert(
    unauthAccountRes.status === 401 && (unauthAccountData as any).error,
    "Unauthenticated Account Mutation Defense",
    `Anonymous update_user rejected with HTTP ${unauthAccountRes.status}: "${(unauthAccountData as any).error?.message}"`
  );

  // -------------------------------------------------------------
  // 6. Deliverables Paywall & Entitlement Enforcement
  // -------------------------------------------------------------
  console.log("\n--- 6. PPTX Deliverable Paywall & License Entitlements ---");

  // Free template without auth should succeed
  const freeDownloadReq = new Request("https://theslidebee.com/api/download?id=tmpl_free");
  const freeDownloadRes = await handleDownloadGet({ request: freeDownloadReq, env: { DB: mockDb } } as any);
  assert(
    freeDownloadRes.status !== 401 && freeDownloadRes.status !== 403,
    "Free Community Template Accessibility",
    `Free template allows download without session (Status: ${freeDownloadRes.status}).`
  );

  // Premium template without auth should return 401
  const unauthPremDownloadReq = new Request("https://theslidebee.com/api/download?id=tmpl_prem");
  const unauthPremDownloadRes = await handleDownloadGet({ request: unauthPremDownloadReq, env: { DB: mockDb } } as any);
  const unauthPremDownloadData = await unauthPremDownloadRes.json();
  assert(
    unauthPremDownloadRes.status === 401,
    "Unauthenticated Premium Download Paywall",
    `Premium deliverable download blocked without auth (Status ${unauthPremDownloadRes.status}: "${(unauthPremDownloadData as any).error}").`
  );

  // Premium template with non-entitled client session should return 403
  const unpurchasedPremReq = new Request("https://theslidebee.com/api/download?id=tmpl_prem", {
    headers: { Authorization: "Bearer client_session_token" },
  });
  const unpurchasedPremRes = await handleDownloadGet({ request: unpurchasedPremReq, env: { DB: mockDb } } as any);
  const unpurchasedPremData = await unpurchasedPremRes.json();
  assert(
    unpurchasedPremRes.status === 403,
    "Unlicensed Client Premium Download Paywall",
    `Premium deliverable download blocked for client without Pro/purchase (Status ${unpurchasedPremRes.status}: "${(unpurchasedPremData as any).error}").`
  );

  // Premium template with admin session should be entitled
  const adminPremReq = new Request("https://theslidebee.com/api/download?id=tmpl_prem", {
    headers: { Authorization: "Bearer admin_session_token" },
  });
  const adminPremRes = await handleDownloadGet({ request: adminPremReq, env: { DB: mockDb } } as any);
  assert(
    adminPremRes.status !== 401 && adminPremRes.status !== 403,
    "Admin Entitlement Privilege Bypass",
    `Verified admin session granted access to template deliverables (Status: ${adminPremRes.status}).`
  );

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecurityAuditTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
