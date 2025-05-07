import type { Resource } from "@modelcontextprotocol/sdk/server/index.js";
import { JobsListSchema, type JobsList } from "@/schemas/cv";
import { apiClient, handleResponse } from "@/utils/api";

export class JobsResource implements Resource<void, JobsList> {
  readonly name = "jobs";
  readonly description = "Retrieves the work experience section of the CV";
  readonly paramsSchema = null;
  readonly resultSchema = JobsListSchema;

  async fetch(): Promise<JobsList> {
    return handleResponse(
      apiClient.get("/cv/jobs").then((response) => response.data),
    );
  }

  getMetadata() {
    return {
      name: "Work Experience",
      description: "List of professional work experiences from the CV",
      mimeType: "application/json",
    };
  }
}
