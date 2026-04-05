# Me-CP

This is an MCP server with tools and resources to get information about me! It is likely that no one
will ever use this, but I built it as fun little project to gather data from my personal website
[jeremykreutzbender.com](https://jeremykreutzbender.com).

## Tools

- **get-about** — Get personal information including name, email, and website
- **get-cv** — Fetch the complete CV/resume including work experience, projects, skills, and education
- **get-cv-jobs** — Fetch only the work experience/jobs section from the CV
- **get-blogs** — Fetch a paginated list of blog posts (metadata only)
- **get-blog** — Fetch a single blog post by slug, including full markdown content

## Development

```bash
npm install
npm run dev
```

### Scripts

- `npm run dev` — Start the Wrangler dev server
- `npm run deploy` — Deploy to Cloudflare Workers
- `npm run type-check` — Run TypeScript type checking
- `npm run lint:fix` — Run Biome linter with auto-fix
- `npm run format` — Run Biome formatter
- `npm test` — Run tests with Vitest

### Installing the MCP

#### Claude Desktop

Add the following to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "me-cp": {
      "type": "url",
      "url": "http://localhost:8787/mcp"
    }
  }
}
```

#### Claude Code

```bash
claude mcp add me-cp http://localhost:8787/mcp --transport http
```

#### Cursor

Open Cursor Settings > MCP and add a new server:

- **Type**: URL
- **URL**: `http://localhost:8787/mcp`

Or add it to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "me-cp": {
      "type": "url",
      "url": "http://localhost:8787/mcp"
    }
  }
}
```
