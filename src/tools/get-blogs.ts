import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { BlogsResponseSchema } from "../schemas/blog";

export function registerGetBlogs(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-blogs",
    {
      description:
        "Fetch a paginated list of blog posts from jeremykreutzbender.com. Returns post metadata including title, slug, date, tags, and description but not full content.",
      inputSchema: {
        page: z.number().min(1).default(1).describe("Page number for pagination. Defaults to 1."),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(100)
          .describe("Number of posts per page. Must be between 1 and 100. Defaults to 100."),
      },
    },
    async ({ page, limit }) => {
      try {
        const data = await client.get(`/blogs?page=${page}&limit=${limit}`, BlogsResponseSchema);

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
              text: `Error fetching blogs: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
