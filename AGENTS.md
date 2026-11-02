# Anki Maker Development Guidelines

## Build/Lint/Test Commands

**Client (Vue 3 + TypeScript + Vite):**

Run from `client/`. The package manager is pnpm 11; the build-script allow-list lives in
`client/pnpm-workspace.yaml` (`allowBuilds`), not in `package.json`.

- `pnpm dev` - Start development server
- `pnpm build` - Build for production with type checking
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm test:unit` - Run Vitest unit tests

**Server (Python FastAPI):**

- `uvicorn server.main:app --reload` - Start development server
- No built-in lint/test commands - use external tools

## Code Style Guidelines

**TypeScript/Vue:**

- Use TypeScript strict mode with Vue 3 Composition API
- Single quotes, no semicolons, 2-space indentation
- Prettier: 100 char printWidth, singleQuote true
- ESLint with Vue/TypeScript recommended configs
- Import order: external libs first, then internal modules

**Python:**

- Use Pydantic models for data validation
- Type hints with Literal types where appropriate
- FastAPI dependency injection patterns
- Standard library imports first, then third-party

**Naming Conventions:**

- camelCase for variables/functions (TypeScript)
- PascalCase for components/classes (both languages)
- PascalCase for file names (Vue components)
- snake_case for Python variables/functions

**Error Handling:**

- TypeScript: try/catch with proper error typing
- Python: FastAPI HTTPException for API errors
- Both: Validate inputs with Pydantic/TypeScript types
