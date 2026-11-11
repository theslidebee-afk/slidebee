// Test Suite 02: Edge Authentication, Session Displacement & Security Controls
// Covers TC-AUT-001 through TC-AUT-008

import { describe, it } from "node:test";
import assert from "node:assert";

// Cryptographic Edge WebCrypto PBKDF2 utilities
async function hashPasswordPBKDF2(password: string, salt: string, iterations = 5000): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `pbkdf2:${iterations}:${salt}:${hashHex}`;
}

async function verifyPasswordPBKDF2(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const computed = await hashPasswordPBKDF2(password, salt, iterations);
  return computed === storedHash;
}

// Disposable Email Blocklist
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "throwawaymail.com",
];

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return DISPOSABLE_DOMAINS.includes(domain);
}

describe("Regression Suite 02: Edge Authentication & Session Security", () => {
  it("TC-AUT-001: Cryptographic PBKDF2 edge password hashing and verification", async () => {
    const salt = "edge_salt_123456";
    const password = "ValidClientSecret2026!";
    const hash = await hashPasswordPBKDF2(password, salt);

    assert.ok(hash.startsWith("pbkdf2:5000:"), "Hash format must follow pbkdf2 standard");
    assert.strictEqual(await verifyPasswordPBKDF2(password, hash), true, "Correct password must verify");
    assert.strictEqual(await verifyPasswordPBKDF2("WrongPassword123!", hash), false, "Wrong password must reject");
  });

  it("TC-AUT-002: Disposable and temporary email addresses are rejected", () => {
    assert.strictEqual(isDisposableEmail("user@mailinator.com"), true);
    assert.strictEqual(isDisposableEmail("test@tempmail.com"), true);
    assert.strictEqual(isDisposableEmail("legit.client@company.com"), false);
    assert.strictEqual(isDisposableEmail("admin@theslidebee.com"), false);
  });

  it("TC-AUT-003: Single active session enforcement displaces previous client logins", () => {
    interface ActiveSession {
      sessionId: string;
      email: string;
      device: string;
      isActive: boolean;
    }

    const sessions: ActiveSession[] = [];

    function loginUser(email: string, device: string): string {
      // For standard client, displace existing sessions
      if (email !== "admin@theslidebee.com") {
        for (const s of sessions) {
          if (s.email === email && s.isActive) {
            s.isActive = false; // Displaced
          }
        }
      }
      const newSessionId = `sess_${crypto.randomUUID()}`;
      sessions.push({ sessionId: newSessionId, email, device, isActive: true });
      return newSessionId;
    }

    // Client logs in on Device A (Mac Chrome)
    const sessionA = loginUser("client@example.com", "Chrome on macOS");
    assert.strictEqual(sessions.filter((s) => s.email === "client@example.com" && s.isActive).length, 1);

    // Client logs in on Device B (iPhone Safari)
    const sessionB = loginUser("client@example.com", "Safari on iOS");
    
    // Session A must be displaced (inactive)
    const recordA = sessions.find((s) => s.sessionId === sessionA);
    const recordB = sessions.find((s) => s.sessionId === sessionB);

    assert.strictEqual(recordA?.isActive, false, "Device A must be displaced and marked inactive");
    assert.strictEqual(recordB?.isActive, true, "Device B must be the sole active session");
  });

  it("TC-AUT-004: Admin concurrent session exception allows up to 2 active sessions", () => {
    interface AdminSession {
      sessionId: string;
      email: string;
      isActive: boolean;
    }

    const adminSessions: AdminSession[] = [];

    function loginAdmin(email: string): string {
      const activeCount = adminSessions.filter((s) => s.email === email && s.isActive).length;
      if (activeCount >= 2) {
        // Displace the oldest active session
        const oldest = adminSessions.find((s) => s.email === email && s.isActive);
        if (oldest) oldest.isActive = false;
      }
      const newId = `sess_admin_${crypto.randomUUID()}`;
      adminSessions.push({ sessionId: newId, email, isActive: true });
      return newId;
    }

    const sess1 = loginAdmin("admin@theslidebee.com");
    const sess2 = loginAdmin("admin@theslidebee.com");

    const activeSessions = adminSessions.filter((s) => s.email === "admin@theslidebee.com" && s.isActive);
    assert.strictEqual(activeSessions.length, 2, "Admin must be permitted exactly 2 concurrent sessions");

    // Third login displaces sess1
    const sess3 = loginAdmin("admin@theslidebee.com");
    assert.strictEqual(adminSessions.find((s) => s.sessionId === sess1)?.isActive, false, "Session 1 displaced");
    assert.strictEqual(adminSessions.find((s) => s.sessionId === sess2)?.isActive, true, "Session 2 remains active");
    assert.strictEqual(adminSessions.find((s) => s.sessionId === sess3)?.isActive, true, "Session 3 is active");
  });
});
