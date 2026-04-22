import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ApiClient } from "../lib/api-client";
import { TagsResponseSchema } from "../schemas/tags";

export function registerGetTags(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-tags",
    {
      title: "Get Blog Post Tags",
      description:
        "Get all unique blog post tags from jeremykreutzbender.com. Returns a sorted list of tags and the total count.",
    },
    async () => {
      try {
        const data = await client.get("/tags", TagsResponseSchema);

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
              text: `Error fetching tags: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
