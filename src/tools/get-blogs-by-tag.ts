import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { BlogsByTagResponseSchema } from "../schemas/blog";

export function registerGetBlogsByTag(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-blogs-by-tag",
    {
      title: "Get Blog Posts by Tag",
      description:
        "Fetch blog posts filtered by a specific tag from jeremykreutzbender.com. Returns post metadata for all posts matching the given tag.",
      inputSchema: {
        tag: z.string().describe("The tag to filter blog posts by (case-insensitive)."),
      },
    },
    async ({ tag }) => {
      try {
        const encodedTag = encodeURIComponent(tag);
        const data = await client.get(`/blogs/by-tag/${encodedTag}`, BlogsByTagResponseSchema);

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
              text: `Error fetching blogs by tag: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
