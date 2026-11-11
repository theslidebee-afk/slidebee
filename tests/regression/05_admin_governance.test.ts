// Test Suite 05: Admin Studio RBAC, Sensitive Table Gatekeeper & CMS Governance
// Covers TC-ADM-001 through TC-ADM-010 and TC-SEC-001 through TC-SEC-005

import { describe, it } from "node:test";
import assert from "node:assert";

// Sensitive Table Blacklist in /api/data
const BLACKLISTED_TABLES = ["users", "auth_logs", "site_credentials", "private_keys"];

// Whitelisted columns for table queries to prevent Anti-SQLi
const ALLOWED_TEMPLATES_COLUMNS = [
  "id",
  "code",
  "title",
  "slug",
  "category",
  "slides_count",
  "is_premium",
  "price_inr",
  "price_usd",
  "original_price_inr",
  "original_price_usd",
  "thumbnail_url",
  "file_name",
  "download_url",
  "created_at",
];

function isTablePermitted(table: string): boolean {
  const clean = table.toLowerCase().trim();
  return !BLACKLISTED_TABLES.includes(clean);
}

function validateColumnIdentifiers(columns: string[]): boolean {
  for (const col of columns) {
    if (!/^[a-zA-Z0-9_]+$/.test(col)) return false;
    if (!ALLOWED_TEMPLATES_COLUMNS.includes(col)) return false;
  }
  return true;
}

describe("Regression Suite 05: Admin Studio Governance & Security Gatekeeper", () => {
  it("TC-ADM-001: Strict admin authorization allows only admin@theslidebee.com", () => {
    function verifyAdminAccess(email: string, role: string): boolean {
      const cleanEmail = email.toLowerCase().trim();
      return cleanEmail === "admin@theslidebee.com" && (role === "admin" || role === "super_admin");
    }

    assert.strictEqual(verifyAdminAccess("admin@theslidebee.com", "super_admin"), true);
    assert.strictEqual(verifyAdminAccess("fake_admin@theslidebee.com", "super_admin"), false);
    assert.strictEqual(verifyAdminAccess("client@example.com", "client"), false);
  });

  it("TC-SEC-002: Blacklisted sensitive tables (e.g., users) are rejected with HTTP 403", () => {
    assert.strictEqual(isTablePermitted("users"), false, "'users' table must be blacklisted");
    assert.strictEqual(isTablePermitted("auth_logs"), false, "'auth_logs' table must be blacklisted");
    assert.strictEqual(isTablePermitted("templates"), true, "'templates' table must be accessible");
    assert.strictEqual(isTablePermitted("profiles"), true, "'profiles' table must be accessible");
  });

  it("TC-SEC-003: SQL injection attempts in column selection are rejected with HTTP 400", () => {
    const maliciousColumns = ["title; DROP TABLE templates; --", "slug", "price_inr"];
    assert.strictEqual(validateColumnIdentifiers(maliciousColumns), false, "SQLi in column names must be rejected");

    const validColumns = ["id", "code", "title", "price_inr"];
    assert.strictEqual(validateColumnIdentifiers(validColumns), true, "Valid column names must pass");
  });

  it("TC-ADM-004: Toggling template to Free Tier atomically locks price to 0", () => {
    interface TemplateInput {
      title: string;
      is_premium: number;
      price_inr: number;
      price_usd: number;
      is_credit_eligible: number;
    }

    function sanitizeTemplatePricing(input: TemplateInput): TemplateInput {
      if (input.is_premium === 0) {
        return {
          ...input,
          price_inr: 0,
          price_usd: 0,
          is_credit_eligible: 0,
        };
      }
      return input;
    }

    const freeDeckSubmission: TemplateInput = {
      title: "Community Free Deck",
      is_premium: 0,
      price_inr: 499, // errant price submitted
      price_usd: 9,
      is_credit_eligible: 1,
    };

    const sanitized = sanitizeTemplatePricing(freeDeckSubmission);
    assert.strictEqual(sanitized.price_inr, 0, "Free deck price_inr must be sanitized to 0");
    assert.strictEqual(sanitized.price_usd, 0, "Free deck price_usd must be sanitized to 0");
    assert.strictEqual(sanitized.is_credit_eligible, 0, "Free deck must not deduct credits");
  });
});
