import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "9821e608622e999a9c0f06f52a168d97";
const CF_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "slidebee";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.VITE_CLOUDFLARE_API_TOKEN || "";
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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    r2DevPlugin(),
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
