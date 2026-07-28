import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";

import packageJson from "../package.json";
import { registerGetAbout } from "./tools/get-about";
import { registerGetBlog } from "./tools/get-blog";
import { registerGetBlogs } from "./tools/get-blogs";
import { registerGetBlogsByTag } from "./tools/get-blogs-by-tag";
import { registerGetCv } from "./tools/get-cv";
import { registerGetCvJobs } from "./tools/get-cv-jobs";
import { registerGetOpenSource } from "./tools/get-open-source";
import { registerGetSearchStatsSummary } from "./tools/get-search-stats-summary";
import { registerGetSearchStatsTopPages } from "./tools/get-search-stats-top-pages";
import { registerGetSearchStatsTopQueries } from "./tools/get-search-stats-top-queries";
import { registerGetSocialLinks } from "./tools/get-social-links";
import { registerGetTags } from "./tools/get-tags";
import { registerSearchBlogs } from "./tools/search-blogs";
import { registerSendContactEmail } from "./tools/send-contact-email";

function createServer(env: Env) {
  const server = new McpServer({
    name: "Me-CP",
    version: packageJson.version,
  });

  registerGetAbout(server, env);
  registerGetBlogs(server, env);
  registerGetBlog(server, env);
  registerGetBlogsByTag(server, env);
  registerSearchBlogs(server, env);
  registerGetCv(server, env);
  registerGetCvJobs(server, env);
  registerGetOpenSource(server, env);
  registerGetSearchStatsSummary(server, env);
  registerGetSearchStatsTopPages(server, env);
  registerGetSearchStatsTopQueries(server, env);
  registerGetSocialLinks(server, env);
  registerGetTags(server, env);
  registerSendContactEmail(server, env);

  return server;
}

export default {
  fetch(request, env, ctx) {
    return createMcpHandler(() => createServer(env), {
      legacy: "reject",
      route: "/mcp",
    })(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
