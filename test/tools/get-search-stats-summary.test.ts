import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetSearchStatsSummary } from "../../src/tools/get-search-stats-summary";

vi.mock("../../src/lib/api-client");

describe("get-search-stats-summary tool", () => {
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
    registerGetSearchStatsSummary(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-search-stats-summary",
      expect.objectContaining({
        description: expect.stringContaining("Google Search Console statistics"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON summary data with default days", async () => {
    const mockData = {
      startDate: "2026-03-05",
      endDate: "2026-04-02",
      totalClicks: 500,
      totalImpressions: 5000,
      averageCtr: 0.1,
      averagePosition: 12.3,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetSearchStatsSummary(mockServer, mockEnv);
    const result = await toolHandler({ days: 28 });

    expect(mockGet).toHaveBeenCalledWith("/search-stats/summary?days=28", expect.any(Object));
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

  it("should support custom days parameter", async () => {
    const mockData = {
      startDate: "2026-01-05",
      endDate: "2026-04-02",
      totalClicks: 1500,
      totalImpressions: 15000,
      averageCtr: 0.1,
      averagePosition: 10.5,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetSearchStatsSummary(mockServer, mockEnv);
    await toolHandler({ days: 90 });

    expect(mockGet).toHaveBeenCalledWith("/search-stats/summary?days=90", expect.any(Object));
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetSearchStatsSummary(mockServer, mockEnv);
    const result = await toolHandler({ days: 28 });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching search stats summary: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
