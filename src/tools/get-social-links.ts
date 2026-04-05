import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ApiClient } from "../lib/api-client";
import { SocialLinksResponseSchema } from "../schemas/social-links";

export function registerGetSocialLinks(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-social-links",
    {
      description:
        "Get Jeremy Kreutzbender's social media links including GitHub, Twitter, and LinkedIn profiles.",
    },
    async () => {
      try {
        const data = await client.get("/social-links", SocialLinksResponseSchema);

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
              text: `Error fetching social links: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
