import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { TopPagesResponseSchema } from "../schemas/search-stats";

export function registerGetSearchStatsTopPages(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-search-stats-top-pages",
    {
      description:
        "Get the top performing pages on jeremykreutzbender.com from Google Search Console, ranked by clicks. Includes clicks, impressions, CTR, and average position per page.",
      inputSchema: {
        days: z
          .number()
          .min(1)
          .default(30)
          .describe("Number of days to look back for search data. Defaults to 30."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(20)
          .describe("Maximum number of pages to return. Defaults to 20."),
      },
    },
    async ({ days, limit }) => {
      try {
        const data = await client.get(
          `/search-stats/top-pages?days=${days}&limit=${limit}`,
          TopPagesResponseSchema
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
              mimeType: "application/json",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching top pages: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
