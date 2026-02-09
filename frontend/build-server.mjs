import { build } from "esbuild";
import fs from "fs";

fs.rmSync("dist-server", { recursive: true, force: true });
console.log("Purged dist-server/");

await build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist-server/index.js",
  packages: "external",
  sourcemap: false,
  minify: false,
  jsx: "automatic",
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

const stat = fs.statSync("dist-server/index.js");
console.log("Build complete: dist-server/index.js (" + stat.size + " bytes)");

const bootJs = `import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BOOT = Date.now();
const PORT = parseInt(process.env.PORT || "5000", 10);
const __dir = dirname(fileURLToPath(import.meta.url));

process.on("uncaughtException", (err) => {
  process.stderr.write("[flux] uncaughtException: " + (err && err.stack || err) + "\\n");
});
process.on("unhandledRejection", (reason) => {
  process.stderr.write("[flux] unhandledRejection: " + String(reason) + "\\n");
});

let ready = false;
let handler = null;

const WARM_BODY = "<!DOCTYPE html><html><head><title>FLUX-DNA</title></head><body>OK</body></html>";
const WARM_LEN = Buffer.byteLength(WARM_BODY);

function serve(req, res) {
  if (handler) {
    try { handler(req, res); } catch(e) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": WARM_LEN, "Cache-Control": "no-cache" });
      res.end(WARM_BODY);
    }
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Content-Length": WARM_LEN, "Cache-Control": "no-cache" });
  res.end(WARM_BODY);
}

const server = createServer({ keepAlive: true, keepAliveInitialDelay: 0 }, serve);

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.requestTimeout = 30000;

server.on("error", (err) => {
  process.stderr.write("[flux] server error: " + err.message + "\\n");
});

ready = true;
server.listen(PORT, "0.0.0.0", () => {
  process.stdout.write("[flux] port open 0.0.0.0:" + PORT + " node=" + process.version + " pid=" + process.pid + " ready=" + ready + " (" + (Date.now() - BOOT) + "ms)\\n");

  setTimeout(() => {
    bootstrap().catch((err) => {
      process.stderr.write("[flux] bootstrap error: " + (err && err.stack || err) + "\\n");
    });
  }, 0);
});

async function bootstrap() {
  let HTML;
  try {
    HTML = await readFile(join(__dir, "..", "dist", "index.html"), "utf8");
  } catch {
    HTML = WARM_BODY;
  }
  process.stdout.write("[flux] html loaded (" + (Date.now() - BOOT) + "ms)\\n");

  let mountRoutes;
  try {
    const mod = await import("./index.js");
    mountRoutes = mod.mountRoutes;
    process.stdout.write("[flux] server bundle loaded (" + (Date.now() - BOOT) + "ms)\\n");
  } catch (err) {
    process.stderr.write("[flux] bundle import failed: " + (err && err.stack || err) + "\\n");
    return;
  }

  const express = (await import("express")).default;
  const app = express();
  app.disable("x-powered-by");

  const htmlLen = Buffer.byteLength(HTML);
  app.get("/", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": htmlLen,
      "Cache-Control": "no-cache"
    });
    res.end(HTML);
  });
  app.get("/healthz", (q, s) => { s.writeHead(200, { "Content-Type": "text/plain", "Content-Length": 2 }); s.end("OK"); });
  app.get("/health", (q, s) => { s.writeHead(200, { "Content-Type": "text/plain", "Content-Length": 2 }); s.end("OK"); });

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("mountRoutes timed out after 10s")), 10000)
    );
    await Promise.race([mountRoutes(app), timeoutPromise]);
    process.stdout.write("[flux] routes mounted (" + (Date.now() - BOOT) + "ms)\\n");
    handler = app;
    process.stdout.write("[flux] fully ready (" + (Date.now() - BOOT) + "ms)\\n");
  } catch (err) {
    process.stderr.write("[flux] mountRoutes failed: " + (err && err.stack || err) + "\\n");
    process.stderr.write("[flux] fallback handler remains active\\n");
  }
}
`;

fs.writeFileSync("dist-server/boot.js", bootJs);
console.log("Boot loader written: dist-server/boot.js");
