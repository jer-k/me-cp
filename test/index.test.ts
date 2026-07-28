import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { describe, expect, it, vi } from "vitest";

import worker from "../src";

describe("MCP v2 handler", () => {
  it("negotiates the modern protocol and completes stateless elicitation", async () => {
    const env = {
      API_BASE_URL: "https://api.example.com",
      API_SECRET_KEY: "test-secret-key",
    } as Env;
    const executionContext = {
      passThroughOnException: vi.fn(),
      waitUntil: vi.fn(),
    } as unknown as ExecutionContext;
    const transport = new StreamableHTTPClientTransport(new URL("https://example.com/mcp"), {
      fetch: (input, init) => worker.fetch(new Request(input, init), env, executionContext),
    });
    const client = new Client(
      {
        name: "me-cp-test",
        version: "1.0.0",
      },
      {
        capabilities: {
          elicitation: {
            form: {},
          },
        },
        versionNegotiation: {
          mode: { pin: "2026-07-28" },
        },
      }
    );
    const apiFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    );
    vi.stubGlobal("fetch", apiFetch);
    client.setRequestHandler("elicitation/create", async () => ({
      action: "accept",
      content: { confirmSend: true },
    }));

    try {
      await client.connect(transport);

      expect(client.getProtocolEra()).toBe("modern");

      const result = await client.listTools();

      expect(result.tools.map(({ name }) => name)).toEqual(
        expect.arrayContaining(["get-about", "get-blogs", "send-contact-email"])
      );

      const callResult = await client.callTool({
        name: "send-contact-email",
        arguments: {
          fullName: "Ada Lovelace",
          emailAddress: "ada@example.com",
          message: "Hello from the MCP v2 client.",
        },
      });

      expect(callResult.isError).not.toBe(true);
      expect(apiFetch).toHaveBeenCalledOnce();
    } finally {
      await client.close();
      vi.unstubAllGlobals();
    }
  });
});
