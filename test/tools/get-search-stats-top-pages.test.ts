import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetSearchStatsTopPages } from "../../src/tools/get-search-stats-top-pages";

vi.mock("../../src/lib/api-client");

describe("get-search-stats-top-pages tool", () => {
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
    registerGetSearchStatsTopPages(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-search-stats-top-pages",
      expect.objectContaining({
        description: expect.stringContaining("top performing pages"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON top pages data with default parameters", async () => {
    const mockData = {
      pages: [
        {
          page: "https://jeremykreutzbender.com/blog/getting-started",
          clicks: 40,
          impressions: 300,
          ctr: 0.133,
          position: 3.2,
        },
      ],
      days: 28,
      total: 1,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetSearchStatsTopPages(mockServer, mockEnv);
    const result = await toolHandler({ days: 28, limit: 20 });

    expect(mockGet).toHaveBeenCalledWith(
      "/search-stats/top-pages?days=28&limit=20",
      expect.any(Object)
    );
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

  it("should support custom days and limit parameters", async () => {
    const mockData = { pages: [], days: 7, total: 0 };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetSearchStatsTopPages(mockServer, mockEnv);
    await toolHandler({ days: 7, limit: 5 });

    expect(mockGet).toHaveBeenCalledWith(
      "/search-stats/top-pages?days=7&limit=5",
      expect.any(Object)
    );
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetSearchStatsTopPages(mockServer, mockEnv);
    const result = await toolHandler({ days: 28, limit: 20 });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching top pages: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
