import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetBlog } from "../../src/tools/get-blog";

vi.mock("../../src/lib/api-client");

describe("get-blog tool", () => {
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
    registerGetBlog(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-blog",
      expect.objectContaining({
        title: "Get Blog Post by Slug",
        description: expect.stringContaining("Fetch a single blog post by its slug"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON blog post with mimeType when API call succeeds", async () => {
    const mockData = {
      title: "My Blog Post",
      slug: "my-blog-post",
      date: "2024-01-01",
      tags: ["typescript", "testing"],
      description: "A test blog post",
      content: "# Blog Content\n\nThis is the content.",
      draft: false,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetBlog(mockServer, mockEnv);
    const result = await toolHandler({ slug: "my-blog-post" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/my-blog-post", expect.any(Object));
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
    const mockError = new Error("API request failed: 404 Not Found");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetBlog(mockServer, mockEnv);
    const result = await toolHandler({ slug: "non-existent-post" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/non-existent-post", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching blog post: API request failed: 404 Not Found",
        },
      ],
      isError: true,
    });
  });
});
