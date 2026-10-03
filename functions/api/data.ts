// Cloudflare Pages Function: /api/data
// Edge Data Query Engine for Cloudflare D1 with automatic JSON serialization and RPC emulation.

import { Env, ALLOWED_TABLES, getCorsHeaders, sanitizeRow, parseRow, stringifyValue } from "./data/schema";
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
    const { action = "select", table, select = "*", filters = [], order, limit, offset, values, single, rpcName, rpcParams } = payload;

    // 1. RPC Emulation Action
    if (action === "rpc") {
      if (!env.DB) {
        return new Response(JSON.stringify({ data: null, error: { message: "D1 database binding missing." } }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const rpcResult = await handleRpc(env.DB, rpcName, rpcParams, corsHeaders);
      if (rpcResult) return rpcResult;
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
            if (c && op === "eq") { orSubClauses.push(`${c} = ?`); params.push(val); }
          }
          if (orSubClauses.length > 0) whereClauses.push(`(${orSubClauses.join(" OR ")})`);
          continue;
        }

        if (!filter.column) continue;
        const col = filter.column;
        if (filter.op === "eq") {
          whereClauses.push(`${col} = ?`); params.push(stringifyValue(filter.value));
        } else if (filter.op === "neq") {
          whereClauses.push(`${col} != ?`); params.push(stringifyValue(filter.value));
        } else if (filter.op === "like" || filter.op === "ilike") {
          whereClauses.push(`${col} LIKE ?`); params.push(String(filter.value).replace(/\*/g, "%"));
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
          else { whereClauses.push(`${col} = ?`); params.push(stringifyValue(filter.value)); }
        }
      }

      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");
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
        if (filter.op === "eq") { whereClauses.push(`${filter.column} = ?`); params.push(stringifyValue(filter.value)); }
      }

      let sql = `UPDATE ${table} SET ${setClauses}`;
      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");

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
        if (filter.op === "eq") { whereClauses.push(`${filter.column} = ?`); params.push(stringifyValue(filter.value)); }
      }

      let sql = `DELETE FROM ${table}`;
      if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");

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
