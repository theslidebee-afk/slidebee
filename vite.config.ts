import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execFileSync } from 'child_process'

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "9821e608622e999a9c0f06f52a168d97";
const CF_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "slidebee";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

const HARD_STORAGE_CAP_BYTES = 9.90 * 1024 * 1024 * 1024; // 9.90 GB
const MAX_PPTX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function fetchAllR2Telemetry() {
  let allObjects: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_BUCKET}/objects`);
    url.searchParams.set('per_page', '100');
    if (cursor) url.searchParams.set('cursor', cursor);

    const cfRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    const cfJson: any = await cfRes.json();
    if (!cfJson.success) break;

    allObjects = allObjects.concat(cfJson.result || []);
    cursor = cfJson.result_info?.cursor;
  } while (cursor && allObjects.length < 5000);

  let totalBytes = 0;
  let pptxBytes = 0;
  let pptxCount = 0;
  let imagesBytes = 0;
  let imagesCount = 0;

  const objects = allObjects.map((obj) => {
    const size = Number(obj.size) || 0;
    totalBytes += size;
    const isPptx = obj.key.endsWith('.pptx') || obj.key.endsWith('.ppt');
    const isImg = obj.key.match(/\.(jpg|jpeg|png|webp|svg)$/i);
    if (isPptx) {
      pptxBytes += size;
      pptxCount++;
    } else if (isImg) {
      imagesBytes += size;
      imagesCount++;
    }
    return {
      key: obj.key,
      size,
      sizeMB: (size / (1024 * 1024)).toFixed(2),
      uploaded: obj.uploaded,
      publicUrl: `${PUBLIC_CDN_BASE}/${obj.key}`,
      isPptx,
      isImage: Boolean(isImg),
    };
  });

  return { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects };
}

function r2DevPlugin(): Plugin {
  return {
    name: 'r2-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/r2-storage', async (req, res) => {
        try {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 204;
            return res.end();
          }

          if (req.method === 'GET') {
            const { totalBytes, pptxBytes, pptxCount, imagesBytes, imagesCount, objects } =
              await fetchAllR2Telemetry();

            const totalUsedMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
            const pptxMB = Number((pptxBytes / (1024 * 1024)).toFixed(2));
            const imagesMB = Number((imagesBytes / (1024 * 1024)).toFixed(2));
            const remainingGB = Number(Math.max(0, 10 - totalUsedMB / 1024).toFixed(2));
            const percentUsed = Number(((totalUsedMB / 10240) * 100).toFixed(2));

            res.setHeader('Content-Type', 'application/json');
            return res.end(
              JSON.stringify({
                success: true,
                provider: 'Cloudflare R2 Object Storage',
                bucket: CF_BUCKET,
                publicCdnBase: PUBLIC_CDN_BASE,
                totalBytes,
                totalUsedMB,
                pptxCount,
                pptxBytes,
                pptxMB,
                imagesCount,
                imagesBytes,
                imagesMB,
                totalFiles: objects.length,
                freeQuotaGB: 10.0,
                remainingGB,
                percentUsed,
                hardCapGB: 10.0,
                safetyBufferGB: 9.9,
                zeroCostPolicy: 'ACTIVE_ENFORCED',
                maxPptxSizeMB: 50,
                maxImageSizeMB: 10,
                objects,
              })
            );
          }

          if (req.method === 'POST') {
            const adminKey = req.headers['x-slidebee-admin-key'];
            const authHeader = req.headers['authorization'];
            if (adminKey !== 'slidebee_master_admin_2026' && !authHeader) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Unauthorized: Admin authorization required for R2 storage mutations.' }));
            }

            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', async () => {
              const buffer = Buffer.concat(chunks);
              const host = req.headers.host || 'localhost:5173';
              const fullUrl = `http://${host}${req.url}`;
              const contentTypeHeader = (req.headers['content-type'] as string) || 'application/octet-stream';

              let fileBuffer: Buffer = buffer;
              let fileKey = '';
              let mimeType = 'application/octet-stream';
              let fileSize = buffer.byteLength;

              if (contentTypeHeader.includes('multipart/form-data')) {
                try {
                  const webReq = new Request(fullUrl, {
                    method: 'POST',
                    headers: { 'content-type': contentTypeHeader },
                    body: buffer,
                    duplex: 'half' as any,
                  });
                  const formData = await webReq.formData();
                  const file = formData.get('file') as any;
                  const folder = (formData.get('folder') as string) || 'templates';
                  const customKey = formData.get('key') as string;

                  if (!file) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify({ success: false, error: 'No file provided in form data' }));
                  }

                  fileBuffer = Buffer.from(await file.arrayBuffer());
                  fileSize = fileBuffer.byteLength;
                  mimeType = file.type || 'application/octet-stream';

                  if (customKey) {
                    fileKey = customKey;
                  } else {
                    const fileName = file.name || 'file.bin';
                    const ext = fileName.split('.').pop() || 'bin';
                    const cleanName = fileName
                      .replace(/\.[^/.]+$/, '')
                      .replace(/[^a-zA-Z0-9_-]/g, '_')
                      .toLowerCase();
                    fileKey = `${folder}/${cleanName}_${Date.now()}.${ext}`;
                  }
                } catch (parseErr: any) {
                  console.warn('FormData parse notice in dev server:', parseErr.message);
                }
              }

              if (!fileKey) {
                const url = new URL(fullUrl);
                fileKey = url.searchParams.get('key') || `uploads/file_${Date.now()}`;
                mimeType = (req.headers['x-mime-type'] as string) || contentTypeHeader;
              }

              const isPptx = fileKey.endsWith('.pptx') || fileKey.endsWith('.ppt');
              const isImg = Boolean(fileKey.match(/\.(jpg|jpeg|png|webp|svg)$/i));
              const sizeLimit = isPptx ? MAX_PPTX_FILE_SIZE : (isImg ? MAX_IMAGE_FILE_SIZE : MAX_IMAGE_FILE_SIZE);
              const limitLabel = isPptx ? '50 MB (PPTX presentation)' : '10 MB (image)';

              // 1. Enforce individual file size cap
              if (fileSize > sizeLimit) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: `Zero-Cost Safety Cap: File size (${(fileSize / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum limit of ${limitLabel}. Upload rejected to prevent storage bloat.`,
                  })
                );
              }

              // 2. Enforce 10.00 GB hard bucket ceiling
              const { totalBytes } = await fetchAllR2Telemetry();
              if (totalBytes + fileSize > HARD_STORAGE_CAP_BYTES) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: `Zero-Cost Safety Cap: R2 storage limit of 10.00 GB reached (current usage: ${(totalBytes / (1024 * 1024 * 1024)).toFixed(3)} GB). Upload blocked to guarantee zero-cost billing.`,
                  })
                );
              }

              // 3. Upload to Cloudflare R2 if token configured, else return public CDN endpoint
              let uploadSuccess = true;
              let uploadErrors: any = undefined;

              if (CF_API_TOKEN) {
                try {
                  const uploadRes = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_BUCKET}/objects/${fileKey}`,
                    {
                      method: 'PUT',
                      headers: {
                        Authorization: `Bearer ${CF_API_TOKEN}`,
                        'Content-Type': mimeType,
                        'Cache-Control': 'public, max-age=31536000, immutable',
                      },
                      body: fileBuffer,
                    }
                  );
                  const uploadJson: any = await uploadRes.json();
                  uploadSuccess = Boolean(uploadJson.success);
                  uploadErrors = uploadJson.errors;
                } catch (cfErr: any) {
                  uploadSuccess = false;
                  uploadErrors = cfErr.message;
                }
              }

              res.setHeader('Content-Type', 'application/json');
              return res.end(
                JSON.stringify({
                  success: uploadSuccess,
                  key: fileKey,
                  publicUrl: `${PUBLIC_CDN_BASE}/${fileKey}`,
                  size: fileSize,
                  errors: uploadErrors,
                })
              );
            });
            return;
          }

          if (req.method === 'DELETE') {
            const adminKey = req.headers['x-slidebee-admin-key'];
            const authHeader = req.headers['authorization'];
            if (adminKey !== 'slidebee_master_admin_2026' && !authHeader) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: false, error: 'Unauthorized: Admin authorization required for R2 storage deletions.' }));
            }

            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const key = url.searchParams.get('key');
            if (!key) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Missing key' }));
            }
            const delRes = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_BUCKET}/objects/${key}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${CF_API_TOKEN}`,
                },
              }
            );
            const delJson: any = await delRes.json();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(delJson));
          }
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message || String(e) }));
        }
      });
    },
  };
}

