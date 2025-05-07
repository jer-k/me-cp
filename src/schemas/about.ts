import { z } from 'zod';

export const AboutSchema = z.object({
  name: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  interests: z.array(z.string()),
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url(),
    })
  ).optional(),
});

export type About = z.infer<typeof AboutSchema>;