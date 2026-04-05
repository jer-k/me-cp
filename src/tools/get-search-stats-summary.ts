import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { SearchSummaryResponseSchema } from "../schemas/search-stats";

export function registerGetSearchStatsSummary(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-search-stats-summary",
    {
      description:
        "Get a summary of Google Search Console statistics for jeremykreutzbender.com including total clicks, impressions, average CTR, and average position.",
      inputSchema: {
        days: z
          .number()
          .min(1)
          .default(30)
          .describe("Number of days to look back for search data. Defaults to 30."),
      },
    },
    async ({ days }) => {
      try {
        const data = await client.get(
          `/search-stats/summary?days=${days}`,
          SearchSummaryResponseSchema
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
              text: `Error fetching search stats summary: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
