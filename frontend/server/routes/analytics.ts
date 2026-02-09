import { Router, Request, Response } from "express";
import { z } from "zod";

const analyticsEventSchema = z.object({
  event: z.string().min(1).max(100),
});

const router = Router();

const ALLOWED_EVENTS = new Set([
  'get_started_click',
  'assessment_complete',
  'page_view',
]);

const eventCounts: Record<string, number> = {};
let lastReset = Date.now();

const analyticsRateMap = new Map<string, number[]>();
const ANALYTICS_RATE_LIMIT = 30;
const ANALYTICS_RATE_WINDOW = 60000;

function checkAnalyticsRate(ip: string): boolean {
  const now = Date.now();
  const timestamps = analyticsRateMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < ANALYTICS_RATE_WINDOW);
  if (recent.length >= ANALYTICS_RATE_LIMIT) return false;
  recent.push(now);
  analyticsRateMap.set(ip, recent);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of analyticsRateMap.entries()) {
    const recent = timestamps.filter(t => now - t < ANALYTICS_RATE_WINDOW);
    if (recent.length === 0) analyticsRateMap.delete(ip);
    else analyticsRateMap.set(ip, recent);
  }
}, 120000);

router.post("/event", (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkAnalyticsRate(ip)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const validation = analyticsEventSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: "Invalid event payload" });
  }
  const { event } = validation.data;

  if (!ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: "Invalid event" });
  }

  eventCounts[event] = (eventCounts[event] || 0) + 1;

  res.json({ ok: true });
});

router.get("/summary", (req, res) => {
  const uptimeHours = ((Date.now() - lastReset) / 3600000).toFixed(1);
  res.json({
    counts: { ...eventCounts },
    uptimeHours,
    since: new Date(lastReset).toISOString(),
  });
});

export default router;
