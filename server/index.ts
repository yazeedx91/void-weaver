import express from "express";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "../dist");
const indexPath = join(distPath, "index.html");
let _indexHTML: string | null = null;
function getIndexHTML(): string {
  if (_indexHTML === null) {
    _indexHTML = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
  }
  return _indexHTML;
}

export async function mountRoutes(app: any) {
  const [
    { default: cors },
    { default: cookieParser },
    { default: helmet },
    { default: compression },
  ] = await Promise.all([
    import("cors"),
    import("cookie-parser"),
    import("helmet"),
    import("compression"),
  ]);

  app.set("trust proxy", 1);

  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req: any, res: any) => {
        if (req.headers["x-no-compression"]) return false;
        return compression.filter(req, res);
      },
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "blob:"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          frameAncestors: [
            "'self'",
            "https://*.replit.dev",
            "https://*.repl.co",
            "https://*.replit.app",
            "https://flux-dna.com",
          ],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: [],
          scriptSrcAttr: ["'none'"],
          workerSrc: ["'self'", "blob:"],
          manifestSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    })
  );

  app.use((req: any, res: any, next: any) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), interest-cohort=(), browsing-topics=()"
    );
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.removeHeader("X-Frame-Options");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    next();
  });

  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());
  app.use(
    express.json({
      limit: "1mb",
      verify: (req: any, _res: any, buf: Buffer) => {
        if (req.url?.startsWith("/api/webhooks")) {
          req.rawBody = buf.toString("utf8");
        }
      },
    })
  );

  app.use("/api", (req: any, res: any, next: any) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
      if (!req.path.startsWith("/webhooks")) {
        const origin = req.headers["origin"];
        const referer = req.headers["referer"];
        const host = req.headers["host"];
        if (origin) {
          const originHost = new URL(origin).host;
          if (
            originHost !== host &&
            !originHost.endsWith(".replit.dev") &&
            !originHost.endsWith(".repl.co") &&
            !originHost.endsWith(".replit.app") &&
            originHost !== "flux-dna.com"
          ) {
            return res.status(403).json({ error: "Cross-origin request blocked" });
          }
        } else if (referer) {
          try {
            const refererHost = new URL(referer).host;
            if (
              refererHost !== host &&
              !refererHost.endsWith(".replit.dev") &&
              !refererHost.endsWith(".repl.co") &&
              !refererHost.endsWith(".replit.app") &&
              refererHost !== "flux-dna.com"
            ) {
              return res.status(403).json({ error: "Cross-origin request blocked" });
            }
          } catch {
            /* malformed referer, allow */
          }
        }
      }
    }
    next();
  });

  if (existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        etag: true,
        setHeaders: (res: any, filePath: string) => {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (filePath.match(/\.(js|css)$/) && filePath.includes("assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            res.setHeader("Vary", "Accept-Encoding");
          } else if (filePath.match(/\.(woff2?|ttf|eot)$/)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          } else if (filePath.match(/\.(svg|png|jpg|webp|ico)$/)) {
            res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
          }
        },
      })
    );
  }

  const [
    { default: authRoutes },
    { default: stabilityRoutes },
    { default: analyticsRoutes },
    { default: pulseRoutes },
    { default: teamRoutes },
    { default: investorRoutes },
    { default: contactRoutes },
    { default: webhookRoutes },
  ] = await Promise.all([
    import("./routes/auth.js"),
    import("./routes/stability.js"),
    import("./routes/analytics.js"),
    import("./routes/pulse.js"),
    import("./routes/teams.js"),
    import("./routes/investor.js"),
    import("./routes/contact.js"),
    import("./routes/webhooks.js"),
  ]);

  app.use("/api/auth", authRoutes);
  app.use("/api/stability", stabilityRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/pulse", pulseRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/investor", investorRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/webhooks", webhookRoutes);

  app.get("/api/health", (_req: any, res: any) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      platform: "FLUX",
    });
  });

  app.use((req: any, res: any, next: any) => {
    const html = getIndexHTML();
    if (html && !req.path.startsWith("/api")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.status(200).type("html").send(html);
    } else {
      next();
    }
  });

  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.NODE_ENV !== "production") console.error("Server error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  });
}
