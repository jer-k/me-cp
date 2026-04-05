import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ApiClient } from "../lib/api-client";
import { AboutResponseSchema } from "../schemas/about";

export function registerGetAbout(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-about",
    {
      description:
        "Get personal information about Jeremy Kreutzbender including name, email, and website.",
    },
    async () => {
      try {
        const data = await client.get("/about", AboutResponseSchema);

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
              text: `Error fetching about information: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
