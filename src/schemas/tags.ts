import { z } from "zod";

export const TagsResponseSchema = z.object({
  tags: z.array(z.string()),
  total: z.number(),
});

export type TagsResponse = z.infer<typeof TagsResponseSchema>;
