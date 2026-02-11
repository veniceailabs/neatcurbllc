import { z } from "zod";

const trimmed = () => z.string().trim().min(1);

export const sendEmailSchema = z.object({
  client_id: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().trim().min(1).max(160).optional(),
  body: z.string().trim().min(1).max(4000)
});

export const sendSmsSchema = z.object({
  client_id: z.string().uuid(),
  to: z.string().trim().min(8).max(24),
  body: z.string().trim().min(1).max(1200)
});

export const auditWriteSchema = z.object({
  action: trimmed().max(120),
  entity: z.string().trim().max(120).optional(),
  entity_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const stripeDepositSchema = z.object({
  lead_id: z.string().uuid()
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().trim().min(1).max(8000)
      })
    )
    .min(1),
  settings: z
    .object({
      maxTokens: z.number().int().min(64).max(2048).optional(),
      temperature: z.number().min(0).max(2).optional(),
      topP: z.number().min(0).max(1).optional()
    })
    .optional()
});

export const publicLeadSchema = z.object({
  name: trimmed().max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(32),
  address: z.string().trim().max(240).optional().nullable(),
  zip: z.string().trim().max(12).optional().nullable(),
  service: trimmed().max(80),
  message: z.string().trim().max(2000).optional().nullable(),
  estimated_low: z.number().min(0).max(1000000),
  estimated_high: z.number().min(0).max(1000000),
  pricing_meta: z.record(z.unknown()).optional(),
  honeypot: z.string().optional()
});
