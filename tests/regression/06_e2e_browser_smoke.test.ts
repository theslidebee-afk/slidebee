// Test Suite 06: Puppeteer End-to-End Browser Smoke & DOM Regression Script
// Covers live visual verification, viewport responsiveness & zero emoji rendering

import puppeteer, { Browser, Page } from "puppeteer";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";

// Target base URL (defaults to production or local preview)
const TARGET_URL = process.env.TEST_TARGET_URL || "https://theslidebee.com";

describe("Regression Suite 06: Puppeteer E2E Browser Smoke & DOM Verification", () => {
  let browser: Browser | null = null;
  let page: Page | null = null;

  before(async () => {
    // Puppeteer browser launch configuration (headless mode)
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
      page = await browser.newPage();
    } catch (launchErr) {
      console.warn("Puppeteer browser launch skipped (headless sandbox environment):", launchErr);
    }
  });

  after(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it("TC-E2E-001: Storefront loads cleanly with HTTP 200 and valid meta tags", async (t) => {
    if (!page) {
      t.skip("Puppeteer not running in sandbox environment");
      return;
    }

    const response = await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.ok(response, "Page must respond");
    assert.strictEqual(response.status(), 200, "Storefront must return HTTP 200");

    const title = await page.title();
    assert.ok(title.toLowerCase().includes("slidebee"), "Title must contain SlideBee");
  });

  it("TC-E2E-002: Zero Unicode Emojis on rendered DOM text", async (t) => {
    if (!page) {
      t.skip("Puppeteer not running in sandbox environment");
      return;
    }

    // Evaluate rendered body text
    const bodyText = await page.evaluate(() => document.body.innerText);
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasEmojis = emojiRegex.test(bodyText);

    assert.strictEqual(hasEmojis, false, "Rendered page must have strictly ZERO unicode emojis");
  });

  it("TC-E2E-003: Responsive Viewport Adaptation (Laptop 1440x900 vs Mobile 390x844)", async (t) => {
    if (!page) {
      t.skip("Puppeteer not running in sandbox environment");
      return;
    }

    // 1. Laptop Viewport Check
    await page.setViewport({ width: 1440, height: 900 });
    const isNavVisibleLaptop = await page.evaluate(() => {
      const nav = document.querySelector("nav");
      return nav ? window.getComputedStyle(nav).display !== "none" : false;
    });
    assert.strictEqual(isNavVisibleLaptop, true, "Navigation must be visible on laptop");

    // 2. Mobile Viewport Check
    await page.setViewport({ width: 390, height: 844 });
    const isBodyRenderedMobile = await page.evaluate(() => document.body.clientWidth === 390);
    assert.strictEqual(isBodyRenderedMobile, true, "Body must adapt to 390px mobile viewport");
  });
});
