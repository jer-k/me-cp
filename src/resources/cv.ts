import { Resource } from '@modelcontextprotocol/sdk/server/index.js';
import { CVSchema, type CV } from '@/schemas/cv';
import { apiClient, handleResponse } from '@/utils/api';

export class CVResource implements Resource<void, CV> {
  readonly name = 'cv';
  readonly description = 'Retrieves the complete CV/resume information';
  readonly paramsSchema = null;
  readonly resultSchema = CVSchema;

  async fetch(): Promise<CV> {
    return handleResponse(
      apiClient
        .get('/cv')
        .then((response) => response.data)
    );
  }

  getMetadata() {
    return {
      name: 'Complete CV',
      description: 'Full curriculum vitae including personal info, experience, education, and skills',
      mimeType: 'application/json',
    };
  }
}