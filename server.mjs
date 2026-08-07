// Production static server for the PrakritiAI SPA.
// Serves the Vite build output from ./dist with SPA fallback.
// Listens on Railway's PORT environment variable.

import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(url.pathname);

    // Normalize and prevent path traversal.
    let filePath = normalize(join(DIST_DIR, pathname));
    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    // Root or directory -> index.html.
    if (pathname === "/" || filePath === DIST_DIR) {
      filePath = join(DIST_DIR, "index.html");
    }

    // If the requested file exists, serve it; otherwise SPA fallback to index.html.
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      });
      createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback.
    const indexFile = join(DIST_DIR, "index.html");
    if (existsSync(indexFile)) {
      res.writeHead(200, { "Content-Type": MIME_TYPES[".html"] });
      createReadStream(indexFile).pipe(res);
      return;
    }

    res.writeHead(404);
    res.end("Not Found");
  } catch (err) {
    console.error("[server] error:", err);
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`PrakritiAI production server listening on http://${HOST}:${PORT}`);
});
