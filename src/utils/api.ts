import { env } from "@/config/environment";
import axios from "axios";

// Create an axios instance with base configuration
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handling utility
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Response handler utility
export async function handleResponse<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new APIError(
        error.message,
        error.response?.status || 500,
        error.code || "UNKNOWN_ERROR",
      );
    }
    throw error;
  }
}
