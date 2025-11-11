import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";
import { ApiClient } from "../../src/lib/api-client";

describe("ApiClient", () => {
  let apiClient: ApiClient;
  const baseUrl = "https://api.example.com";
  const apiKey = "test-api-key";

  beforeEach(() => {
    apiClient = new ApiClient(baseUrl, apiKey);
    vi.clearAllMocks();
  });

  describe("get", () => {
    const testSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    it("should successfully fetch and parse data when request succeeds", async () => {
      const mockData = { id: 1, name: "Test User" };
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockData),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await apiClient.get("/users/1", testSchema);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/users/1`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
      expect(mockResponse.json).toHaveBeenCalledOnce();
    });

    it("should throw an error when the API request fails", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(apiClient.get("/users/999", testSchema)).rejects.toThrow(
        "API request failed: 404 Not Found",
      );

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/users/999`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
      });
    });
  });
});
