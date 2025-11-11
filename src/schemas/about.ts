import { z } from "zod/v4";

export const AboutResponseSchema = z.object({
  name: z.string(),
  email: z.string(),
  website: z.string(),
});

export type AboutResponse = z.infer<typeof AboutResponseSchema>;
