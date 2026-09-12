#!/usr/bin/env python3
"""
Local Memory Database Engine for Multi-Project Context Retention
Stores architectural decisions, tech stack specs, security baselines, and schemas locally.
Features full-text search (FTS5) and automated Markdown dossier export.
"""

import sys
import os
import sqlite3
import json
import argparse
from datetime import datetime, timezone

DEFAULT_DB_PATH = os.environ.get(
    "LOCAL_MEMORY_DB_PATH",
    "/home/revenant/.local_memory/slidebee_memory.db"
)

def get_connection(db_path=DEFAULT_DB_PATH):
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(conn):
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                root_path TEXT,
                description TEXT,
                tech_stack JSON,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS architecture_decisions (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                context TEXT NOT NULL,
                decision TEXT NOT NULL,
                consequences TEXT NOT NULL,
                status TEXT DEFAULT 'accepted' NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS security_baselines (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                vuln_code TEXT NOT NULL,
                title TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL,
                root_cause TEXT NOT NULL,
                remediation TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_entries (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            );
        """)

        # Full-Text Search Table (FTS5)
        conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
                entry_id UNINDEXED,
                project_id,
                category,
                title,
                content,
                tokenize = 'porter unicode61'
            );
        """)

def index_fts(conn, entry_id, project_id, category, title, content):
    conn.execute("DELETE FROM memory_fts WHERE entry_id = ?", (entry_id,))
    conn.execute("""
        INSERT INTO memory_fts(entry_id, project_id, category, title, content)
        VALUES (?, ?, ?, ?, ?)
    """, (entry_id, project_id, category, title, content))

def record_project(conn, project_id, name, root_path, description, tech_stack):
    now = datetime.now(timezone.utc).isoformat()
    stack_json = json.dumps(tech_stack) if isinstance(tech_stack, dict) else str(tech_stack)
    with conn:
        conn.execute("""
            INSERT INTO projects (id, name, root_path, description, tech_stack, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                root_path = excluded.root_path,
                description = excluded.description,
                tech_stack = excluded.tech_stack,
                updated_at = excluded.updated_at;
        """, (project_id, name, root_path, description, stack_json, now, now))
        index_fts(conn, f"proj_{project_id}", project_id, "project", name, f"{description}\n{stack_json}")

def record_decision(conn, dec_id, project_id, title, category, context, decision, consequences, status="accepted"):
    now = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute("""
            INSERT INTO architecture_decisions (id, project_id, title, category, context, decision, consequences, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                category = excluded.category,
                context = excluded.context,
                decision = excluded.decision,
                consequences = excluded.consequences,
                status = excluded.status;
        """, (dec_id, project_id, title, category, context, decision, consequences, status, now))
        index_fts(conn, f"dec_{dec_id}", project_id, category, title, f"{context}\n{decision}\n{consequences}")

def record_security(conn, vuln_id, project_id, vuln_code, title, severity, status, root_cause, remediation):
    now = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute("""
            INSERT INTO security_baselines (id, project_id, vuln_code, title, severity, status, root_cause, remediation, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                vuln_code = excluded.vuln_code,
                title = excluded.title,
                severity = excluded.severity,
                status = excluded.status,
                root_cause = excluded.root_cause,
                remediation = excluded.remediation;
        """, (vuln_id, project_id, vuln_code, title, severity, status, root_cause, remediation, now))
        index_fts(conn, f"sec_{vuln_id}", project_id, "security", f"{vuln_code} {title}", f"{severity} {status}\n{root_cause}\n{remediation}")

def record_knowledge(conn, entry_id, project_id, category, title, content, tags=""):
    now = datetime.now(timezone.utc).isoformat()
    with conn:
        conn.execute("""
            INSERT INTO knowledge_entries (id, project_id, category, title, content, tags, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                category = excluded.category,
                title = excluded.title,
                content = excluded.content,
                tags = excluded.tags;
        """, (entry_id, project_id, category, title, content, tags, now))
        index_fts(conn, f"know_{entry_id}", project_id, category, title, f"{tags}\n{content}")

def search_memory(conn, query, limit=10):
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT entry_id, project_id, category, title, snippet(memory_fts, 4, '[', ']', '...', 16) as snippet
            FROM memory_fts
            WHERE memory_fts MATCH ?
            ORDER BY rank
            LIMIT ?;
        """, (query, limit))
        return [dict(row) for row in cur.fetchall()]
    except sqlite3.OperationalError:
        # Fallback simple query
        safe_query = f"%{query}%"
        cur.execute("""
            SELECT entry_id, project_id, category, title, substr(content, 1, 120) as snippet
            FROM memory_fts
            WHERE title LIKE ? OR content LIKE ?
            LIMIT ?;
        """, (safe_query, safe_query, limit))
        return [dict(row) for row in cur.fetchall()]

def export_markdown_dossier(conn, project_id, output_path):
    cur = conn.cursor()
    cur.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    proj = cur.fetchone()
    if not proj:
        print(f"Project '{project_id}' not found.")
        return

    cur.execute("SELECT * FROM architecture_decisions WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    decisions = cur.fetchall()

    cur.execute("SELECT * FROM security_baselines WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    security = cur.fetchall()

    cur.execute("SELECT * FROM knowledge_entries WHERE project_id = ? ORDER BY created_at ASC", (project_id,))
    knowledge = cur.fetchall()

    lines = []
    lines.append(f"# Project Memory Dossier: {proj['name']}")
    lines.append(f"**Project ID**: `{proj['id']}`  ")
    lines.append(f"**Root Path**: `{proj['root_path']}`  ")
    lines.append(f"**Last Synchronized**: {datetime.now(timezone.utc).isoformat()}  \n")

    lines.append("## Description")
    lines.append(f"{proj['description']}\n")

    lines.append("## Technology Stack")
    try:
        stack = json.loads(proj["tech_stack"])
        lines.append("| Component | Technology | Detail |")
        lines.append("| :--- | :--- | :--- |")
        for k, v in stack.items():
            if isinstance(v, dict):
                lines.append(f"| {k} | {v.get('tech', '')} | {v.get('notes', '')} |")
            else:
                lines.append(f"| {k} | {v} | - |")
        lines.append("")
    except Exception:
        lines.append(f"```json\n{proj['tech_stack']}\n```\n")

    lines.append("## Architectural Decision Records (ADRs)")
    if decisions:
        lines.append("| ADR Code | Title | Category | Status | Context & Decision |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")
        for d in decisions:
            lines.append(f"| `{d['id']}` | **{d['title']}** | {d['category']} | `{d['status']}` | {d['decision']} |")
        lines.append("")
    else:
        lines.append("*No ADRs recorded yet.*\n")

    lines.append("## Security Baseline & Vulnerability Registry")
    if security:
        lines.append("| Vuln Code | Title | Severity | Status | Remediation Summary |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")
        for s in security:
            lines.append(f"| `{s['vuln_code']}` | **{s['title']}** | `{s['severity']}` | `{s['status']}` | {s['remediation']} |")
        lines.append("")
    else:
        lines.append("*No security findings recorded.*\n")

    lines.append("## Knowledge Base Entries")
    if knowledge:
        for k in knowledge:
            lines.append(f"### {k['title']} (`{k['category']}`)")
            if k["tags"]:
                lines.append(f"**Tags**: `{k['tags']}`\n")
            lines.append(f"{k['content']}\n")
    else:
        lines.append("*No knowledge entries recorded.*\n")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Exported memory dossier to: {output_path}")

def seed_slidebee_data(conn):
    # 1. Project Info
    record_project(
        conn,
        project_id="slidebee",
        name="SlideBee Presentation Design Studio",
        root_path="/home/revenant/xyz_templates",
        description="High-converting commercial presentation design studio platform with dynamic template store, client credit ledger, and admin management hub.",
        tech_stack={
            "Frontend": {"tech": "React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion", "notes": "Warm Milk Cream #FFF9E8, Honey Gold #FCBF14, Charcoal #111111"},
            "Identity & Auth": {"tech": "Supabase GoTrue (PostgreSQL 15)", "notes": "Bcrypt password hashing, HS256 JWT, Refresh Tokens, cross-tab mutual exclusivity"},
            "Database & APIs": {"tech": "Supabase PostgreSQL 15 + PostgREST", "notes": "RLS policies, SECURITY DEFINER atomic RPCs: fn_grant_starter_credits, fn_redeem_template_credit, fn_fulfill_template_order"},
            "Storage & CDN": {"tech": "Cloudflare R2 (S3-compatible) + Cloudflare CDN", "notes": "Zero-cost billing guardrails, 9.9 GB hard ceiling, 50MB PPTX limit, immutable edge caching"},
            "Edge Compute": {"tech": "Cloudflare Pages Functions", "notes": "Endpoints: /api/r2-storage, /api/send-email"},
            "Email Service": {"tech": "Resend API", "notes": "80 emails/day circuit breaker, verified senders hello@theslidebee.com"},
            "Payments": {"tech": "Razorpay Gateway", "notes": "Multi-currency INR/USD checkout"}
        }
    )

    # 2. Architectural Decisions
    record_decision(
        conn,
        dec_id="ADR-001",
        project_id="slidebee",
        title="Strict Mutual Exclusivity Between Client and Admin Sessions",
        category="auth",
        context="Cross-tab auth state bleed previously caused client accounts to see admin studio headers and admin tabs to be corrupted by client logins.",
        decision="Implemented BroadcastChannel and StorageEvent ping synchronization. Admin login purges client state in other tabs; client login purges admin state.",
        consequences="Eliminates cross-tab session hijacking and role ambiguity across all open browser windows."
    )

    record_decision(
        conn,
        dec_id="ADR-002",
        project_id="slidebee",
        title="Zero-Cost Billing Architecture for Cloudflare R2 and Resend",
        category="infrastructure",
        context="Unchecked uploads and high email volumes could trigger unexpected monthly cloud billing.",
        decision="Enforced 9.90 GB hard ceiling (100MB buffer before Cloudflare 10GB limit), 50MB PPTX caps, 10MB image caps, immutable Cache-Control headers, and 80 emails/day circuit breaker.",
        consequences="Guarantees $0.00 cloud operational cost while supporting thousands of storefront visitors."
    )

    record_decision(
        conn,
        dec_id="ADR-003",
        project_id="slidebee",
        title="Native Supabase GoTrue Authentication with Sanitized Bundles",
        category="security",
        context="Hardcoded admin password SlideBee@Admin2026! and PIN bypass in client bundles enabled master account takeover.",
        decision="Removed all hardcoded credentials from client bundles. Admin and client authentication both flow through GoTrue directly with user-supplied credentials.",
        consequences="Secures administrative access against static analysis of compiled JS bundles."
    )

    record_decision(
        conn,
        dec_id="ADR-004",
        project_id="slidebee",
        title="Decoupled RLS Enforcement for Subscriptions and Storefront Assets",
        category="security",
        context="Subscriptions and assets tables were referenced in frontend components without explicit schemas or RLS policies in the repository SQL.",
        decision="Created explicit schemas with RLS policies ensuring users only view their own subscriptions, while assets are publicly readable and admin-manageable.",
        consequences="Prevents unauthorized data modification and aligns codebase with strict zero-trust database principles."
    )

    # 3. Security Baselines
    security_items = [
        ("TOB-SB-01", "Master Deliverable download_url Exposed in Catalog View", "CRITICAL", "REMEDIATED",
         "v_storefront_catalog included download_url in public view.", "Removed download_url from public view; gated behind fn_redeem_template_credit and fn_fulfill_template_order."),
        ("TOB-SB-02", "R2 Storage Arbitrary Deletion and Length Bypass Footgun", "CRITICAL", "REMEDIATED",
         "isAuthorizedAdmin accepted any bearer token longer than 20 characters.", "Removed length check; enforced strict equality match against configured admin secret."),
        ("TOB-SB-03", "Horizontal Privilege Escalation via profiles RLS", "HIGH", "REMEDIATED",
         "Permissive RLS policies allowed public update of profiles.", "Locked RLS to auth.uid() = id and restricted role modifications to admin only."),
        ("TOB-SB-04", "Global Information Disclosure of Customer Orders", "HIGH", "REMEDIATED",
         "orders table had permissive read policy.", "Locked orders SELECT to matching email in JWT or admin role."),
        ("TOB-SB-05", "Authenticated Client Catalog Defacement", "HIGH", "REMEDIATED",
         "templates table allowed ALL permissions to any authenticated user.", "Restricted write operations on templates strictly to is_admin()."),
        ("TOB-SB-06", "IDOR Credit Theft via Unauthenticated Email in RPC", "MED-HIGH", "REMEDIATED",
         "fn_redeem_template_credit accepted arbitrary p_user_email parameter.", "Added caller verification checking auth.jwt() ->> 'email' against requested email."),
        ("TOB-SB-07", "Open Relay on /api/send-email", "MEDIUM", "REMEDIATED",
         "Missing origin validation and loose authHeader check.", "Added strict token validation, allowed sender whitelist, and 80/day rate cap."),
        ("TOB-SB-08", "Hardcoded Master Admin Credentials in Client Bundles", "CRITICAL", "REMEDIATED",
         "Admin password and bypass PINs hardcoded in useClientLedger.ts and Admin.tsx.", "Sanitized client code; routed all logins through genuine GoTrue authentication."),
        ("TOB-SB-09", "Hardcoded Fallback Secrets in Serverless Functions", "HIGH", "REMEDIATED",
         "Edge functions defaulted to public strings if env vars were omitted.", "Tightened token validation and fail-secure handling.")
    ]

    for item in security_items:
        record_security(
            conn,
            vuln_id=item[0],
            project_id="slidebee",
            vuln_code=item[0],
            title=item[1],
            severity=item[2],
            status=item[3],
            root_cause=item[4],
            remediation=item[5]
        )

    # 4. Knowledge Entries
    record_knowledge(
        conn,
        entry_id="kb_login_backend",
        project_id="slidebee",
        category="auth_pipeline",
        title="SlideBee Backend Login Pipeline Specs",
        content="""Client Login:
1. User enters email/password.
2. GoTrue verifies bcrypt hash in auth.users.
3. Issues JWT (sub=uuid, email, role=authenticated, exp=1h).
4. useClientLedger queries public.profiles for credits_balance and purchased_items.
5. auth_logs records LOGIN event.

Admin Login:
1. User enters admin credentials (admin@theslidebee.com).
2. GoTrue verifies credentials.
3. Sets slidebee_admin_session and broadcasts LOGIN admin event.
4. Client sessions in other tabs are terminated instantly via BroadcastChannel and StorageEvent.
5. PostgREST evaluates RLS with admin JWT.""",
        tags="login, auth, gotrue, jwt, rls, mutual_exclusivity"
    )

    record_knowledge(
        conn,
        entry_id="kb_pre_handoff_checklist",
        project_id="slidebee",
        category="launch_gate",
        title="Pre-Handoff Launch Gate and Secret Rotation Checklist",
        content="""Mandatory Actions Prior to Production Client Handoff:
1. Secret Rotation:
   - Supabase: Rotate service_role key and Management API token (sbp_...) in Supabase dashboard.
   - Razorpay: Rotate API Key Secret in Razorpay dashboard.
   - Resend: Revoke current API key (re_3bL...) and issue dedicated production key.
   - Cloudflare: Rotate API token for R2 bucket access.
2. Repository Hygiene:
   - Verify API_KEYS_AND_ACCESS_TOKENS.md is strictly gitignored or deleted from the final release archive.
   - Verify no secrets or sensitive tokens exist in git history or committed files.
3. Edge Environment Deployment:
   - Set production environment variables in Cloudflare Pages project settings:
     SUPABASE_URL, SUPABASE_ANON_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET,
     CLOUDFLARE_API_TOKEN, RESEND_API_KEY, SLIDEBEE_ADMIN_SECRET, SLIDEBEE_APP_TOKEN.
4. Administrative Account Verification:
   - Hand off admin credentials (admin@theslidebee.com) to client with mandatory password change on first login.
5. Production Verification:
   - Execute full build (npm run build) and smoke test Edge Functions (/api/r2-storage, /api/send-email).""",
        tags="handoff, launch_gate, secrets, rotation, deployment"
    )

    print("Successfully seeded SlideBee project memory into local database.")

def main():
    parser = argparse.ArgumentParser(description="SlideBee Local Memory Database CLI")
    subparsers = parser.add_subparsers(dest="command")

    # init
    subparsers.add_parser("init", help="Initialize local database schema")

    # seed
    subparsers.add_parser("seed", help="Seed SlideBee project memory into local database")

    # search
    search_p = subparsers.add_parser("search", help="Search memory database using full-text search")
    search_p.add_argument("query", help="Search query (e.g. 'auth', 'r2', 'credits')")
    search_p.add_argument("--limit", type=int, default=10, help="Max results")

    # export
    export_p = subparsers.add_parser("export", help="Export project memory as Markdown dossier")
    export_p.add_argument("--project", default="slidebee", help="Project ID")
    export_p.add_argument("--out", default="PROJECT_MEMORY.md", help="Output file path")

    args = parser.parse_args()

    conn = get_connection()
    init_db(conn)

    if args.command == "init":
        print(f"Database initialized at {DEFAULT_DB_PATH}")
    elif args.command == "seed":
        seed_slidebee_data(conn)
    elif args.command == "search":
        results = search_memory(conn, args.query, limit=args.limit)
        if not results:
            print(f"No results found for '{args.query}'.")
        else:
            print(f"Found {len(results)} match(es) for '{args.query}':\n")
            for r in results:
                print(f"[{r['category'].upper()}] {r['title']} (ID: {r['entry_id']})")
                print(f"  Snippet: {r['snippet']}\n")
    elif args.command == "export":
        export_markdown_dossier(conn, args.project, args.out)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
