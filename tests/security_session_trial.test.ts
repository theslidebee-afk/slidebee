import { isDisposableEmail, normalizeEmailBase } from "../src/lib/deviceFingerprint";
import { onRequestPost as handleTrialGuard } from "../functions/api/trial-guard";
import { onRequestPost as handleSessionGuard } from "../functions/api/session-guard";

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

async function runSecurityTests() {
  console.log("=== SLIDEBEE SECURITY: SINGLE ACTIVE SESSION & TRIAL ANTI-ABUSE TEST SUITE ===\n");

  // --- TEST 1: Disposable Email Detection ---
  console.log("--- Test Suite 1: Disposable Email Filtering ---");
  const disposableSamples = [
    "spammer@mailinator.com",
    "bot@tempmail.com",
    "test@10minutemail.com",
    "burner@guerrillamail.com",
    "abuse@yopmail.com",
    "sybil@trashmail.com",
    "fake@burnermail.io"
  ];

  let allDisposableBlocked = true;
  for (const email of disposableSamples) {
    if (!isDisposableEmail(email)) {
      allDisposableBlocked = false;
      console.error(`Expected ${email} to be flagged as disposable.`);
    }
  }
  assert(allDisposableBlocked, "Disposable Email Blocklist", `Blocked all ${disposableSamples.length} temporary email domains.`);

  const legitimateSamples = [
    "founder@acmecorp.com",
    "sarah.jenkins@gmail.com",
    "partner@sequoiacap.com",
    "design@theslidebee.com",
    "client@outlook.com"
  ];

  let allLegitimateAllowed = true;
  for (const email of legitimateSamples) {
    if (isDisposableEmail(email)) {
      allLegitimateAllowed = false;
      console.error(`False positive: ${email} was incorrectly flagged as disposable.`);
    }
  }
  assert(allLegitimateAllowed, "Legitimate Email Allowlist", `Allowed all ${legitimateSamples.length} valid business & personal domains.`);

  // --- TEST 2: Email Normalization & Sub-Addressing Stripping ---
  console.log("\n--- Test Suite 2: Email Canonicalization ---");
  assert(
    normalizeEmailBase("user+trial1@gmail.com") === "user@gmail.com",
    "Gmail Plus-Addressing Normalization",
    "user+trial1@gmail.com correctly resolved to user@gmail.com"
  );
  assert(
    normalizeEmailBase("u.s.e.r.test@gmail.com") === "usertest@gmail.com",
    "Gmail Dot Removal Normalization",
    "u.s.e.r.test@gmail.com correctly resolved to usertest@gmail.com"
  );
  assert(
    normalizeEmailBase("  Client+Promo@Domain.com  ") === "client@domain.com",
    "Corporate Email Trimming & Plus Stripping",
    "Client+Promo@Domain.com correctly resolved to client@domain.com"
  );

  // --- TEST 3: Free Trial Anti-Abuse Server Edge Guard ---
  console.log("\n--- Test Suite 3: Free Trial Anti-Abuse Edge Guard ---");
  const testFingerprint = `test_hw_${Date.now()}_abc123`;
  const initialEmail = `trialtest_${Date.now()}@theslidebee.com`;

  // First claim attempt: should succeed and grant 5 credits
  const req1 = new Request("http://localhost/api/trial-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "CHECK_AND_CLAIM",
      email: initialEmail,
      deviceFingerprint: testFingerprint
    })
  });
  const res1 = await handleTrialGuard({ request: req1, env: {} });
  const data1 = await res1.json();

  assert(
    data1.eligible === true && data1.starterCredits === 5,
    "Initial Free Trial Claim",
    `Granted 5 starter credits to device ${testFingerprint}`
  );

  // Second claim attempt with same device fingerprint but DIFFERENT email: should be rejected
  const secondaryEmail = `sybil_account_${Date.now()}@theslidebee.com`;
  const req2 = new Request("http://localhost/api/trial-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "CHECK_AND_CLAIM",
      email: secondaryEmail,
      deviceFingerprint: testFingerprint
    })
  });
  const res2 = await handleTrialGuard({ request: req2, env: {} });
  const data2 = await res2.json();

  assert(
    data2.eligible === false && data2.starterCredits === 0 && data2.trialStatus === "ALREADY_CLAIMED",
    "Device Hardware Sybil Protection",
    `Rejected duplicate starter credits for secondary email from same device fingerprint`
  );

  // Third claim attempt with disposable domain: should return HTTP 400 rejection
  const req3 = new Request("http://localhost/api/trial-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "CHECK_AND_CLAIM",
      email: "abuser@mailinator.com",
      deviceFingerprint: "new_fp_999"
    })
  });
  const res3 = await handleTrialGuard({ request: req3, env: {} });
  const data3 = await res3.json();

  assert(
    res3.status === 400 && data3.success === false,
    "Server-Side Disposable Domain Rejection",
    `HTTP 400 returned: ${data3.error}`
  );

  // --- TEST 4: Strict Single Active Session Displacement ---
  console.log("\n--- Test Suite 4: Strict Single Active Session Enforcement ---");
  const sessionAccount = `session_test_${Date.now()}@theslidebee.com`;
  const sessionIdDeviceA = "uuid-device-a-laptop-macbook";
  const sessionIdDeviceB = "uuid-device-b-mobile-iphone";

  // 1. Device A registers active session
  const regReqA = new Request("http://localhost/api/session-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "REGISTER",
      email: sessionAccount,
      sessionId: sessionIdDeviceA,
      deviceInfo: "Chrome on Mac"
    })
  });
  const regResA = await handleSessionGuard({ request: regReqA, env: {} });
  const regDataA = await regResA.json();
  assert(regDataA.success === true, "Device A Session Registration", "Registered session for Device A (Chrome on Mac)");

  // 2. Device A verifies its session -> should be VALID
  const verReqA1 = new Request("http://localhost/api/session-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "VERIFY",
      email: sessionAccount,
      sessionId: sessionIdDeviceA
    })
  });
  const verResA1 = await handleSessionGuard({ request: verReqA1, env: {} });
  const verDataA1 = await verResA1.json();
  assert(verDataA1.valid === true, "Device A Session Verification (Before Displacement)", "Device A session is active and valid");

  // 3. Device B logs in -> registers its session for the same account
  const regReqB = new Request("http://localhost/api/session-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "REGISTER",
      email: sessionAccount,
      sessionId: sessionIdDeviceB,
      deviceInfo: "Safari on iOS Device"
    })
  });
  const regResB = await handleSessionGuard({ request: regReqB, env: {} });
  const regDataB = await regResB.json();
  assert(regDataB.success === true, "Device B Session Registration", "Device B logged in (Safari on iOS Device)");

  // 4. Device B verifies its session -> should be VALID
  const verReqB = new Request("http://localhost/api/session-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "VERIFY",
      email: sessionAccount,
      sessionId: sessionIdDeviceB
    })
  });
  const verResB = await handleSessionGuard({ request: verReqB, env: {} });
  const verDataB = await verResB.json();
  assert(verDataB.valid === true, "Device B Active Session Verification", "Device B is now the sole active session");

  // 5. Device A verifies its session -> MUST BE INVALID / DISPLACED
  const verReqA2 = new Request("http://localhost/api/session-guard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "VERIFY",
      email: sessionAccount,
      sessionId: sessionIdDeviceA
    })
  });
  const verResA2 = await handleSessionGuard({ request: verReqA2, env: {} });
  const verDataA2 = await verResA2.json();
  assert(
    verDataA2.valid === false && verDataA2.reason === "DISPLACED" && verDataA2.newDevice === "Safari on iOS Device",
    "Device A Displacement Enforcement",
    `Device A was displaced by ${verDataA2.newDevice}. Status: Displaced`
  );

  console.log("\n==================================================");
  console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
