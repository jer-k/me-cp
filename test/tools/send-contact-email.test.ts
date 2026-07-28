import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerSendContactEmail } from "../../src/tools/send-contact-email";

vi.mock("../../src/lib/api-client");

describe("send-contact-email tool", () => {
  let mockServer: any;
  let mockEnv: any;
  let toolHandler: any;

  const payload = {
    fullName: "Ada Lovelace",
    emailAddress: "ada@example.com",
    message: "Hello from the MCP tool.",
  };

  const requestContext = ({
    requireElicitation,
    response,
  }: {
    requireElicitation?: string;
    response?: Record<string, unknown>;
  } = {}) => ({
    http: {
      req: new Request("https://example.com/mcp", {
        headers:
          requireElicitation === undefined
            ? undefined
            : { "X-Me-CP-Require-Elicitation": requireElicitation },
      }),
    },
    mcpReq: {
      inputResponses:
        response === undefined
          ? undefined
          : {
              "confirm-send": response,
            },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockEnv = {
      API_BASE_URL: "https://api.example.com",
      API_SECRET_KEY: "test-secret-key",
    };

    toolHandler = vi.fn();

    mockServer = {
      registerTool: vi.fn((_name: string, _config: any, handler: any) => {
        toolHandler = handler;
      }),
    };
  });

  it("should register the tool with correct name, description, and input schema", () => {
    registerSendContactEmail(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "send-contact-email",
      expect.objectContaining({
        title: "Send Contact Email",
        description: expect.stringContaining("Send a contact email"),
        inputSchema: expect.any(Object),
        annotations: expect.objectContaining({
          readOnlyHint: false,
          idempotentHint: false,
          openWorldHint: true,
        }),
      }),
      expect.any(Function)
    );
  });

  it("should request confirmation before sending the contact email", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload, requestContext());

    expect(mockPost).not.toHaveBeenCalled();
    expect(result).toEqual({
      resultType: "input_required",
      inputRequests: {
        "confirm-send": {
          method: "elicitation/create",
          params: {
            message: expect.stringContaining("Send this contact email from Ada Lovelace"),
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
            mode: "form",
          },
        },
      },
    });
  });

  it("should send the contact email when confirmation is accepted", async () => {
    const mockPost = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(
      payload,
      requestContext({
        response: {
          action: "accept",
          content: { confirmSend: true },
        },
      })
    );

    expect(mockPost).toHaveBeenCalledWith("/contact", payload, expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true }, null, 2),
          mimeType: "application/json",
        },
      ],
    });
  });

  it("should send without elicitation when the connection header opts out", async () => {
    const mockPost = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload, requestContext({ requireElicitation: "false" }));

    expect(mockPost).toHaveBeenCalledWith("/contact", payload, expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify({ success: true }, null, 2),
          mimeType: "application/json",
        },
      ],
    });
  });

  it("should require elicitation when the connection header is true", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload, requestContext({ requireElicitation: "true" }));

    expect(result).toEqual(
      expect.objectContaining({
        resultType: "input_required",
      })
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("should not send the contact email when confirmation is declined", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload, requestContext({ response: { action: "decline" } }));

    expect(mockPost).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Contact email was not sent.",
        },
      ],
    });
  });

  it("should not send the contact email when confirmation is canceled", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload, requestContext({ response: { action: "cancel" } }));

    expect(mockPost).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Contact email was not sent.",
        },
      ],
    });
  });

  it("should not send the contact email when confirmSend is false", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(
      payload,
      requestContext({
        response: {
          action: "accept",
          content: { confirmSend: false },
        },
      })
    );

    expect(mockPost).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Contact email was not sent.",
        },
      ],
    });
  });

  it("should not send the contact email when confirmation content is invalid", async () => {
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(
      payload,
      requestContext({
        response: {
          action: "accept",
          content: { confirmSend: "yes" },
        },
      })
    );

    expect(mockPost).not.toHaveBeenCalled();
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Contact email was not sent.",
        },
      ],
    });
  });

  it("should return error response when API call fails", async () => {
    const mockPost = vi.fn().mockRejectedValue(new Error("API request failed: 502 Bad Gateway"));
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(
      payload,
      requestContext({
        response: {
          action: "accept",
          content: { confirmSend: true },
        },
      })
    );

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error sending contact email: API request failed: 502 Bad Gateway",
        },
      ],
      isError: true,
    });
  });
});
