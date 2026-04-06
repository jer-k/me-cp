import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerSearchBlogs } from "../../src/tools/search-blogs";

vi.mock("../../src/lib/api-client");

describe("search-blogs tool", () => {
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
    registerSearchBlogs(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "search-blogs",
      expect.objectContaining({
        description: expect.stringContaining("Search blog posts"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON search results when API call succeeds", async () => {
    const mockData = {
      query: "docker",
      posts: [
        {
          title: "Docker Guide",
          slug: "docker-guide",
          date: "2024-01-01",
          tags: ["docker"],
          description: "A guide to Docker",
        },
      ],
      total: 1,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerSearchBlogs(mockServer, mockEnv);
    const result = await toolHandler({ query: "docker" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/search?q=docker", expect.any(Object));
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

  it("should URL-encode the query parameter", async () => {
    const mockData = { query: "getting started", posts: [], total: 0 };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerSearchBlogs(mockServer, mockEnv);
    await toolHandler({ query: "getting started" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/search?q=getting%20started", expect.any(Object));
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerSearchBlogs(mockServer, mockEnv);
    const result = await toolHandler({ query: "docker" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error searching blogs: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
