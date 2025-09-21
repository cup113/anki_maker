# Anki Maker Development Guidelines

## Build/Lint/Test Commands

**Client (Vue 3 + TypeScript + Vite):**

- `npm run dev` - Start development server
- `npm run build` - Build for production with type checking
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test:unit` - Run Vitest unit tests

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
- kebab-case for file names (Vue components)
- snake_case for Python variables/functions

**Error Handling:**

- TypeScript: try/catch with proper error typing
- Python: FastAPI HTTPException for API errors
- Both: Validate inputs with Pydantic/TypeScript types
