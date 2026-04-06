import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetBlogs } from "../../src/tools/get-blogs";

vi.mock("../../src/lib/api-client");

describe("get-blogs tool", () => {
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
    registerGetBlogs(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-blogs",
      expect.objectContaining({
        description: expect.stringContaining("Fetch a paginated list of blog posts"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON blog list with mimeType when API call succeeds with default parameters", async () => {
    const mockData = {
      posts: [
        {
          title: "First Post",
          slug: "first-post",
          date: "2024-01-01",
          tags: ["typescript"],
          description: "First post description",
        },
        {
          title: "Second Post",
          slug: "second-post",
          date: "2024-01-02",
          tags: ["testing"],
          description: "Second post description",
        },
      ],
      pagination: {
        page: 1,
        limit: 100,
        totalPosts: 2,
        totalPages: 1,
      },
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      function () {
        return { get: mockGet } as any;
      }
    );

    registerGetBlogs(mockServer, mockEnv);
    const result = await toolHandler({ page: 1, limit: 100 });

    expect(mockGet).toHaveBeenCalledWith("/blogs?page=1&limit=100", expect.any(Object));
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

  it("should return JSON blog list with mimeType with custom pagination parameters", async () => {
    const mockData = {
      posts: [
        {
          title: "Post on Page 2",
          slug: "post-page-2",
          date: "2024-01-03",
          tags: ["vitest"],
          description: "A post on page 2",
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
        totalPosts: 15,
        totalPages: 2,
      },
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      function () {
        return { get: mockGet } as any;
      }
    );

    registerGetBlogs(mockServer, mockEnv);
    const result = await toolHandler({ page: 2, limit: 10 });

    expect(mockGet).toHaveBeenCalledWith("/blogs?page=2&limit=10", expect.any(Object));
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
    vi.mocked(ApiClient).mockImplementation(
      function () {
        return { get: mockGet } as any;
      }
    );

    registerGetBlogs(mockServer, mockEnv);
    const result = await toolHandler({ page: 1, limit: 100 });

    expect(mockGet).toHaveBeenCalledWith("/blogs?page=1&limit=100", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching blogs: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
