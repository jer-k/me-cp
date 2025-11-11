import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ApiClient } from "../lib/api-client";
import { CvResponseSchema } from "../schemas/cv";

export function registerGetCv(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.tool(
    "get-cv",
    "Fetch Jeremy Kreutzbender's complete CV/resume including personal info, work experience, projects, skills, and education.",
    {},
    async () => {
      try {
        const data = await client.get("/api/cv", CvResponseSchema);

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
              text: `Error fetching CV: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
