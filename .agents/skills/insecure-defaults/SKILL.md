---
name: insecure-defaults
description: "Audits codebases for fail-open insecure defaults, permissive access controls, fallback secrets, and missing authentication boundaries. Use when assessing authorization logic, API endpoints, S3/R2 storage ACLs, or default security configurations."
allowed-tools: Read Grep Glob
---

# Insecure Defaults Security Audit

Audits codebases for insecure default configuration, fail-open switches, and permissive access controls.

## Focus Categories

1. Permissive Access: Hardcoded public access (ACL='public-read', CORS '*', unauthenticated table access).
2. Fail-Open Switches: Auth checks that default to passing when values are null, undefined, or missing.
3. Insecure Direct Object Reference (IDOR): Exposing direct internal object identifiers without user authorization validation.
4. Fallback Secrets: Hardcoded fallback credentials or secret tokens in development or production.
5. Debug Feature Leakage: Stack traces, administrative panels, or unauthenticated metrics in client responses.
