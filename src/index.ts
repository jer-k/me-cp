import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Hono } from "hono";

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

export class MeCP extends McpAgent<Env, Record<string, never>, Record<string, unknown>> {
  server = new McpServer({
    name: "Me-CP",
    version: packageJson.version,
  });

  async init() {
    registerGetAbout(this.server, this.env);
    registerGetBlogs(this.server, this.env);
    registerGetBlog(this.server, this.env);
    registerGetBlogsByTag(this.server, this.env);
    registerSearchBlogs(this.server, this.env);
    registerGetCv(this.server, this.env);
    registerGetCvJobs(this.server, this.env);
    registerGetOpenSource(this.server, this.env);
    registerGetSearchStatsSummary(this.server, this.env);
    registerGetSearchStatsTopPages(this.server, this.env);
    registerGetSearchStatsTopQueries(this.server, this.env);
    registerGetSocialLinks(this.server, this.env);
    registerGetTags(this.server, this.env);
  }
}

const app = new Hono<{ Bindings: Env }>();

app.all("/mcp", (c) => MeCP.serve("/mcp").fetch(c.req.raw, c.env, c.executionCtx));

app.notFound((c) => c.text("Not found", 404));

export default app;
