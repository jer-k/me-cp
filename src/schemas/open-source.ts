import { z } from "zod";

export const PullRequestSchema = z.object({
  createdAt: z.string(),
  number: z.number(),
  title: z.string(),
  permalink: z.string(),
  repository: z.object({
    name: z.string(),
    nameWithOwner: z.string(),
    url: z.string(),
    owner: z.object({
      login: z.string(),
    }),
  }),
});

export const OpenSourceResponseSchema = z.object({
  pullRequests: z.array(PullRequestSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PullRequest = z.infer<typeof PullRequestSchema>;
export type OpenSourceResponse = z.infer<typeof OpenSourceResponseSchema>;
