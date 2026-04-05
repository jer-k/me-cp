import { z } from "zod";

// Schema for a single blog post (without content)
export const BlogPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(),
  updated: z.string().optional(),
  tags: z.array(z.string()),
  description: z.string(),
  href: z.string().optional(),
});

// Schema for a full blog post (with content)
export const BlogPostWithContentSchema = BlogPostSchema.extend({
  content: z.string(),
  draft: z.boolean(),
});

// Schema for paginated blogs response
export const BlogsResponseSchema = z.object({
  posts: z.array(BlogPostSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalPosts: z.number(),
    totalPages: z.number(),
  }),
});

// Schema for blogs by tag response
export const BlogsByTagResponseSchema = z.object({
  tag: z.string(),
  posts: z.array(BlogPostSchema),
  total: z.number(),
});

// Schema for blog search response
export const BlogSearchResponseSchema = z.object({
  query: z.string(),
  posts: z.array(BlogPostSchema),
  total: z.number(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogPostWithContent = z.infer<typeof BlogPostWithContentSchema>;
export type BlogsResponse = z.infer<typeof BlogsResponseSchema>;
export type BlogsByTagResponse = z.infer<typeof BlogsByTagResponseSchema>;
export type BlogSearchResponse = z.infer<typeof BlogSearchResponseSchema>;
