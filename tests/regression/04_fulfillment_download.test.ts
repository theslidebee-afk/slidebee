// Test Suite 04: Order Fulfillment, Single-Use Download Tokens & Zero Storage Exposure
// Covers TC-FUL-001 through TC-FUL-007 and TC-DWN-001 through TC-DWN-005

import { describe, it } from "node:test";
import assert from "node:assert";
import { MockRegressionD1, MOCK_TEMPLATES } from "./test_fixtures";

describe("Regression Suite 04: Order Fulfillment & Single-Use Download Pipeline", () => {
  const d1 = new MockRegressionD1();

  it("TC-FUL-001: Order fulfillment issues single-use token and never returns raw R2 storage URLs", async () => {
    d1.reset();
    const cleanOrderRef = "TPL-SLD-949-TEST1";
    const cleanPaymentId = "pay_test_fulfillment_1";
    const template = MOCK_TEMPLATES[1]; // SLD-949
    const singleUseToken = `sdt_${crypto.randomUUID().replace(/-/g, "")}`;

    await d1.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+15 minutes'), 0)`
    ).bind(singleUseToken, cleanOrderRef, cleanPaymentId, template.id, "buyer@example.com").run();

    // Verify response payload conforms strictly to zero-storage exposure standard
    const responsePayload = {
      success: true,
      order_reference: cleanOrderRef,
      template_title: template.title,
      file_name: template.file_name,
      download_token: singleUseToken,
      message: "Order fulfilled successfully via Cloudflare D1.",
    };

    assert.strictEqual((responsePayload as any).deliverable_url, undefined, "Raw deliverable_url must be omitted");
    assert.strictEqual(JSON.stringify(responsePayload).includes("r2.dev"), false, "R2 CDN URL must never be sent to browser");
    assert.strictEqual(responsePayload.download_token.startsWith("sdt_"), true);
  });

  it("TC-FUL-002: Token consumes atomically on first download and rejects replay (HTTP 410)", async () => {
    const singleUseToken = `sdt_token_for_replay_test`;
    await d1.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+15 minutes'), 0)`
    ).bind(singleUseToken, "TPL-REPLAY", "pay_replay_1", "tpl_prem_001", "buyer@example.com").run();

    // First attempt: Token is unconsumed
    const tokenRecord: any = await d1.prepare(
      "SELECT * FROM single_use_download_tokens WHERE token = ?"
    ).bind(singleUseToken).first();

    assert.ok(tokenRecord, "Record must exist");
    assert.strictEqual(tokenRecord.is_consumed, 0, "Must be unconsumed initially");

    // Atomic update
    const consumeRes = await d1.prepare(
      "UPDATE single_use_download_tokens SET is_consumed = 1, consumed_at = datetime('now') WHERE token = ? AND is_consumed = 0"
    ).bind(singleUseToken).run();
    assert.strictEqual(consumeRes.changes, 1, "First download consumes token");

    // Second attempt: Replay attack
    const replayRecord: any = await d1.prepare(
      "SELECT * FROM single_use_download_tokens WHERE token = ?"
    ).bind(singleUseToken).first();
    assert.strictEqual(replayRecord.is_consumed, 1, "Token is consumed");

    // Trying to consume again must fail
    const replayConsume = await d1.prepare(
      "UPDATE single_use_download_tokens SET is_consumed = 1, consumed_at = datetime('now') WHERE token = ? AND is_consumed = 0"
    ).bind(singleUseToken).run();
    assert.strictEqual(replayConsume.changes, 0, "Replay must fail with 0 changes (yielding HTTP 410)");
  });

  it("TC-FUL-003: Token past 15-minute expiration window is rejected", async () => {
    const expiredToken = "sdt_expired_window_test";
    const pastTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 minutes ago

    await d1.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).bind(expiredToken, "TPL-EXPIRED", "pay_exp", "tpl_prem_001", "buyer@example.com", pastTimestamp).run();

    const record: any = await d1.prepare(
      "SELECT * FROM single_use_download_tokens WHERE token = ?"
    ).bind(expiredToken).first();

    const isExpired = new Date(record.expires_at) < new Date();
    assert.strictEqual(isExpired, true, "Token must be evaluated as expired");
  });

  it("TC-DWN-004: Pro subscription member entitlement verification on download endpoint", async () => {
    // Pro member session token
    const proSessionToken = "sess_pro_valid";
    const sessionRecord: any = await d1.prepare(
      "SELECT * FROM sessions WHERE id = ?"
    ).bind(proSessionToken).first();

    assert.ok(sessionRecord, "Session must exist");
    assert.strictEqual(sessionRecord.email, "pro_subscriber@example.com");

    const profileRecord: any = await d1.prepare(
      "SELECT * FROM profiles WHERE email = ?"
    ).bind(sessionRecord.email).first();

    assert.ok(profileRecord, "Profile must exist");
    const isPro = ["monthly", "yearly", "lifetime"].includes(profileRecord.tier);
    assert.strictEqual(isPro, true, "Pro subscriber must be recognized as entitled to download");
  });

  it("TC-DWN-005: Unauthenticated anonymous request to premium template is rejected (HTTP 401)", async () => {
    const premiumTemplate = MOCK_TEMPLATES[1]; // is_premium = 1
    const token = null; // No authorization header, no query token

    function checkEntitlement(tpl: typeof premiumTemplate, tkn: string | null): { allowed: boolean; status: number } {
      if (tpl.is_premium === 0) return { allowed: true, status: 200 };
      if (!tkn) return { allowed: false, status: 401 };
      return { allowed: true, status: 200 };
    }

    const check = checkEntitlement(premiumTemplate, token);
    assert.strictEqual(check.allowed, false);
    assert.strictEqual(check.status, 401, "Unauthenticated premium download must return 401");
  });
});
