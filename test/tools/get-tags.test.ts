import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetTags } from "../../src/tools/get-tags";

vi.mock("../../src/lib/api-client");

describe("get-tags tool", () => {
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
      registerTool: vi.fn((_name: string, _config: any, handler: any) => {
        toolHandler = handler;
      }),
    };
  });

  it("should register the tool with correct name and description", () => {
    registerGetTags(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-tags",
      expect.objectContaining({
        title: "Get Blog Post Tags",
        description: expect.stringContaining("unique blog post tags"),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON tags data when API call succeeds", async () => {
    const mockData = {
      tags: ["blogging", "docker", "typescript"],
      total: 3,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetTags(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/tags", expect.any(Object));
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
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetTags(mockServer, mockEnv);
    const result = await toolHandler();

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching tags: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
