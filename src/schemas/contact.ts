import { z } from "zod";

export const ContactRequestSchema = z.object({
  fullName: z.string().min(1),
  emailAddress: z.email(),
  message: z.string().min(6),
});

export const ContactResponseSchema = z.object({
  success: z.literal(true),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;
export type ContactResponse = z.infer<typeof ContactResponseSchema>;
