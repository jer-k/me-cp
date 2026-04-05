import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { BlogPostWithContentSchema } from "../schemas/blog";

export function registerGetBlog(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-blog",
    {
      description:
        "Fetch a single blog post by its slug from jeremykreutzbender.com. Returns the full blog post including content in markdown format.",
      inputSchema: {
        slug: z
          .string()
          .describe(
            "The URL slug of the blog post to fetch (e.g., 'building-a-blog-with-app-router-rsc-tailwind')."
          ),
      },
    },
    async ({ slug }) => {
      try {
        const data = await client.get(`/blogs/${slug}`, BlogPostWithContentSchema);

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
              text: `Error fetching blog post: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
