# Rule: Templates and Deliverables Specification

This document governs the standards for all presentation templates, upload mechanisms, and deliverables across SlideBee.

---

## 1. Single Exclusive Format
- All templates in the SlideBee Marketplace are delivered exclusively as **Master PowerPoint Presentation (.pptx)**.
- **Strictly Prohibited**: Software compatibility selectors, dropdowns, or format filters (such as Canva, Google Slides, Keynote). Do not present alternative format badges to users.
- The deliverable link sent upon purchase must resolve directly to a valid `.pptx` file.

---

## 2. Admin Template Upload Workflows
The Admin Studio provides exactly two mechanisms for template ingestion:
1. **Single Local Upload**:
   - The admin selects a `.pptx` file directly from their local computer.
   - The admin selects preview slide images (PNG/JPG) directly from their local computer.
   - External cloud drives, Google Drive links, Dropbox, or manual URL inputs are forbidden.
2. **Bulk Spreadsheet Upload**:
   - The admin uploads a `.csv` or spreadsheet containing metadata (title, category, price, slide count, description).
   - The admin attaches the corresponding `.pptx` presentations and preview assets.
   - The parser ingests templates directly into the database without requiring external links.

---

## 3. Metrics Visibility
- Star ratings and download counts are hidden from the public storefront by default.
- Metrics are tracked quietly in the database.
- An Admin toggle (`show_template_metrics` in `site_config`) controls whether these metrics are exposed publicly.
