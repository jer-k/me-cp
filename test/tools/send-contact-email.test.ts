import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerSendContactEmail } from "../../src/tools/send-contact-email";

vi.mock("../../src/lib/api-client");

describe("send-contact-email tool", () => {
  let mockServer: any;
  let mockEnv: any;
  let toolHandler: any;
  let mockElicitInput: any;

  const payload = {
    fullName: "Ada Lovelace",
    emailAddress: "ada@example.com",
    message: "Hello from the MCP tool.",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockEnv = {
      API_BASE_URL: "https://api.example.com",
      API_SECRET_KEY: "test-secret-key",
    };

    toolHandler = vi.fn();
    mockElicitInput = vi.fn().mockResolvedValue({
      action: "accept",
      content: { confirmSend: true },
    });

    mockServer = {
      server: {
        elicitInput: mockElicitInput,
      },
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

  it("should elicit confirmation and send the contact email when confirmed", async () => {
    const mockPost = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

    expect(mockElicitInput).toHaveBeenCalledWith({
      mode: "form",
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
    });
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

  it("should not send the contact email when confirmation is declined", async () => {
    mockElicitInput.mockResolvedValue({ action: "decline" });
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

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
    mockElicitInput.mockResolvedValue({ action: "cancel" });
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

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
    mockElicitInput.mockResolvedValue({
      action: "accept",
      content: { confirmSend: false },
    });
    const mockPost = vi.fn();
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

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

  it("should return error response when elicitation is not supported", async () => {
    mockElicitInput.mockRejectedValue(new Error("Client does not support form elicitation."));

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error sending contact email: Client does not support form elicitation.",
        },
      ],
      isError: true,
    });
  });

  it("should return error response when API call fails", async () => {
    const mockPost = vi.fn().mockRejectedValue(new Error("API request failed: 502 Bad Gateway"));
    vi.mocked(ApiClient).mockImplementation(function () {
      return { post: mockPost } as any;
    });

    registerSendContactEmail(mockServer, mockEnv);
    const result = await toolHandler(payload);

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
