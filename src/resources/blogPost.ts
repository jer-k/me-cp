import { Resource } from '@modelcontextprotocol/sdk/server/index.js';
import { BlogPostSchema, BlogPostParamsSchema, type BlogPost, type BlogPostParams } from '@/schemas/blog';
import { apiClient, handleResponse } from '@/utils/api';

export class BlogPostResource implements Resource<BlogPostParams, BlogPost> {
  readonly name = 'blogPost';
  readonly description = 'Retrieves a specific blog post by its slug';
  readonly paramsSchema = BlogPostParamsSchema;
  readonly resultSchema = BlogPostSchema;

  async fetch(params: BlogPostParams): Promise<BlogPost> {
    // Make API request to fetch blog post
    return handleResponse(
      apiClient
        .get(`/blogs/${params.slug}`)
        .then((response) => response.data)
    );
  }

  getMetadata(params: BlogPostParams) {
    return {
      name: `Blog Post: ${params.slug}`,
      description: `Content of blog post with slug "${params.slug}"`,
      mimeType: 'application/json',
    };
  }
}