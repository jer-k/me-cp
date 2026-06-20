import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { ContactRequestSchema, ContactResponseSchema } from "../schemas/contact";

const REQUIRE_ELICITATION_HEADER = "x-me-cp-require-elicitation";

function shouldRequireElicitation(
  headers: Record<string, string | string[] | undefined> | undefined
) {
  const header = Object.entries(headers ?? {}).find(
    ([name]) => name.toLowerCase() === REQUIRE_ELICITATION_HEADER
  )?.[1];
  const value = Array.isArray(header) ? header[0] : header;

  return value?.trim().toLowerCase() !== "false";
}

export function registerSendContactEmail(server: McpServer, env: Env) {
  const client = new ApiClient(env.API_BASE_URL, env.API_SECRET_KEY);

  server.registerTool(
    "send-contact-email",
    {
      title: "Send Contact Email",
      description: "Send a contact email to Jeremy Kreutzbender through jeremykreutzbender.com.",
      inputSchema: {
        fullName: z.string().min(1).describe("The full name of the person sending the email."),
        emailAddress: z.email().describe("The reply-to email address for the sender."),
        message: z
          .string()
          .min(6)
          .describe("The contact message to send. Must be at least 6 characters."),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ fullName, emailAddress, message }, extra) => {
      const payload = ContactRequestSchema.parse({ fullName, emailAddress, message });
      const requireElicitation = shouldRequireElicitation(extra?.requestInfo?.headers);

      try {
        if (requireElicitation) {
          const confirmation = await server.server.elicitInput({
            mode: "form",
            message: `Send this contact email from ${payload.fullName} <${payload.emailAddress}>?\n\n${payload.message}`,
            requestedSchema: {
              type: "object",
              properties: {
                confirmSend: {
                  type: "boolean",
                  title: "Send email",
                  description: "Confirm that this contact email should be sent.",
                  default: false,
                },
              },
              required: ["confirmSend"],
            },
          });

          if (confirmation.action !== "accept" || confirmation.content?.confirmSend !== true) {
            return {
              content: [
                {
                  type: "text",
                  text: "Contact email was not sent.",
                },
              ],
            };
          }
        }

        const data = await client.post("/contact", payload, ContactResponseSchema);

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
              text: `Error sending contact email: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
