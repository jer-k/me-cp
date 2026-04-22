import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetOpenSource } from "../../src/tools/get-open-source";

vi.mock("../../src/lib/api-client");

describe("get-open-source tool", () => {
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
    registerGetOpenSource(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-open-source",
      expect.objectContaining({
        title: "Get Open Source Contributions",
        description: expect.stringContaining("open source pull requests"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON pull request data with default parameters", async () => {
    const mockData = {
      pullRequests: [
        {
          createdAt: "2024-01-15T10:00:00Z",
          number: 42,
          title: "Fix typo in README",
          permalink: "https://github.com/some-org/some-repo/pull/42",
          repository: {
            name: "some-repo",
            nameWithOwner: "some-org/some-repo",
            url: "https://github.com/some-org/some-repo",
            owner: { login: "some-org" },
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 100,
        total: 1,
        totalPages: 1,
      },
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetOpenSource(mockServer, mockEnv);
    const result = await toolHandler({ page: 1, limit: 100 });

    expect(mockGet).toHaveBeenCalledWith("/open-source?page=1&limit=100", expect.any(Object));
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

  it("should support custom pagination parameters", async () => {
    const mockData = {
      pullRequests: [],
      pagination: { page: 2, limit: 10, total: 15, totalPages: 2 },
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetOpenSource(mockServer, mockEnv);
    await toolHandler({ page: 2, limit: 10 });

    expect(mockGet).toHaveBeenCalledWith("/open-source?page=2&limit=10", expect.any(Object));
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetOpenSource(mockServer, mockEnv);
    const result = await toolHandler({ page: 1, limit: 100 });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching open source contributions: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
