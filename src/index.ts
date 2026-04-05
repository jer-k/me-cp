import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Hono } from "hono";

import packageJson from "../package.json";
import { registerGetAbout } from "./tools/get-about";
import { registerGetBlog } from "./tools/get-blog";
import { registerGetBlogs } from "./tools/get-blogs";
import { registerGetCv } from "./tools/get-cv";
import { registerGetCvJobs } from "./tools/get-cv-jobs";

export class MeCP extends McpAgent<Env, Record<string, never>, Record<string, unknown>> {
  server = new McpServer({
    name: "Me-CP",
    version: packageJson.version,
  });

  async init() {
    registerGetAbout(this.server, this.env);
    registerGetBlogs(this.server, this.env);
    registerGetBlog(this.server, this.env);
    registerGetCv(this.server, this.env);
    registerGetCvJobs(this.server, this.env);
  }
}

const app = new Hono<{ Bindings: Env }>();

app.all("/mcp", (c) => MeCP.serve("/mcp").fetch(c.req.raw, c.env, c.executionCtx));

app.notFound((c) => c.text("Not found", 404));

export default app;
