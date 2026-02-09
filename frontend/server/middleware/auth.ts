import { Request, Response, NextFunction } from "express";
import { db } from "../db.js";
import { users } from "../../shared/schema.js";
import { eq, and, gt } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies?.session;

    if (!sessionToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [user] = await db.select()
      .from(users)
      .where(
        and(
          eq(users.sessionToken, sessionToken),
          gt(users.sessionExpiresAt, new Date())
        )
      );

    if (!user) {
      res.clearCookie("session");
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Auth middleware error:", error instanceof Error ? error.message : "Unknown error");
    res.status(500).json({ error: "Authentication error" });
  }
}

export function optionalAuth(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  const sessionToken = req.cookies?.session;
  
  if (!sessionToken) {
    return next();
  }

  db.select()
    .from(users)
    .where(
      and(
        eq(users.sessionToken, sessionToken),
        gt(users.sessionExpiresAt, new Date())
      )
    )
    .then(([user]) => {
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
      next();
    })
    .catch(() => next());
}
