import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerGetAbout } from "../../src/tools/get-about";
import { ApiClient } from "../../src/lib/api-client";

vi.mock("../../src/lib/api-client");

describe("get-about tool", () => {
  let mockServer: any;
  let mockEnv: any;
  let toolHandler: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEnv = {
      API_BASE_URL: "https://api.example.com",
      API_SECRET_KEY: "test-secret-key",
    };

    toolHandler = vi.fn();

    mockServer = {
      tool: vi.fn((_name: string, _description: string, _schema: any, handler: any) => {
        toolHandler = handler;
      }),
    };
  });

  it("should register the tool with correct name and description", () => {
    registerGetAbout(mockServer, mockEnv);

    expect(mockServer.tool).toHaveBeenCalledWith(
      "get-about",
      "Get personal information about Jeremy Kreutzbender including name, email, and website.",
      {},
      expect.any(Function),
    );
  });

  it("should return JSON data with mimeType when API call succeeds", async () => {
    const mockData = {
      name: "Jeremy Kreutzbender",
      email: "jeremy@example.com",
      website: "https://jeremykreutzbender.com",
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(() => ({
      get: mockGet,
    }) as any);

    registerGetAbout(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/api/about", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: JSON.stringify(mockData, null, 2),
          mimeType: "application/json",
        },
      ],
    });
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(() => ({
      get: mockGet,
    }) as any);

    registerGetAbout(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/api/about", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching about information: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
