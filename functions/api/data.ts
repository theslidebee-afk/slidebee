// Cloudflare Pages Function: /api/data
// Edge Data Query Engine for Cloudflare D1 with automatic JSON serialization and RPC emulation.

interface Env {
  DB?: any;
}

const ALLOWED_TABLES = [
  "templates",
  "v_storefront_catalog",
  "v_free_credit_library",
  "orders",
  "profiles",
  "waitlist",
  "site_config",
  "subscriptions",
  "auth_logs",
  "assets",
  "users",
  "download_logs",
];

const JSON_COLUMNS: Record<string, string[]> = {
  templates: ["formats", "slides", "features"],
  v_storefront_catalog: ["formats", "slides", "features"],
  v_free_credit_library: ["formats", "slides", "features"],
  profiles: ["purchased_items", "usage_history"],
  orders: ["formats"],
  site_config: ["value"],
  auth_logs: ["metadata"],
  assets: ["metadata"],
};

const VALID_TABLE_COLUMNS: Record<string, string[]> = {
  templates: [
    "id", "slug", "code", "title", "category", "price_inr", "price_usd", "original_price_inr",
    "image_url", "thumbnail_url", "slides_count", "rating", "downloads", "formats", "slides",
    "description", "features", "download_url", "file_name", "file_size", "is_credit_eligible",
    "is_featured", "is_published", "created_at", "is_premium"
  ],
  profiles: [
    "id", "email", "full_name", "company", "phone", "role", "credits_total", "credits_used",
    "credits_balance", "purchased_items", "usage_history", "last_sign_in_at", "created_at",
    "updated_at", "tier", "tier_expires_at", "downloads_today", "last_download_date",
    "downloads_this_month", "month_cycle_start", "is_bot_flagged"
  ],
  orders: [
    "id", "created_at", "order_reference", "service_type", "slide_count", "timeline",
    "formats", "style_preference", "drive_url", "project_brief", "full_name", "email",
    "company", "phone", "payment_id", "status", "deliverable_url", "deliverable_name"
  ],
  subscriptions: [
    "id", "created_at", "updated_at", "user_id", "user_email", "plan_name", "amount_usd",
    "amount_inr", "slides_used", "slides_limit", "current_period_end", "status",
    "razorpay_subscription_id"
  ],
  site_config: ["id", "key", "value", "updated_at"],
  waitlist: ["id", "created_at", "email", "source"],
  auth_logs: ["id", "created_at", "user_email", "event", "metadata"],
  assets: ["id", "key", "title", "category", "url", "alt_text", "metadata", "created_at"],
  download_logs: [
    "id", "user_email", "template_id", "template_title", "tier", "is_premium",
    "download_url", "ip_address", "user_agent", "downloaded_at"
  ],
  users: ["id", "email", "password_hash", "salt", "role", "created_at", "updated_at"],
  sessions: ["id", "user_id", "email", "role", "device_info", "ip_address", "created_at", "expires_at"]
};

function sanitizeRow(table: string, row: any): any {
  if (!row || typeof row !== "object") return row;
  const validCols = VALID_TABLE_COLUMNS[table];
  const cleaned: Record<string, any> = {};

  // Normalize known field aliases
  if (table === "templates") {
    if (row.slide_count !== undefined && row.slides_count === undefined) {
      row.slides_count = row.slide_count;
    }
  }

  for (const [key, val] of Object.entries(row)) {
    if (!validCols || validCols.includes(key)) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

const ALLOWED_ORIGINS = [
  "https://theslidebee.com",
  "https://www.theslidebee.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-slidebee-app-token",
    "Vary": "Origin",
  };
}

function parseRow(table: string, row: any) {
  if (!row) return row;
  const cols = JSON_COLUMNS[table] || [];
  const parsed = { ...row };
  for (const col of cols) {
    if (typeof parsed[col] === "string") {
      try {
        parsed[col] = JSON.parse(parsed[col]);
      } catch {}
    }
  }
  return parsed;
}

function stringifyValue(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === "object") return JSON.stringify(val);
  if (typeof val === "boolean") return val ? 1 : 0;
  return val;
}

