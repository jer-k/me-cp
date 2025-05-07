import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import all resources
import { BlogPostResource } from '@/resources/blogPost';
import { BlogListResource } from '@/resources/blogList';
import { CVResource } from '@/resources/cv';
import { JobsResource } from '@/resources/jobs';

// Initialize the server with metadata
const server = new Server(
  {
    name: 'me-cp-server',
    version: '1.0.0',
    description: 'MCP server providing access to personal information, blog posts, and CV data',
  },
  {
    capabilities: {
      resources: {
        // Blog-related resources
        blogPost: new BlogPostResource(),
        blogList: new BlogListResource(),
        
        // CV-related resources
        cv: new CVResource(),
        jobs: new JobsResource(),
      },
      // We'll implement tools later
      tools: {},
    },
  },
);

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server with stdio transport
const transport = new StdioServerTransport();
server.listen(transport);