# Database Modification Skill

This skill outlines the mandatory procedure for interacting with or extending SlideBee database entities on Cloudflare D1.

---

## Procedure

1. **Inspect Existing Database Reference**:
   - Consult `docs/DATABASE.md` and `migrations/*.sql`.
   - Never assume column names or types. Inspect `VALID_TABLE_COLUMNS` in `functions/api/data.ts`.
   - Do NOT run destructive migrations (`DROP TABLE`, `DROP COLUMN`) without explicit user sign-off.

2. **Schema & Migration Planning**:
   - Write SQLite migrations in `migrations/` following sequential naming (`0004_<feature>.sql`).
   - Include rollback safety and default values for backward compatibility with existing records.

3. **Data Engine Synchronization**:
   - When adding tables or columns, update `ALLOWED_TABLES`, `VALID_TABLE_COLUMNS`, and `JSON_COLUMNS` in `functions/api/data.ts`.
   - Ensure sanitized queries in `src/lib/d1.ts` map to the new schema.

4. **Client & Documentation Synchronization**:
   - Update TypeScript interfaces in `src/lib/d1.ts` or target modules.
   - Update `docs/DATABASE.md` to reflect new tables, fields, and constraints.
