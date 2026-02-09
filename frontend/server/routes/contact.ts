import { Router, Response, Request } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { db } from "../db.js";
import { contactInquiries } from "../../shared/schema.js";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many inquiries. Please try again later." },
});

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
}

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).transform(stripHtml),
  email: z.string().email("Invalid email format").max(255),
  company: z.string().max(200).optional().transform(val => val ? stripHtml(val) : val),
  inquiryType: z.enum(["business", "partnership", "enterprise", "research", "other"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000).transform(stripHtml),
});

router.post("/submit", contactLimiter, async (req: Request, res: Response) => {
  try {
    const validation = contactSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, email, company, inquiryType, message } = validation.data;
    const sanitizedEmail = email.toLowerCase().trim().replace(/[<>'"\\;]/g, '');
    const sanitizedName = name.replace(/[<>'"\\;]/g, '');

    await db.insert(contactInquiries).values({
      name: sanitizedName,
      email: sanitizedEmail,
      company: company || null,
      inquiryType,
      message,
    });

    res.json({ success: true, message: "Your inquiry has been received. We'll be in touch within 24 hours." });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Contact error:", error instanceof Error ? error.message : "Unknown");
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

export default router;
