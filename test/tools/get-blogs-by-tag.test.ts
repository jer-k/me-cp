import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetBlogsByTag } from "../../src/tools/get-blogs-by-tag";

vi.mock("../../src/lib/api-client");

describe("get-blogs-by-tag tool", () => {
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
    registerGetBlogsByTag(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-blogs-by-tag",
      expect.objectContaining({
        description: expect.stringContaining("filtered by a specific tag"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON blog data when API call succeeds", async () => {
    const mockData = {
      tag: "typescript",
      posts: [
        {
          title: "TypeScript Tips",
          slug: "typescript-tips",
          date: "2024-01-01",
          tags: ["typescript"],
          description: "Tips for TypeScript",
        },
      ],
      total: 1,
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetBlogsByTag(mockServer, mockEnv);
    const result = await toolHandler({ tag: "typescript" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/by-tag/typescript", expect.any(Object));
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

  it("should URL-encode the tag parameter", async () => {
    const mockData = { tag: "ruby on rails", posts: [], total: 0 };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetBlogsByTag(mockServer, mockEnv);
    await toolHandler({ tag: "ruby on rails" });

    expect(mockGet).toHaveBeenCalledWith("/blogs/by-tag/ruby%20on%20rails", expect.any(Object));
  });

  it("should return error response when API call fails", async () => {
    const mockError = new Error("API request failed: 500 Internal Server Error");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetBlogsByTag(mockServer, mockEnv);
    const result = await toolHandler({ tag: "typescript" });

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching blogs by tag: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
