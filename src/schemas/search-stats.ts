import { z } from "zod";

const SearchMetricsSchema = z.object({
  clicks: z.number(),
  impressions: z.number(),
  ctr: z.number(),
  position: z.number(),
});

export const TopQueriesResponseSchema = z.object({
  queries: z.array(SearchMetricsSchema.extend({ query: z.string() })),
  days: z.number(),
  total: z.number(),
});

export const TopPagesResponseSchema = z.object({
  pages: z.array(SearchMetricsSchema.extend({ page: z.string() })),
  days: z.number(),
  total: z.number(),
});

export const SearchSummaryResponseSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  totalClicks: z.number(),
  totalImpressions: z.number(),
  averageCtr: z.number(),
  averagePosition: z.number(),
});

export type TopQueriesResponse = z.infer<typeof TopQueriesResponseSchema>;
export type TopPagesResponse = z.infer<typeof TopPagesResponseSchema>;
export type SearchSummaryResponse = z.infer<typeof SearchSummaryResponseSchema>;
