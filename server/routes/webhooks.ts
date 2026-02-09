import { Router, Response, Request } from "express";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../db.js";
import { inboundMessages } from "../../shared/schema.js";

const router = Router();

const resendWebhookSchema = z.object({
  type: z.string(),
  created_at: z.string().optional(),
  data: z.object({
    email_id: z.string().optional(),
    from: z.string().optional(),
    to: z.union([z.string(), z.array(z.string())]).optional(),
    subject: z.string().optional(),
    text: z.string().optional(),
    html: z.string().optional(),
    created_at: z.string().optional(),
  }).passthrough(),
});

function verifyResendSignature(req: Request): boolean {
  const signingSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!signingSecret) return true;

  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  const timestampNum = parseInt(svixTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNum) > 300) return false;

  const body = (req as any).rawBody || JSON.stringify(req.body);
  const toSign = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = Buffer.from(signingSecret.replace('whsec_', ''), 'base64');
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(toSign)
    .digest('base64');

  const expectedBuf = Buffer.from(expectedSignature);
  const signatures = svixSignature.split(' ');
  return signatures.some(sig => {
    const sigValue = sig.replace(/^v\d+,/, '');
    const sigBuf = Buffer.from(sigValue);
    if (expectedBuf.length !== sigBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, sigBuf);
  });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

router.post("/resend", async (req: Request, res: Response) => {
  try {
    if (!verifyResendSignature(req)) {
      if (process.env.NODE_ENV !== 'production') console.warn("FLUX webhook: invalid signature rejected");
      return res.status(401).json({ error: "Invalid webhook signature" });
    }

    const validation = resendWebhookSchema.safeParse(req.body);
    if (!validation.success) {
      if (process.env.NODE_ENV !== 'production') console.warn("FLUX webhook: malformed payload");
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { type, data } = validation.data;

    const fromEmail = typeof data.from === 'string' ? data.from : '';
    const toEmail = Array.isArray(data.to) ? data.to[0] || '' : (data.to || '');
    const subject = data.subject || '';
    const textBody = data.text || '';
    const htmlBody = data.html || '';

    await db.insert(inboundMessages).values({
      eventType: type,
      resendEmailId: data.email_id || null,
      fromEmail,
      toEmail,
      subject,
      textBody: textBody.substring(0, 10000),
      htmlBody: htmlBody.substring(0, 50000),
      rawPayload: JSON.stringify(data).substring(0, 100000),
      status: 'received',
    });

    if (process.env.NODE_ENV !== 'production') console.log(`FLUX webhook [${type}] from ${maskEmail(fromEmail)} → ${maskEmail(toEmail)}: "${subject.substring(0, 50)}"`);

    res.json({ received: true });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("FLUX webhook error:", error instanceof Error ? error.message : "Unknown");
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "FLUX Two-Way Communication Bridge",
    capabilities: ["email.sent", "email.delivered", "email.bounced", "email.complained", "email.received"],
  });
});

export default router;
