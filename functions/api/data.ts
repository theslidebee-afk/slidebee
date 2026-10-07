// Cloudflare Pages Function: /api/data
// Hardened Edge Data Query Engine for Cloudflare D1 with strict RBAC, anti-SQLi whitelisting, and RPC emulation.

import {
  Env,
  ALLOWED_TABLES,
  VALID_TABLE_COLUMNS,
  isValidIdentifier,
  getCorsHeaders,
  sanitizeRow,
  parseRow,
  stringifyValue,
} from "./data/schema";
import { handleRpc } from "./data/rpc";

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
    const action = payload.action || "select";
    const table = payload.table;
    const select = payload.select || "*";
    const order = payload.order;
    const limit = payload.limit;
    const offset = payload.offset;
    const values = payload.values !== undefined ? payload.values : payload.record;
    const single = payload.single;
    const rpcName = payload.rpcName;
    const rpcParams = payload.rpcParams;

    let filters: any[] = [];
    if (Array.isArray(payload.filters)) {
      filters = payload.filters;
    } else if (payload.filters && typeof payload.filters === "object") {
      filters = Object.entries(payload.filters).map(([k, v]) => ({
        column: k,
        op: "eq",
        value: v,
      }));
    }

    if (!env.DB) {
      return new Response(
        JSON.stringify({ data: null, error: { message: "D1 database binding missing." } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate caller session from Authorization header or admin key
    let sessionUser: { email: string; role: string } | null = null;
    let isAdmin = false;

    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
    const adminKey = request.headers.get("x-slidebee-admin-key")?.trim();
    const token = (bearerToken || adminKey)?.trim();

    if (
      env.SLIDEBEE_ADMIN_SECRET &&
      (token === env.SLIDEBEE_ADMIN_SECRET || adminKey === env.SLIDEBEE_ADMIN_SECRET)
    ) {
      isAdmin = true;
      sessionUser = { email: "admin@theslidebee.com", role: "super_admin" };
    } else if (token) {
      try {
        const sessionRow: any = await env.DB.prepare(
          `SELECT email, role FROM sessions WHERE id = ? AND expires_at > datetime('now')`
        ).bind(token).first();
        if (sessionRow) {
          sessionUser = {
            email: String(sessionRow.email || "").toLowerCase().trim(),
            role: sessionRow.role || "client",
          };
          if (
            sessionRow.role === "admin" ||
            sessionRow.role === "super_admin" ||
            sessionUser.email === "admin@theslidebee.com"
          ) {
            isAdmin = true;
          }
        }
      } catch (sessErr) {
        console.warn("Session check notice:", sessErr);
      }
    }

    // 2. RPC Emulation Action
    if (action === "rpc") {
      const rpcResult = await handleRpc(env.DB, rpcName, rpcParams, corsHeaders, sessionUser, isAdmin);
      if (rpcResult) return rpcResult;
      return new Response(
        JSON.stringify({ data: null, error: { message: `Unknown RPC function "${rpcName}".` } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate Table Whitelist
    if (!ALLOWED_TABLES.includes(table)) {
      return new Response(
        JSON.stringify({ data: null, error: { message: `Access to table "${table}" is not permitted.` } }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validCols = VALID_TABLE_COLUMNS[table] || [];

    // 4. Validate and Sanitize Columns (Anti-SQLi)
    let safeSelect = "*";
    if (select && select !== "*") {
      const selectList = String(select).split(",").map((s) => s.trim());
      for (const col of selectList) {
        if (!isValidIdentifier(col) || (validCols.length > 0 && !validCols.includes(col))) {
          return new Response(
            JSON.stringify({ data: null, error: { message: `Invalid column specified: "${col}".` } }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      safeSelect = selectList.join(", ");
    }

    if (order?.column) {
      if (!isValidIdentifier(order.column) || (validCols.length > 0 && !validCols.includes(order.column))) {
        return new Response(
          JSON.stringify({ data: null, error: { message: `Invalid order column: "${order.column}".` } }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    for (const filter of filters) {
      if (filter.column) {
        if (!isValidIdentifier(filter.column) || (validCols.length > 0 && !validCols.includes(filter.column))) {
          return new Response(
            JSON.stringify({ data: null, error: { message: `Invalid filter column: "${filter.column}".` } }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // 5. Enforce Access Control Rules per Table
    if (action === "select") {
      if (table === "waitlist" && !isAdmin) {
        return new Response(
          JSON.stringify({ data: null, error: { message: "Unauthorized: Admin access required." } }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Profiles query scoping
      if (table === "profiles" && !isAdmin) {
        if (!sessionUser) {
          return new Response(
            JSON.stringify({ data: null, error: { message: "Unauthorized: Active session required to view profiles." } }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Force scoping to own profile
        filters.length = 0;
        filters.push({ column: "email", op: "eq", value: sessionUser.email });
      }

      // Orders query scoping (if not admin and not public tracking by reference)
      if (table === "orders" && !isAdmin) {
        const hasRefFilter = filters.some((f: any) => f.column === "order_reference");
        if (!hasRefFilter) {
          if (!sessionUser) {
            return new Response(
              JSON.stringify({ data: null, error: { message: "Unauthorized: Active session required to view orders." } }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          filters.length = 0;
          filters.push({ column: "email", op: "eq", value: sessionUser.email });
        }
      }

      // Subscriptions query scoping
      if (table === "subscriptions" && !isAdmin) {
        if (!sessionUser) {
          return new Response(
            JSON.stringify({ data: null, error: { message: "Unauthorized: Active session required to view subscriptions." } }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        filters.length = 0;
        filters.push({ column: "user_email", op: "eq", value: sessionUser.email });
      }

      let sql = `SELECT ${safeSelect} FROM ${table}`;
      const params: any[] = [];
      const whereClauses: string[] = [];

      for (const filter of filters) {
        if (filter.op === "or" && typeof filter.value === "string") {
          const parts = filter.value.split(",");
          const orSubClauses: string[] = [];
          for (const part of parts) {
            const [c, op, ...valParts] = part.split(".");
            const val = valParts.join(".");
            if (c && isValidIdentifier(c) && validCols.includes(c) && op === "eq") {
              orSubClauses.push(`${c} = ?`);
              params.push(val);
            }
          }
          if (orSubClauses.length > 0) whereClauses.push(`(${orSubClauses.join(" OR ")})`);
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
          else {
            whereClauses.push(`${col} = ?`);
            params.push(stringifyValue(filter.value));
          }
        }
      }

      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");
      if (order?.column) {
        const direction = order.ascending === false ? "DESC" : "ASC";
        sql += ` ORDER BY ${order.column} ${direction}`;
      }
      if (typeof limit === "number") {
        sql += ` LIMIT ${Math.min(100, Math.max(1, limit))}`;
        if (typeof offset === "number") sql += ` OFFSET ${Math.max(0, offset)}`;
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

    // 6. Mutation Access Control
    if (["insert", "update", "upsert", "delete"].includes(action)) {
      // Sensitive admin-only tables
      if (["templates", "site_config", "assets", "subscriptions"].includes(table) && !isAdmin) {
        return new Response(
          JSON.stringify({ data: null, error: { message: `Unauthorized: Admin credentials required to modify ${table}.` } }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Orders mutations: unauthenticated users cannot update or delete orders
      if (table === "orders" && action !== "insert" && !isAdmin) {
        return new Response(
          JSON.stringify({ data: null, error: { message: "Unauthorized: Admin credentials required to modify orders." } }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Profiles mutations: non-admin users can only update their own profile and cannot escalate privileges
      if (table === "profiles" && !isAdmin) {
        if (!sessionUser) {
          return new Response(
            JSON.stringify({ data: null, error: { message: "Unauthorized: Active session required to modify profile." } }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Prevent privilege escalation by stripping protected columns
        const protectedCols = ["role", "tier", "tier_expires_at", "credits_balance", "credits_total", "is_bot_flagged"];
        if (values && typeof values === "object") {
          for (const col of protectedCols) {
            delete values[col];
          }
        }

        // Force filter to own session email
        filters.length = 0;
        filters.push({ column: "email", op: "eq", value: sessionUser.email });
      }
    }

    // 7. Insert Action
    if (action === "insert") {
      const rows = Array.isArray(values) ? values : [values];
      const insertedRows: any[] = [];

      for (const rawRow of rows) {
        const rowId = rawRow.id || crypto.randomUUID();
        const rowWithId = sanitizeRow(table, { ...rawRow, id: rowId });
        const keys = Object.keys(rowWithId).filter((k) => isValidIdentifier(k) && validCols.includes(k));
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

    // 8. Update Action
    if (action === "update") {
      const sanitizedValues = sanitizeRow(table, values || {});
      const keys = Object.keys(sanitizedValues).filter((k) => isValidIdentifier(k) && validCols.includes(k));
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
        if (!filter.column || !isValidIdentifier(filter.column) || !validCols.includes(filter.column)) continue;
        if (filter.op === "eq") {
          whereClauses.push(`${filter.column} = ?`);
          params.push(stringifyValue(filter.value));
        }
      }

      let sql = `UPDATE ${table} SET ${setClauses}`;
      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");

      await env.DB.prepare(sql).bind(...params).run();
      return new Response(JSON.stringify({ data: sanitizedValues, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 9. Upsert Action
    if (action === "upsert") {
      const rows = Array.isArray(values) ? values : [values];
      const conflictCol = table === "site_config" ? "key" : table === "profiles" ? "email" : "id";

      for (const rawRow of rows) {
        const rowId = rawRow.id || crypto.randomUUID();
        const rowWithId = sanitizeRow(table, { ...rawRow, id: rowId });
        const keys = Object.keys(rowWithId).filter((k) => isValidIdentifier(k) && validCols.includes(k));
        const placeholders = keys.map(() => "?").join(", ");
        const updateClauses = keys
          .filter((k) => k !== conflictCol && k !== "id")
          .map((k) => `${k} = excluded.${k}`)
          .join(", ");
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

    // 10. Delete Action
    if (action === "delete") {
      const params: any[] = [];
      const whereClauses: string[] = [];

      for (const filter of filters) {
        if (!filter.column || !isValidIdentifier(filter.column) || !validCols.includes(filter.column)) continue;
        if (filter.op === "eq") {
          whereClauses.push(`${filter.column} = ?`);
          params.push(stringifyValue(filter.value));
        }
      }

      let sql = `DELETE FROM ${table}`;
      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");

      await env.DB.prepare(sql).bind(...params).run();
      return new Response(JSON.stringify({ data: null, error: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ data: null, error: { message: `Unsupported action "${action}".` } }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ data: null, error: { message: err?.message || "Internal server error." } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
