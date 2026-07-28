import {
  acceptedContent,
  inputRequired,
  inputResponse,
  type McpServer,
} from "@modelcontextprotocol/server";
import { z } from "zod";

import { ApiClient } from "../lib/api-client";
import { ContactRequestSchema, ContactResponseSchema } from "../schemas/contact";

const REQUIRE_ELICITATION_HEADER = "x-me-cp-require-elicitation";
const CONFIRM_SEND_INPUT_KEY = "confirm-send";
const ConfirmSendSchema = z.object({
  confirmSend: z.boolean().describe("Confirm that this contact email should be sent."),
});

function shouldRequireElicitation(headers: Headers | undefined) {
  return headers?.get(REQUIRE_ELICITATION_HEADER)?.trim().toLowerCase() !== "false";
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
    async ({ fullName, emailAddress, message }, context) => {
      const payload = ContactRequestSchema.parse({ fullName, emailAddress, message });
      const requireElicitation = shouldRequireElicitation(context.http?.req?.headers);

      try {
        if (requireElicitation) {
          const response = inputResponse(context.mcpReq.inputResponses, CONFIRM_SEND_INPUT_KEY);

          if (response.kind === "missing") {
            return inputRequired({
              inputRequests: {
                [CONFIRM_SEND_INPUT_KEY]: inputRequired.elicit({
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
                }),
              },
            });
          }

          const confirmation = acceptedContent(
            context.mcpReq.inputResponses,
            CONFIRM_SEND_INPUT_KEY,
            ConfirmSendSchema
          );

          if (confirmation?.confirmSend !== true) {
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
