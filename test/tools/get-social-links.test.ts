import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetSocialLinks } from "../../src/tools/get-social-links";

vi.mock("../../src/lib/api-client");

describe("get-social-links tool", () => {
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
    registerGetSocialLinks(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-social-links",
      expect.objectContaining({
        title: "Get Social Media Links",
        description: expect.stringContaining("social media links"),
      }),
      expect.any(Function)
    );
  });

  it("should return JSON social links data when API call succeeds", async () => {
    const mockData = {
      github: {
        profile: "https://github.com/jer-k",
        repo: "https://github.com/jer-k/jeremykreutzbender.com",
      },
      twitter: "https://twitter.com/J_Kreutzbender",
      linkedin: "https://www.linkedin.com/in/jeremykreutzbender/",
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(function () {
      return { get: mockGet } as any;
    });

    registerGetSocialLinks(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/social-links", expect.any(Object));
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

    registerGetSocialLinks(mockServer, mockEnv);
    const result = await toolHandler();

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching social links: API request failed: 500 Internal Server Error",
        },
      ],
      isError: true,
    });
  });
});
