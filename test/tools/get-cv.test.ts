import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerGetCv } from "../../src/tools/get-cv";
import { ApiClient } from "../../src/lib/api-client";

vi.mock("../../src/lib/api-client");

describe("get-cv tool", () => {
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
    registerGetCv(mockServer, mockEnv);

    expect(mockServer.registerTool).toHaveBeenCalledWith(
      "get-cv",
      {
        description: expect.stringContaining("Fetch Jeremy Kreutzbender's complete CV/resume"),
      },
      expect.any(Function)
    );
  });

  it("should return JSON CV data with mimeType when API call succeeds", async () => {
    const mockData = {
      personalInfo: {
        name: "Jeremy Kreutzbender",
        location: "San Francisco, CA",
        locationUrl: "https://maps.google.com",
        avatarUrl: "https://example.com/avatar.jpg",
        avatarFallback: "JK",
      },
      about: {
        summary: "Experienced software engineer with expertise in TypeScript and testing.",
      },
      jobs: [
        {
          companyName: "Acme Corp",
          companyUrl: "https://acme.com",
          workType: "Remote" as const,
          duration: "Jan 2020 - Present",
          title: "Senior Software Engineer",
          descriptionMarkdown: "## Responsibilities\n\n- Built features\n- Fixed bugs",
        },
      ],
      projects: [
        {
          name: "Open Source Project",
          url: "https://github.com/example/project",
          descriptionMarkdown: "A cool open source project",
        },
      ],
      skills: {
        languages: ["TypeScript", "JavaScript", "Python"],
        technologies: ["React", "Node.js", "Vitest"],
      },
      schools: [
        {
          institutionName: "University of Example",
          institutionUrl: "https://university.edu",
          location: "Example City",
          locationUrl: "https://maps.google.com",
          duration: "2010 - 2014",
          degree: "Bachelor of Science in Computer Science",
        },
      ],
    };

    const mockGet = vi.fn().mockResolvedValue(mockData);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetCv(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/cv", expect.any(Object));
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
    const mockError = new Error("API request failed: 401 Unauthorized");

    const mockGet = vi.fn().mockRejectedValue(mockError);
    vi.mocked(ApiClient).mockImplementation(
      () =>
        ({
          get: mockGet,
        }) as any
    );

    registerGetCv(mockServer, mockEnv);
    const result = await toolHandler();

    expect(mockGet).toHaveBeenCalledWith("/cv", expect.any(Object));
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "Error fetching CV: API request failed: 401 Unauthorized",
        },
      ],
      isError: true,
    });
  });
});
