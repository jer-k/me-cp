import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { BlogSearchResponseSchema } from "../schemas/blog";

export function registerSearchBlogs(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "search-blogs",
    {
      title: "Search Blog Posts",
      description:
        "Search blog posts on jeremykreutzbender.com by keyword. Searches across titles, descriptions, content, and tags. Returns matching post metadata.",
      inputSchema: {
        query: z.string().min(1).describe("The search query to find matching blog posts."),
      },
    },
    async ({ query }) => {
      try {
        const encodedQuery = encodeURIComponent(query);
        const data = await client.get(`/blogs/search?q=${encodedQuery}`, BlogSearchResponseSchema);

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
              text: `Error searching blogs: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
