# Agent Guidelines for me-cp

## Build/Lint/Test Commands
- **Dev server**: `npm run dev` or `npm start` (Wrangler dev server)
- **Deploy**: `npm run deploy` (Cloudflare Workers deployment)
- **Type check**: `npm run type-check` (TypeScript check without emit)
- **Format**: `npm run format` (Biome formatter)
- **Lint**: `npm run lint:fix` (Biome linter with auto-fix)
- **Generate types**: `npm run cf-typegen` (Cloudflare Workers types)

## Code Style Guidelines
- **Formatting**: 2-space indentation, 100 char line width, double quotes, always semicolons, ES5 trailing commas
- **Imports**: Auto-organize imports (Biome). Use absolute imports from package names
- **Types**: TypeScript strict mode enabled. Use Zod schemas for validation (see src/schemas/)
- **Naming**: camelCase for variables/functions, PascalCase for classes/types/schemas
- **Error handling**: Use proper error responses with status codes
- **Architecture**: Cloudflare Workers + Hono + MCP Server + Durable Objects
- **Schemas**: Define Zod schemas in src/schemas/, export types with z.infer
- **Tools**: MCP tools in src/tools/, register in MeCP class init()
- **Run checks before commit**: Always run `npm run type-check` and `npm run lint:fix`
