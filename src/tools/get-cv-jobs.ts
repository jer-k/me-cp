import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ApiClient } from "../lib/api-client";
import { JobsResponseSchema } from "../schemas/cv";

export function registerGetCvJobs(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "get-cv-jobs",
    {
      description:
        "Fetch only the work experience/jobs section from Jeremy Kreutzbender's CV. Returns a list of positions with company names, titles, durations, and detailed descriptions.",
    },
    async () => {
      try {
        const data = await client.get("/cv/jobs", JobsResponseSchema);

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
              text: `Error fetching CV jobs: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
