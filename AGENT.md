# AGENT.md - Development Guidelines for HSBB Frontend

## Commands
- **Build**: `npm run build`
- **Dev server**: `npm run dev`
- **Type check**: `npm run check`
- **Lint**: `npm run lint`
- **Format**: `npm run format`
- **Test all**: `npm run test`
- **Unit tests**: `npm run test:unit` (vitest)
- **Integration tests**: `npm run test:integration` (playwright)
- **Single test**: `npx vitest <test-name>` or `npx playwright test <test-name>`

## Code Style
- **Framework**: SvelteKit with TypeScript, TailwindCSS, and DaisyUI
- **Formatting**: Use tabs, single quotes, no trailing commas, 100 char width (Prettier enforced)
- **Types**: TypeScript strict mode enabled, prefer explicit types for parameters
- **Imports**: Use `$lib/` for local imports, quotes for strings in imports
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Error handling**: Use try/catch blocks, return error objects from server functions
- **Comments**: JSDoc style for server functions (`/** @type {import('./$types').PageServerLoad} */`)
- **Files**: `.svelte` for components, `.server.ts` for server-side code, `.ts` for utilities
