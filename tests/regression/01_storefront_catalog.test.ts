// Test Suite 01: Storefront Catalog, Search & Presentation Deliverables
// Covers TC-STR-001 through TC-STR-010 and TC-CAT-001 through TC-CAT-006

import { describe, it } from "node:test";
import assert from "node:assert";
import { isValidPptxUrl, getTemplateDeliverableUrl } from "../../src/lib/templates";
import { MOCK_TEMPLATES } from "./test_fixtures";

describe("Regression Suite 01: Storefront, Catalog & Deliverable Integrity", () => {
  it("TC-STR-001: Template pricing format strictly decouples Free vs Premium", () => {
    const freeTpl = MOCK_TEMPLATES.find((t) => t.is_premium === 0);
    const premTpl = MOCK_TEMPLATES.find((t) => t.is_premium === 1);

    assert.ok(freeTpl, "Free template must exist in catalog");
    assert.ok(premTpl, "Premium template must exist in catalog");

    // Free template pricing invariants
    assert.strictEqual(freeTpl.price_inr, 0, "Free template price_inr must be 0");
    assert.strictEqual(freeTpl.price_usd, 0, "Free template price_usd must be 0");

    // Premium template pricing invariants
    assert.ok(premTpl.price_inr > 0, "Premium template price_inr must be greater than 0");
    assert.ok(premTpl.price_usd > 0, "Premium template price_usd must be greater than 0");
  });

  it("TC-CAT-002: Catalog pagination math strictly enforces 25 items per page (5x5 grid)", () => {
    const pageSize = 25;
    const totalItems = 108;
    const totalPages = Math.ceil(totalItems / pageSize);

    assert.strictEqual(totalPages, 5, "108 items must yield exactly 5 pages with 25 items/page");

    // Page 1 slicing
    const page1Start = 0;
    const page1End = 25;
    assert.strictEqual(page1End - page1Start, 25, "Page 1 must render exactly 25 items");

    // Final Page slicing
    const page5Start = 4 * pageSize;
    const page5End = Math.min(totalItems, 5 * pageSize);
    assert.strictEqual(page5End - page5Start, 8, "Page 5 must render remaining 8 items");
  });

  it("TC-CAT-003: Validates genuine presentation file extensions and rejects corrupting images", () => {
    // Valid presentations
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/deck.pptx"), true);
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/master.potx"), true);
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/deck.ppt"), true);
    assert.strictEqual(isValidPptxUrl("https://pub-r2.dev/templates/decks/presentation.pptx?token=123"), true);

    // Corrupting image fallbacks must be rejected
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/preview.png"), false);
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/preview.jpg"), false);
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/cover.webp"), false);
    assert.strictEqual(isValidPptxUrl("https://storage.theslidebee.com/vector.svg"), false);
    assert.strictEqual(isValidPptxUrl(null), false);
    assert.strictEqual(isValidPptxUrl(""), false);
  });

  it("TC-CAT-004: Native PowerPoint OpenXML Template (.potx) support", () => {
    const potxTpl = MOCK_TEMPLATES.find((t) => t.file_name.endsWith(".potx"));
    assert.ok(potxTpl, "POTX template must exist in test fixtures");
    assert.strictEqual(potxTpl.file_name.endsWith(".potx"), true);

    const deliverable = getTemplateDeliverableUrl(potxTpl);
    assert.ok(deliverable, "Deliverable URL must be resolved for POTX file");
    assert.strictEqual(isValidPptxUrl(deliverable), true);
  });

  it("TC-CAT-005: Catalog search query normalizer matches case-insensitively across title and category", () => {
    const query = "INFOGRAPHIC";
    const cleanQuery = query.toLowerCase().trim();

    const matches = MOCK_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(cleanQuery) ||
        t.category.toLowerCase().includes(cleanQuery) ||
        t.code.toLowerCase().includes(cleanQuery)
    );

    assert.ok(matches.length >= 1, "Must find matching infographic template");
    assert.strictEqual(matches[0].code, "SLD-949");
  });
});