const SQLITE_DB_PATH = path.resolve(process.cwd(), "scratch/slidebee_local.sqlite");

function formatSql(sql: string, params: any[] = []): string {
  if (!params || params.length === 0) return sql;
  let idx = 0;
  return sql.replace(/\?/g, () => {
    if (idx >= params.length) return "?";
    const val = params[idx++];
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number") return String(val);
    if (typeof val === "boolean") return val ? "1" : "0";
    return "'" + String(val).replace(/'/g, "''") + "'";
  });
}

function runSqliteQuery(sql: string, params: any[] = []): any[] {
  try {
    const formatted = formatSql(sql, params);
    const jsonOutput = execFileSync("sqlite3", ["-json", SQLITE_DB_PATH, formatted], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return jsonOutput.trim() ? JSON.parse(jsonOutput) : [];
  } catch (err: any) {
    console.warn("[Local D1 Fallback Error]:", err.message);
    return [];
  }
}

function runSqliteExec(sql: string, params: any[] = []): void {
  try {
    const formatted = formatSql(sql, params);
    execFileSync("sqlite3", [SQLITE_DB_PATH, formatted], { encoding: "utf8" });
  } catch (err: any) {
    console.warn("[Local D1 Exec Fallback Error]:", err.message);
  }
}

const JSON_COLUMNS: Record<string, string[]> = {
  templates: ["formats", "slides", "features"],
  profiles: ["purchased_items", "usage_history"],
  orders: ["formats"],
  site_config: ["value"],
  auth_logs: ["metadata"],
  assets: ["metadata"],
};

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

function edgeDevPlugin(): Plugin {
  return {
    name: "edge-dev-sqlite-proxy",
    configureServer(server) {
      server.middlewares.use("/api/data", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
          res.statusCode = 204;
          return res.end();
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: "Method not allowed" }));
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString("utf8");
            const body = JSON.parse(rawBody || "{}");
            const { action = "select", table, select = "*", filters = [], order, limit, offset, values, single, rpcName, rpcParams } = body;

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");

            if (action === "rpc") {
              if (rpcName === "fn_grant_starter_credits") {
                const cleanEmail = String(rpcParams?.p_email || "").trim().toLowerCase();
                const existing = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [cleanEmail]);
                if (existing.length === 0) {
                  const id = "prf-" + Math.random().toString(36).substring(2, 9);
                  const name = rpcParams?.p_full_name || cleanEmail.split("@")[0];
                  const company = rpcParams?.p_company || "Client Enterprise";
                  runSqliteExec(
                    "INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance) VALUES (?, ?, ?, ?, 'client', 5, 5)",
                    [id, cleanEmail, name, company]
                  );
                }
                const profile = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [cleanEmail])[0];
                return res.end(JSON.stringify({ data: { success: true, credits_balance: profile?.credits_balance || 5, credits_total: profile?.credits_total || 5 }, error: null }));
              }

              if (rpcName === "fn_redeem_template_credit") {
                const userEmail = String(rpcParams?.p_user_email || "").trim().toLowerCase();
                const templateId = String(rpcParams?.p_template_id || "").trim();

                const users = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [userEmail]);
                if (users.length === 0) {
                  return res.end(JSON.stringify({ data: { success: false, message: "User account not found." }, error: null }));
                }
                const user = users[0];
                if ((user.credits_balance || 0) < 5) {
                  return res.end(JSON.stringify({ data: { success: false, message: "Insufficient design credits." }, error: null }));
                }

                const templates = runSqliteQuery("SELECT * FROM templates WHERE id = ? OR slug = ? OR code = ?", [templateId, templateId, templateId]);
                if (templates.length === 0) {
                  return res.end(JSON.stringify({ data: { success: false, message: "Template not found." }, error: null }));
                }
                const template = templates[0];

                let purchasedItems = [];
                try { purchasedItems = JSON.parse(user.purchased_items || "[]"); } catch {}

                const deliverable = template.download_url || template.image_url || "/portfolio/case_study_a_1.png";
                purchasedItems.unshift({
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
                });

                const newBalance = Math.max(0, (user.credits_balance || 5) - 5);
                const newUsed = (user.credits_used || 0) + 5;

                runSqliteExec(
                  "UPDATE profiles SET credits_balance = ?, credits_used = ?, purchased_items = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                  [newBalance, newUsed, JSON.stringify(purchasedItems), user.id]
                );

                const orderRef = "CRD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
                runSqliteExec(
                  "INSERT INTO orders (id, order_reference, service_type, slide_count, timeline, formats, project_brief, full_name, email, status) VALUES (?, ?, ?, ?, 'Instant Credit Dispatch', '[\"Master PowerPoint (.pptx)\"]', 'Redeemed via 5 starter credits.', ?, ?, 'completed')",
                  ["ord-" + Math.random().toString(36).substring(2, 9), orderRef, "Starter Credit Claim: " + template.title, String(template.slides_count || 30), user.full_name || userEmail.split("@")[0], userEmail]
                );

                return res.end(JSON.stringify({
                  data: {
                    success: true,
                    message: "Template claimed successfully with your design credits!",
                    template_title: template.title,
                    download_url: deliverable,
                    credits_remaining: newBalance,
                  },
                  error: null,
                }));
              }
            }

            if (action === "select") {
              let sql = `SELECT ${select || "*"} FROM ${table}`;
              const params: any[] = [];
              const whereClauses: string[] = [];

              for (const filter of filters) {
                if (!filter.column) continue;
                if (filter.op === "eq") {
                  whereClauses.push(`${filter.column} = ?`);
                  params.push(stringifyValue(filter.value));
                } else if (filter.op === "neq") {
                  whereClauses.push(`${filter.column} != ?`);
                  params.push(stringifyValue(filter.value));
                } else if (filter.op === "like" || filter.op === "ilike") {
                  whereClauses.push(`${filter.column} LIKE ?`);
                  params.push(String(filter.value).replace(/\*/g, "%"));
                } else if (filter.op === "in" && Array.isArray(filter.value)) {
                  if (filter.value.length === 0) {
                    whereClauses.push("1 = 0");
                  } else {
                    const placeholders = filter.value.map(() => "?").join(",");
                    whereClauses.push(`${filter.column} IN (${placeholders})`);
                    params.push(...filter.value.map(stringifyValue));
                  }
                } else if (filter.op === "is") {
                  if (filter.value === null) whereClauses.push(`${filter.column} IS NULL`);
                  else {
                    whereClauses.push(`${filter.column} = ?`);
                    params.push(stringifyValue(filter.value));
                  }
                }
              }

              if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");
              if (order?.column) {
                const dir = order.ascending === false ? "DESC" : "ASC";
                sql += ` ORDER BY ${order.column} ${dir}`;
              }
              if (typeof limit === "number") {
                sql += ` LIMIT ${limit}`;
                if (typeof offset === "number") sql += ` OFFSET ${offset}`;
              }

              const rawRows = runSqliteQuery(sql, params);
              const parsedRows = rawRows.map((r: any) => parseRow(table, r));
              const finalData = single ? (parsedRows[0] || null) : parsedRows;
              return res.end(JSON.stringify({ data: finalData, error: null }));
            }

            if (action === "insert") {
              const rows = Array.isArray(values) ? values : [values];
              const insertedRows: any[] = [];

              for (const r of rows) {
                const id = r.id || "rec-" + Math.random().toString(36).substring(2, 10);
                const rowWithId = { ...r, id };
                const keys = Object.keys(rowWithId);
                const placeholders = keys.map(() => "?").join(", ");
                const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
                const params = keys.map((k) => stringifyValue(rowWithId[k]));
                runSqliteExec(sql, params);
                insertedRows.push(rowWithId);
              }

              const resData = Array.isArray(values) ? insertedRows : insertedRows[0];
              return res.end(JSON.stringify({ data: resData, error: null }));
            }

            if (action === "update") {
              const keys = Object.keys(values || {});
              const setClauses = keys.map((k) => `${k} = ?`).join(", ");
              const params = keys.map((k) => stringifyValue(values[k]));
              const whereClauses: string[] = [];

              for (const filter of filters) {
                if (!filter.column) continue;
                if (filter.op === "eq") {
                  whereClauses.push(`${filter.column} = ?`);
                  params.push(stringifyValue(filter.value));
                }
              }

              let sql = `UPDATE ${table} SET ${setClauses}`;
              if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");
              runSqliteExec(sql, params);
              return res.end(JSON.stringify({ data: values, error: null }));
            }

            if (action === "upsert") {
              const rows = Array.isArray(values) ? values : [values];
              const conflictCol = table === "site_config" ? "key" : (table === "profiles" ? "email" : "id");

              for (const r of rows) {
                const id = r.id || "cfg-" + Math.random().toString(36).substring(2, 9);
                const rowWithId = { ...r, id };
                const keys = Object.keys(rowWithId);
                const placeholders = keys.map(() => "?").join(", ");
                const updateClauses = keys.filter((k) => k !== conflictCol && k !== "id").map((k) => `${k} = excluded.${k}`).join(", ");
                const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders}) ON CONFLICT(${conflictCol}) DO UPDATE SET ${updateClauses}`;
                const params = keys.map((k) => stringifyValue(rowWithId[k]));
                runSqliteExec(sql, params);
              }

              return res.end(JSON.stringify({ data: values, error: null }));
            }

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
              if (whereClauses.length > 0) sql += ` WHERE ` + whereClauses.join(" AND ");
              runSqliteExec(sql, params);
              return res.end(JSON.stringify({ data: null, error: null }));
            }

            return res.end(JSON.stringify({ data: null, error: { message: "Unsupported action." } }));
          } catch (e: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ data: null, error: { message: e.message || String(e) } }));
          }
        });
      });

      server.middlewares.use("/api/auth", async (req, res) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
          res.statusCode = 204;
          return res.end();
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString("utf8");
            const body = JSON.parse(rawBody || "{}");
            const { action = "session", email, full_name, company, sessionId, deviceInfo } = body;
            const cleanEmail = String(email || "").trim().toLowerCase();

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");

            if (action === "session") {
              const token = sessionId || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
              if (!token) {
                return res.end(JSON.stringify({ user: null, session: null }));
              }
              const sessions = runSqliteQuery("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')", [token]);
              if (sessions.length === 0) {
                return res.end(JSON.stringify({ user: null, session: null }));
              }
              const s = sessions[0];
              const profiles = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [s.email]);
              const p = profiles[0] || {};
              const userObj = {
                id: s.user_id,
                email: s.email,
                role: s.role,
                user_metadata: { full_name: p.full_name, company: p.company },
              };
              return res.end(JSON.stringify({ user: userObj, session: { access_token: s.id, user: userObj } }));
            }

            if (action === "login") {
              const isAdmin = ["admin@theslidebee.com", "admin@slidebee.com"].includes(cleanEmail);
              const role = isAdmin ? "admin" : "client";
              const userId = "usr-" + Math.random().toString(36).substring(2, 10);
              const newSessionId = "sess-" + Math.random().toString(36).substring(2, 12);
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

              runSqliteExec("DELETE FROM sessions WHERE email = ?", [cleanEmail]);
              runSqliteExec(
                "INSERT INTO sessions (id, user_id, email, role, device_info, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
                [newSessionId, userId, cleanEmail, role, deviceInfo || "Browser", expiresAt]
              );

              let profiles = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [cleanEmail]);
              if (profiles.length === 0) {
                runSqliteExec(
                  "INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance) VALUES (?, ?, ?, ?, ?, 5, 5)",
                  ["prf-" + Math.random().toString(36).substring(2, 10), cleanEmail, full_name || cleanEmail.split("@")[0], company || "Enterprise", role]
                );
                profiles = runSqliteQuery("SELECT * FROM profiles WHERE email = ?", [cleanEmail]);
              } else {
                runSqliteExec("UPDATE profiles SET last_sign_in_at = CURRENT_TIMESTAMP WHERE email = ?", [cleanEmail]);
              }

              const profile = parseRow("profiles", profiles[0]) || { full_name: cleanEmail.split("@")[0], company: "Enterprise" };
              const userObj = {
                id: userId,
                email: cleanEmail,
                role,
                user_metadata: { full_name: profile.full_name || cleanEmail.split("@")[0], company: profile.company || "Enterprise" },
              };

              return res.end(JSON.stringify({
                data: {
                  user: userObj,
                  session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
                  profile,
                },
                error: null,
              }));
            }

            if (action === "signup") {
              const isAdmin = ["admin@theslidebee.com", "admin@slidebee.com"].includes(cleanEmail);
              const role = isAdmin ? "admin" : "client";
              const userId = "usr-" + Math.random().toString(36).substring(2, 10);
              const newSessionId = "sess-" + Math.random().toString(36).substring(2, 12);
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

              const resolvedName = full_name || cleanEmail.split("@")[0];
              const resolvedCompany = company || "Client Enterprise";

              runSqliteExec(
                "INSERT INTO profiles (id, email, full_name, company, role, credits_total, credits_balance) VALUES (?, ?, ?, ?, ?, 5, 5) ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name",
                ["prf-" + Math.random().toString(36).substring(2, 10), cleanEmail, resolvedName, resolvedCompany, role]
              );

              runSqliteExec(
                "INSERT INTO sessions (id, user_id, email, role, device_info, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
                [newSessionId, userId, cleanEmail, role, deviceInfo || "Browser", expiresAt]
              );

              const userObj = {
                id: userId,
                email: cleanEmail,
                role,
                user_metadata: { full_name: resolvedName, company: resolvedCompany },
              };

              return res.end(JSON.stringify({
                data: {
                  user: userObj,
                  session: { access_token: newSessionId, expires_at: expiresAt, user: userObj },
                },
                error: null,
              }));
            }

            if (action === "logout") {
              const token = sessionId || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
              if (token) runSqliteExec("DELETE FROM sessions WHERE id = ?", [token]);
              return res.end(JSON.stringify({ error: null }));
            }

            return res.end(JSON.stringify({ error: { message: "Invalid action." } }));
          } catch (e: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: { message: e.message || String(e) } }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    r2DevPlugin(),
    edgeDevPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  }
})
