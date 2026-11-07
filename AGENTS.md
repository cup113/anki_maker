# Anki Maker Development Guidelines

## Build/Lint/Test Commands

**Client (SvelteKit 2 + Svelte 5 + TypeScript):**

The repo is a pnpm workspace; run everything from the repository root. The build-script
allow-list lives in `pnpm-workspace.yaml` (`allowBuilds`), not in `package.json`.

- `pnpm dev` - Start the dev server on 4133 (proxies `/api` and `/mcp` to 4134)
- `pnpm build` - Build the adapter-node output in `client/build`
- `pnpm check` - `svelte-kit sync` + `svelte-check` (types and a11y)
- `pnpm lint` - ESLint (typescript-eslint + eslint-plugin-svelte)
- `pnpm format` - Prettier with the Svelte plugin; `pnpm format:check` verifies without writing
- `pnpm test:unit` - Vitest (pure modules; no component tests yet)

**Server (Python FastAPI):**

- `uvicorn server.main:app --port 4134 --reload` - Start development server
- No built-in lint/test commands - use external tools

## Code Style Guidelines

**TypeScript/Svelte:**

- TypeScript strict mode; Svelte 5 runes (`$state`, `$derived`, `$props`, `$bindable`)
- Components are `.svelte` files under `src/lib/components`; shared reactive state lives in
  `.svelte.ts` modules under `src/lib/stores` (never `$effect` outside components)
- Keep the domain model as plain objects in `src/lib/model.ts`: `$state` proxies plain objects
  deeply, class instances would silently lose reactivity
- Untrusted JSON — localStorage, imported files, AI replies — decodes through `model.from_json`.
  It never throws and never drops records; dropping blank cards is a caller's own policy
- Storage keys, the index and the legacy migration live in `src/lib/storage.ts`; the store
  composes on it rather than touching `localStorage` itself
- Single quotes, no semicolons, 2-space indentation, 100 char print width
- Import order: external libs first, then `$lib` internal modules
- Render only after hydration when the source is `localStorage`; otherwise SSR and the first
  client render disagree

**Python:**

- Use Pydantic models for data validation
- Generated files go through `server/export.py`: it owns the output directory, the naming and the
  download lookup, so no route or tool resolves a path on its own
- Type hints with Literal types where appropriate
- FastAPI dependency injection patterns
- Standard library imports first, then third-party

**Naming Conventions:**

- snake_case for TypeScript functions and variables (`save_document`, `from_json`), matching the
  rest of the codebase — not camelCase
- PascalCase for components (Svelte files)
- snake_case for Python variables/functions

**Error Handling:**

- TypeScript: try/catch with proper error typing
- Python: FastAPI HTTPException for API errors
- Both: Validate inputs with Pydantic/TypeScript types
