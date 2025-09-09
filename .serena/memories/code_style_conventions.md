# Code Style and Conventions

## TypeScript Conventions
- Use TypeScript for all new files
- Define interfaces for all data structures
- Use type-safe API responses

## File Structure
- API routes in `app/api/[feature]/[action]/route.ts`
- Components in `components/` directory
- Types in `app/types/` directory
- Utilities in `app/lib/` directory
- Constants in `app/lib/constants.ts`

## Naming Conventions
- **Files**: kebab-case (e.g., `prompt-utils.ts`)
- **Components**: PascalCase (e.g., `PromptsManager.tsx`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase with descriptive names

## API Route Patterns
- Use Next.js App Router conventions
- Export named functions for HTTP methods (GET, POST, etc.)
- Return Response objects with proper status codes
- Handle errors with try-catch blocks
- Log errors to console for debugging

## Important Terminology Rules
- **Frontend/UI**: Use "Prompts" (user-facing)
- **Backend/API**: Use "knowledge_base" (HeyGen API naming)
- **Variables**: Use `prompt` for UI, `knowledgeBase` for API calls