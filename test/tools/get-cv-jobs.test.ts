import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClient } from "../../src/lib/api-client";
import { registerGetCvJobs } from "../../src/tools/get-cv-jobs";

vi.mock("../../src/lib/api-client");

describe("get-cv-jobs tool", () => {
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
    registerGetCvJobs(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-cv-jobs",
      {
        description: expect.stringContaining("Fetch only the work experience/jobs section"),
      },
      expect.any(Function)
    );
  });

  it("should return JSON jobs list with mimeType when API call succeeds", async () => {
    const mockData = [
      {
        companyName: "Acme Corp",
        companyUrl: "https://acme.com",
        workType: "Remote" as const,
        duration: "Jan 2020 - Present",
        title: "Senior Software Engineer",
        descriptionMarkdown: "## Responsibilities\n\n- Built features\n- Fixed bugs",
      },
      {
        companyName: "Tech Startup",
        workType: "On-Site" as const,
        duration: "Jan 2018 - Dec 2019",
        title: "Software Engineer",
        descriptionMarkdown: "## Responsibilities\n\n- Developed applications",
      },
    ];

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetCvJobs(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/cv/jobs", expect.any(Object));
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
    const mockError = new Error("API request failed: 403 Forbidden");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetCvJobs(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/cv/jobs", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching CV jobs: API request failed: 403 Forbidden",
        },
      ],
      isError: true,
    });
  });
});
