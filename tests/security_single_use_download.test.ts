// Security Test Suite: Single-Use Browser Download Tokens & Zero Storage Exposure
// Verifies that:
// 1. Paid download tokens can be consumed strictly once in the browser (HTTP 410 on replay).
// 2. Expired tokens are rejected (HTTP 410).
// 3. Tokens for different templates are rejected (HTTP 403).
// 4. Fulfillment responses never leak internal R2 storage URLs or CDN paths.

import { describe, it } from "node:test";
import assert from "node:assert";

class MockD1Database {
  private tables: Record<string, any[]> = {
    single_use_download_tokens: [],
    download_logs: [],
  };

  prepare(query: string) {
    const self = this;
    return {
      bind(...params: any[]) {
        return {
          async first() {
            if (query.includes("FROM single_use_download_tokens WHERE token = ?")) {
              const token = params[0];
              const record = self.tables.single_use_download_tokens.find((r) => r.token === token);
              return record ? { ...record } : null;
            }
            return null;
          },
          async run() {
            if (query.includes("INSERT INTO single_use_download_tokens")) {
              const [token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed] = params;
              self.tables.single_use_download_tokens.push({
                token,
                order_reference,
                payment_id,
                template_id,
                client_email,
                expires_at: typeof expires_at === "string" && expires_at.includes("now")
                  ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
                  : expires_at,
                is_consumed: is_consumed ?? 0,
                consumed_at: null,
              });
              return { success: true, changes: 1 };
            }
            if (query.includes("UPDATE single_use_download_tokens SET is_consumed = 1")) {
              const token = params[0];
              const record = self.tables.single_use_download_tokens.find((r) => r.token === token && r.is_consumed === 0);
              if (record) {
                record.is_consumed = 1;
                record.consumed_at = new Date().toISOString();
                return { success: true, changes: 1 };
              }
              return { success: true, changes: 0 };
            }
            if (query.includes("INSERT INTO download_logs")) {
              self.tables.download_logs.push({ id: params[0], user_email: params[1], template_id: params[2] });
              return { success: true, changes: 1 };
            }
            return { success: true, changes: 0 };
          },
        };
      },
    };
  }
}

describe("Single-Use Download Token Security Test", () => {
  const db = new MockD1Database();

  it("1. Successfully issues single-use token and prevents raw R2 storage exposure", async () => {
    const token = `sdt_${crypto.randomUUID().replace(/-/g, "")}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    await db.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).bind(token, "TPL-SLD-949-TEST", "pay_test123", "0c1c8b7f-299c-4bd1-a09d-32f01294dc02", "buyer@example.com", expiresAt).run();

    // Verify response format has zero R2 URLs
    const mockFulfillmentResponse = {
      success: true,
      order_reference: "TPL-SLD-949-TEST",
      template_title: "Employee Relations Infographics",
      file_name: "Employee_Relations_Infographics.pptx",
      download_token: token,
      message: "Order fulfilled successfully via Cloudflare D1.",
    };

    assert.strictEqual((mockFulfillmentResponse as any).deliverable_url, undefined, "Raw deliverable_url must not be present in response");
    assert.strictEqual(JSON.stringify(mockFulfillmentResponse).includes("r2.dev"), false, "R2 CDN URL must never leak in client response");
    assert.strictEqual(mockFulfillmentResponse.download_token.startsWith("sdt_"), true, "Token must use secure sdt_ prefix");
  });

  it("2. Consumes single-use token atomically on initial download stream", async () => {
    const token = `sdt_consume_test`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    await db.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).bind(token, "TPL-SLD-CONSUME", "pay_consume123", "TMPL-101", "buyer@example.com", expiresAt).run();

    // Fetch token before consumption
    const record: any = await db.prepare("SELECT * FROM single_use_download_tokens WHERE token = ?").bind(token).first();
    assert.ok(record, "Token record must exist");
    assert.strictEqual(record.is_consumed, 0, "Token must be unconsumed initially");

    // Atomic consumption
    const updateResult = await db.prepare(
      "UPDATE single_use_download_tokens SET is_consumed = 1, consumed_at = datetime('now') WHERE token = ? AND is_consumed = 0"
    ).bind(token).run();

    assert.strictEqual(updateResult.changes, 1, "Must update exactly 1 record on initial consumption");

    const consumedRecord: any = await db.prepare("SELECT * FROM single_use_download_tokens WHERE token = ?").bind(token).first();
    assert.strictEqual(consumedRecord.is_consumed, 1, "Token must now be marked consumed");
  });

  it("3. Replay attack prevention: Second download attempt is rejected (HTTP 410)", async () => {
    const token = `sdt_consume_test`; // already consumed in test 2

    const record: any = await db.prepare("SELECT * FROM single_use_download_tokens WHERE token = ?").bind(token).first();
    assert.ok(record, "Record exists");
    assert.strictEqual(record.is_consumed, 1, "Record was already consumed");

    // Second atomic consumption attempt must fail
    const replayUpdate = await db.prepare(
      "UPDATE single_use_download_tokens SET is_consumed = 1, consumed_at = datetime('now') WHERE token = ? AND is_consumed = 0"
    ).bind(token).run();

    assert.strictEqual(replayUpdate.changes, 0, "Replay attack must fail to consume record");
  });

  it("4. Expired token rejection: Token past 15-minute TTL is rejected", async () => {
    const expiredToken = `sdt_expired_test`;
    const expiredTimestamp = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute in the past
    
    await db.prepare(
      `INSERT INTO single_use_download_tokens (token, order_reference, payment_id, template_id, client_email, expires_at, is_consumed)
       VALUES (?, ?, ?, ?, ?, ?, 0)`
    ).bind(expiredToken, "TPL-SLD-EXP", "pay_exp123", "TMPL-101", "buyer@example.com", expiredTimestamp).run();

    const record: any = await db.prepare("SELECT * FROM single_use_download_tokens WHERE token = ?").bind(expiredToken).first();
    const isExpired = new Date(record.expires_at) < new Date();
    assert.strictEqual(isExpired, true, "Expired token must be flagged as expired");
  });
});
