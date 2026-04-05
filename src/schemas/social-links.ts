import { z } from "zod";

export const SocialLinksResponseSchema = z.object({
  github: z.object({
    profile: z.string(),
    repo: z.string(),
  }),
  twitter: z.string(),
  linkedin: z.string(),
});

export type SocialLinksResponse = z.infer<typeof SocialLinksResponseSchema>;
