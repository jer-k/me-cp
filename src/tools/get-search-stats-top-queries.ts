import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { TopQueriesResponseSchema } from "../schemas/search-stats";

export function registerGetSearchStatsTopQueries(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-search-stats-top-queries",
    {
      description:
        "Get the top search queries driving traffic to jeremykreutzbender.com from Google Search Console. Includes clicks, impressions, CTR, and average position per query.",
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
          .describe("Maximum number of queries to return. Defaults to 20."),
      },
    },
    async ({ days, limit }) => {
      try {
        const data = await client.get(
          `/search-stats/top-queries?days=${days}&limit=${limit}`,
          TopQueriesResponseSchema
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
              text: `Error fetching top queries: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
