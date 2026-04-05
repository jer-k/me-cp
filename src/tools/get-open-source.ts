import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { OpenSourceResponseSchema } from "../schemas/open-source";

export function registerGetOpenSource(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-open-source",
    {
      description:
        "Fetch a paginated list of Jeremy Kreutzbender's open source pull requests. Returns PR metadata including title, repository, and permalink.",
      inputSchema: {
        page: z.number().min(1).default(1).describe("Page number for pagination. Defaults to 1."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(100)
          .describe(
            "Number of pull requests per page. Must be between 1 and 100. Defaults to 100."
          ),
      },
    },
    async ({ page, limit }) => {
      try {
        const data = await client.get(
          `/open-source?page=${page}&limit=${limit}`,
          OpenSourceResponseSchema
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
              text: `Error fetching open source contributions: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
