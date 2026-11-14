// Serves dist/client the way CloudFront does in production: clean URLs map to
// `<path>/index.html`, trailing slashes redirect, unknown paths get /404.html
// with a 404, and every response carries the security headers. Used by
// `pnpm preview` and the Playwright suite.
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { API_ORIGIN, contentSecurityPolicy } from "../security.ts";

const root = fileURLToPath(new URL("../dist/client", import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const apiOrigin = process.env.CSP_API_ORIGIN ?? API_ORIGIN;

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const SECURITY_HEADERS = {
  "Content-Security-Policy": contentSecurityPolicy(apiOrigin),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const isFile = async (path: string) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

/** Mirrors the CloudFront viewer-request function in infra/app/web.ts. */
const resolveUri = (uri: string) => {
  if (uri === "/") return "/index.html";
  return uri.lastIndexOf(".") < uri.lastIndexOf("/") ? `${uri}/index.html` : uri;
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const uri = decodeURIComponent(url.pathname);

  if (uri.length > 1 && uri.endsWith("/")) {
    res.writeHead(301, { Location: uri.slice(0, -1) + url.search, ...SECURITY_HEADERS });
    res.end();
    return;
  }

  const file = normalize(join(root, resolveUri(uri)));
  const found = file.startsWith(root) && (await isFile(file));
  const path = found ? file : join(root, "404.html");

  res.writeHead(found ? 200 : 404, {
    "Content-Type": TYPES[extname(path)] ?? "application/octet-stream",
    ...SECURITY_HEADERS,
  });
  createReadStream(path).pipe(res);
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`);
});
