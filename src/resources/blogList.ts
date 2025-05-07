import {
  type BlogList,
  type BlogListParams,
  BlogListParamsSchema,
  BlogListSchema,
} from "@/schemas/blog";
import { apiClient, handleResponse } from "@/utils/api";
import type { Resource } from "@modelcontextprotocol/sdk/types.js";

export class BlogListResource implements Resource<BlogListParams, BlogList> {
  readonly name = "blogList";
  readonly description = "Retrieves a paginated list of blog posts";
  readonly paramsSchema = BlogListParamsSchema;
  readonly resultSchema = BlogListSchema;

  async fetch(params: BlogListParams): Promise<BlogList> {
    return handleResponse(
      apiClient
        .get("/blogs", {
          params: {
            page: params.page,
            limit: params.limit,
          },
        })
        .then((response) => response.data),
    );
  }

  getMetadata(params: BlogListParams) {
    return {
      name: `Blog Posts (Page ${params.page})`,
      description: `List of blog posts, page ${params.page} with ${params.limit} items per page`,
      mimeType: "application/json",
    };
  }
}