export async function onRequestOptions(context: { request: Request }) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  try {
    const payload = await request.json().catch(() => ({}));
    const { action = "select", table, select = "*", filters = [], order, limit, offset, values, single, rpcName, rpcParams } = payload;

    // 1. RPC Emulation Action
    if (action === "rpc") {
      if (!env.DB) {
        return new Response(JSON.stringify({ data: null, error: { message: "D1 database binding missing." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (rpcName === "fn_grant_starter_credits") {
        const cleanEmail = String(rpcParams?.p_email || "").trim().toLowerCase();
        let profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
        if (!profile) {
          const profileId = crypto.randomUUID();
          await env.DB.prepare(
            `INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance)
             VALUES (?, ?, ?, ?, 'client', 5, 5)`
          ).bind(profileId, cleanEmail, rpcParams?.p_full_name || cleanEmail.split("@")[0], rpcParams?.p_company || "Client Enterprise").run();
          profile = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(cleanEmail).first();
        }
        return new Response(JSON.stringify({ data: { success: true, credits_balance: profile.credits_balance, credits_total: profile.credits_total }, error: null }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (rpcName === "fn_redeem_template_credit") {
        const userEmail = String(rpcParams?.p_user_email || "").trim().toLowerCase();
        const templateId = String(rpcParams?.p_template_id || "").trim();

        const user = await env.DB.prepare(`SELECT * FROM profiles WHERE email = ?`).bind(userEmail).first();
        if (!user) {
          return new Response(JSON.stringify({ data: { success: false, message: "User account not found." }, error: null }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (user.credits_balance < 5) {
          return new Response(JSON.stringify({ data: { success: false, message: "Insufficient design credits." }, error: null }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const template = await env.DB.prepare(`SELECT * FROM templates WHERE id = ? OR slug = ? OR code = ?`).bind(templateId, templateId, templateId).first();
        if (!template) {
          return new Response(JSON.stringify({ data: { success: false, message: "Template not found." }, error: null }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        let purchasedItems: any[] = [];
        try { purchasedItems = JSON.parse(user.purchased_items || "[]"); } catch {}

        const deliverable = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
        const newItem = {
          id: template.id,
          slug: template.slug,
          code: template.code || "SLD-MASTER",
          title: template.title,
          category: template.category,
          slides_count: template.slides_count || 30,
          formats: ["Master PowerPoint (.pptx)"],
          amount: 0,
          currency: "INR",
          download_url: deliverable,
          is_credit_redemption: true,
          purchased_at: new Date().toISOString(),
        };

        purchasedItems.unshift(newItem);
        const newBalance = Math.max(0, user.credits_balance - 5);
        const newUsed = (user.credits_used || 0) + 5;

        await env.DB.prepare(
          `UPDATE profiles SET credits_balance = ?, credits_used = ?, purchased_items = ?, updated_at = datetime('now') WHERE id = ?`
        ).bind(newBalance, newUsed, JSON.stringify(purchasedItems), user.id).run();

        // Create completed order
        await env.DB.prepare(
          `INSERT INTO orders (id, order_reference, service_type, slide_count, timeline, formats, project_brief, full_name, email, status)
           VALUES (?, ?, ?, ?, 'Instant Credit Dispatch', '["Master PowerPoint (.pptx)"]', 'Redeemed via 5 starter credits.', ?, ?, 'completed')`
        ).bind(crypto.randomUUID(), `CRD-${crypto.randomUUID().substring(0, 8).toUpperCase()}`, `Starter Credit Claim: ${template.title}`, String(template.slides_count || 30), user.full_name || userEmail.split("@")[0], userEmail).run();

        return new Response(JSON.stringify({
          data: {
            success: true,
            message: "Template claimed successfully with your design credits!",
            template_title: template.title,
            download_url: deliverable,
            credits_remaining: newBalance,
          },
          error: null,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!ALLOWED_TABLES.includes(table)) {
      return new Response(JSON.stringify({ data: null, error: { message: `Table "${table}" is not allowed.` } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ data: null, error: { message: "D1 database binding missing." } }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Select Action
    if (action === "select") {
      let sql = `SELECT ${select || "*"} FROM ${table}`;
      const params: any[] = [];
      const whereClauses: string[] = [];

      for (const filter of filters) {
        if (filter.op === "or" && typeof filter.value === "string") {
          const parts = filter.value.split(",");
          const orSubClauses: string[] = [];
          for (const part of parts) {
            const [c, op, ...valParts] = part.split(".");
            const val = valParts.join(".");
            if (c && op === "eq") {
              orSubClauses.push(`${c} = ?`);
              params.push(val);
            }
          }
          if (orSubClauses.length > 0) {
            whereClauses.push(`(${orSubClauses.join(" OR ")})`);
          }
          continue;
        }

        if (!filter.column) continue;
        const col = filter.column;
        if (filter.op === "eq") {
          whereClauses.push(`${col} = ?`);
          params.push(stringifyValue(filter.value));
        } else if (filter.op === "neq") {
          whereClauses.push(`${col} != ?`);
          params.push(stringifyValue(filter.value));
        } else if (filter.op === "like" || filter.op === "ilike") {
          whereClauses.push(`${col} LIKE ?`);
          params.push(String(filter.value).replace(/\*/g, "%"));
        } else if (filter.op === "in" && Array.isArray(filter.value)) {
          if (filter.value.length === 0) {
            whereClauses.push("1 = 0");
          } else {
            const placeholders = filter.value.map(() => "?").join(",");
            whereClauses.push(`${col} IN (${placeholders})`);
            params.push(...filter.value.map(stringifyValue));
          }
        } else if (filter.op === "is") {
          if (filter.value === null) whereClauses.push(`${col} IS NULL`);
          else whereClauses.push(`${col} = ?`);
          if (filter.value !== null) params.push(stringifyValue(filter.value));
        }
      }

      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(" AND ");
      }

      if (order?.column) {
        const direction = order.ascending === false ? "DESC" : "ASC";
        sql += ` ORDER BY ${order.column} ${direction}`;
      }

      if (typeof limit === "number") {
        sql += ` LIMIT ${limit}`;
        if (typeof offset === "number") sql += ` OFFSET ${offset}`;
      }

      const stmt = env.DB.prepare(sql);
      const queryRes = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
      const rawRows = queryRes.results || [];
      const parsedRows = rawRows.map((r: any) => parseRow(table, r));

      const finalData = single ? (parsedRows.length > 0 ? parsedRows[0] : null) : parsedRows;
      return new Response(JSON.stringify({ data: finalData, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Insert Action
    if (action === "insert") {
      const rows = Array.isArray(values) ? values : [values];
      const insertedRows: any[] = [];

      for (const rawRow of rows) {
        const rowId = rawRow.id || crypto.randomUUID();
        const rowWithId = sanitizeRow(table, { ...rawRow, id: rowId });
        const keys = Object.keys(rowWithId);
        const placeholders = keys.map(() => "?").join(", ");
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
        const params = keys.map((k) => stringifyValue(rowWithId[k]));

        await env.DB.prepare(sql).bind(...params).run();
        insertedRows.push(rowWithId);
      }

      const resData = Array.isArray(values) ? insertedRows : insertedRows[0];
      return new Response(JSON.stringify({ data: resData, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Update Action
    if (action === "update") {
      const sanitizedValues = sanitizeRow(table, values || {});
      const keys = Object.keys(sanitizedValues);
      if (keys.length === 0) {
        return new Response(JSON.stringify({ data: null, error: { message: "No valid update values provided." } }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const setClauses = keys.map((k) => `${k} = ?`).join(", ");
      const params = keys.map((k) => stringifyValue(sanitizedValues[k]));
      const whereClauses: string[] = [];

      for (const filter of filters) {
        if (!filter.column) continue;
        if (filter.op === "eq") {
          whereClauses.push(`${filter.column} = ?`);
          params.push(stringifyValue(filter.value));
        }
      }

      let sql = `UPDATE ${table} SET ${setClauses}`;
      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(" AND ");
      }

      await env.DB.prepare(sql).bind(...params).run();
      return new Response(JSON.stringify({ data: sanitizedValues, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Upsert Action
    if (action === "upsert") {
      const rows = Array.isArray(values) ? values : [values];
      const conflictCol = table === "site_config" ? "key" : (table === "profiles" ? "email" : "id");

      for (const rawRow of rows) {
        const rowId = rawRow.id || crypto.randomUUID();
        const rowWithId = sanitizeRow(table, { ...rawRow, id: rowId });
        const keys = Object.keys(rowWithId);
        const placeholders = keys.map(() => "?").join(", ");
        const updateClauses = keys.filter((k) => k !== conflictCol && k !== "id").map((k) => `${k} = excluded.${k}`).join(", ");

        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})
                     ON CONFLICT(${conflictCol}) DO UPDATE SET ${updateClauses}`;
        const params = keys.map((k) => stringifyValue(rowWithId[k]));

        await env.DB.prepare(sql).bind(...params).run();
      }

      return new Response(JSON.stringify({ data: values, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Delete Action
    if (action === "delete") {
      const params: any[] = [];
      const whereClauses: string[] = [];

      for (const filter of filters) {
        if (!filter.column) continue;
        if (filter.op === "eq") {
          whereClauses.push(`${filter.column} = ?`);
          params.push(stringifyValue(filter.value));
        }
      }

      let sql = `DELETE FROM ${table}`;
      if (whereClauses.length > 0) {
        sql += ` WHERE ` + whereClauses.join(" AND ");
      }

      await env.DB.prepare(sql).bind(...params).run();
      return new Response(JSON.stringify({ data: null, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: null, error: { message: `Unsupported action "${action}".` } }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ data: null, error: { message: err?.message || "Internal server error." } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
