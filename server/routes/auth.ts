import { Router, Request, Response } from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { db } from "../db.js";
import { users, userResults, teams } from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import { sendMagicLinkEmail } from "../lib/mailer.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { magicLinkRequestSchema, validateRequest } from "../lib/validation.js";
import { z } from "zod";

const verifyTokenSchema = z.object({
  token: z.string().length(64, "Invalid token format"),
});

const router = Router();

const backoffStore = new Map<string, { level: number; lastViolation: number }>();

const getBackoffMinutes = (level: number): number => {
  const minutes = [15, 30, 60, 120];
  return minutes[Math.min(level - 1, minutes.length - 1)];
};

const exponentialBackoffHandler = (req: Request, res: Response) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  
  let entry = backoffStore.get(key);
  if (!entry) {
    entry = { level: 1, lastViolation: now };
    backoffStore.set(key, entry);
  } else {
    if (now - entry.lastViolation < 3600000) {
      entry.level = Math.min(entry.level + 1, 4);
    }
    entry.lastViolation = now;
    backoffStore.set(key, entry);
  }
  
  const waitMinutes = getBackoffMinutes(entry.level);
  
  res.status(429).json({ 
    error: `Rate limit exceeded. Please wait ${waitMinutes} minutes before trying again.`,
    retryAfter: waitMinutes * 60,
    backoffLevel: entry.level
  });
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of backoffStore.entries()) {
    if (now - value.lastViolation > 7200000) {
      backoffStore.delete(key);
    }
  }
}, 300000);

const magicLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: exponentialBackoffHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.body?.email?.endsWith('@test.local'),
});

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  handler: exponentialBackoffHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  handler: exponentialBackoffHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/request-magic-link", magicLinkLimiter, async (req: Request, res: Response) => {
  try {
    // Validate input with Zod
    const validation = validateRequest(magicLinkRequestSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim().replace(/[<>'"\\;]/g, '');
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    let [existingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (existingUser) {
      await db.update(users)
        .set({ magicLinkToken: token, magicLinkExpiresAt: expiresAt })
        .where(eq(users.email, normalizedEmail));
    } else {
      await db.insert(users).values({
        email: normalizedEmail,
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt,
      });
    }
    
    // Build magic link URL
    const baseUrl = process.env.APP_DOMAIN
      ? `https://${process.env.APP_DOMAIN}`
      : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : `http://0.0.0.0:${process.env.PORT || 8080}`;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;
    
    await sendMagicLinkEmail(normalizedEmail, magicLink);
    
    // Always return success to prevent email enumeration
    res.json({ success: true, message: "If this email exists, a magic link has been sent." });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error sending magic link:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.get("/verify", verifyLimiter, async (req: Request, res: Response) => {
  try {
    const queryValidation = verifyTokenSchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ error: "Invalid token format" });
    }
    const { token } = queryValidation.data;
    
    const [user] = await db.select().from(users)
      .where(eq(users.magicLinkToken, token));
    
    if (!user) {
      return res.redirect('/login?expired=true');
    }
    
    if (user.magicLinkExpiresAt && new Date() > user.magicLinkExpiresAt) {
      await db.update(users)
        .set({ magicLinkToken: null, magicLinkExpiresAt: null })
        .where(eq(users.id, user.id));
      return res.redirect('/login?expired=true');
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await db.update(users)
      .set({ 
        magicLinkToken: null, 
        magicLinkExpiresAt: null,
        sessionToken,
        sessionExpiresAt,
        lastLoginAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });
    
    const existingResults = await db.select({ id: userResults.id })
      .from(userResults)
      .where(eq(userResults.userId, user.id))
      .limit(1);
    
    if (existingResults.length > 0) {
      res.redirect(`/results?authenticated=true`);
    } else {
      res.redirect(`/?authenticated=true`);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error verifying magic link:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to verify token" });
  }
});

router.get("/me", generalLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user info" });
  }
});

router.post("/logout", generalLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user) {
      await db.update(users)
        .set({ sessionToken: null, sessionExpiresAt: null })
        .where(eq(users.id, req.user.id));
    }
    res.clearCookie("session", { path: "/" });
    res.json({ success: true });
  } catch (error) {
    res.clearCookie("session", { path: "/" });
    res.json({ success: true });
  }
});

router.delete("/account", generalLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    await db.delete(teams).where(eq(teams.leaderUserId, userId));
    await db.delete(users).where(eq(users.id, userId));
    res.clearCookie("session", { path: "/" });
    res.json({ success: true, message: "Account and all associated data have been permanently deleted." });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error deleting account:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
