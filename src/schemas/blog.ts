import { z } from 'zod';

// Schema for blog post parameters
export const BlogPostParamsSchema = z.object({
  slug: z.string().describe('The unique slug identifier for the blog post'),
});

// Schema for blog post content
export const BlogPostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  date: z.string().datetime(),
});

// Schema for blog list parameters (pagination)
export const BlogListParamsSchema = z.object({
  page: z.number().int().min(1).default(1).describe('Page number'),
  limit: z.number().int().min(1).max(50).default(10).describe('Items per page'),
});

// Schema for paginated blog list response
export const BlogListSchema = z.object({
  items: z.array(BlogPostSchema),
  total: z.number().int(),
  page: z.number().int(),
  totalPages: z.number().int(),
});

// Type definitions
export type BlogPostParams = z.infer<typeof BlogPostParamsSchema>;
export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogListParams = z.infer<typeof BlogListParamsSchema>;
export type BlogList = z.infer<typeof BlogListSchema>;