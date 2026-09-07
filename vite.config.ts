import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "9821e608622e999a9c0f06f52a168d97";
const CF_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "slidebee";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.VITE_CLOUDFLARE_API_TOKEN || "";
const PUBLIC_CDN_BASE = "https://pub-7b09eb3d8c7349848cd1ce14cd290c56.r2.dev";

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
            const cfRes = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_BUCKET}/objects`,
              {
                headers: {
                  Authorization: `Bearer ${CF_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            const cfJson: any = await cfRes.json();
            if (!cfJson.success) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ success: false, error: cfJson.errors }));
            }

            const rawObjects: any[] = cfJson.result || [];
            let totalBytes = 0;
            let pptxBytes = 0;
            let pptxCount = 0;
            let imagesBytes = 0;
            let imagesCount = 0;

            const objects = rawObjects.map((obj) => {
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
                objects,
              })
            );
          }

          if (req.method === 'POST') {
            const chunks: Buffer[] = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', async () => {
              const buffer = Buffer.concat(chunks);
              const url = new URL(req.url || '', `http://${req.headers.host}`);
              const fileKey = url.searchParams.get('key') || `uploads/file_${Date.now()}`;
              const contentType = req.headers['content-type'] || 'application/octet-stream';

              const uploadRes = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${CF_BUCKET}/objects/${fileKey}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${CF_API_TOKEN}`,
                    'Content-Type': contentType,
                  },
                  body: buffer,
                }
              );
              const uploadJson: any = await uploadRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: uploadJson.success,
                  key: fileKey,
                  publicUrl: `${PUBLIC_CDN_BASE}/${fileKey}`,
                  size: uploadJson.result?.size,
                  errors: uploadJson.errors,
                })
              );
            });
            return;
          }

          if (req.method === 'DELETE') {
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
