// Master Regression Test Orchestrator for SlideBee
// Runs all regression test suites and outputs a consolidated senior QA report

import { execSync } from "node:child_process";

const REGRESSION_SUITES = [
  "tests/regression/01_storefront_catalog.test.ts",
  "tests/regression/02_auth_session_security.test.ts",
  "tests/regression/03_checkout_promotions.test.ts",
  "tests/regression/04_fulfillment_download.test.ts",
  "tests/regression/05_admin_governance.test.ts",
];

console.log("==================================================================");
console.log("SLIDEBEE MASTER AUTOMATED REGRESSION TEST SUITE");
console.log("Role: Senior Test Automation Engineer");
console.log("Mode: Automated Regression Execution");
console.log("Zero Unicode Emoji Standard: ENFORCED");
console.log("==================================================================\n");

let totalSuites = 0;
let passedSuites = 0;
let failedSuites = 0;

for (const suite of REGRESSION_SUITES) {
  totalSuites++;
  console.log(`[SUITE START] Executing: ${suite}`);
  try {
    const output = execSync(`npx --yes tsx ${suite}`, { encoding: "utf-8", stdio: "pipe" });
    console.log(output);
    console.log(`[SUITE PASS] ${suite}\n`);
    passedSuites++;
  } catch (err: any) {
    console.error(`[SUITE FAIL] ${suite}`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
    console.log("\n");
    failedSuites++;
  }
}

console.log("==================================================================");
console.log("REGRESSION EXECUTION SUMMARY");
console.log(`Total Suites:  ${totalSuites}`);
console.log(`Passed Suites: ${passedSuites}`);
console.log(`Failed Suites: ${failedSuites}`);
console.log("==================================================================");

if (failedSuites > 0) {
  process.exit(1);
} else {
  console.log("ALL REGRESSION TESTS COMPLETED SUCCESSFULLY.");
  process.exit(0);
}
