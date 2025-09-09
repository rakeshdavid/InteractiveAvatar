# Suggested Commands

## Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Testing API Endpoints
- Use curl or Postman to test API routes
- Example: `curl -X GET http://localhost:3000/api/prompts/list`

## Git Commands
- `git status` - Check current changes
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit changes
- `git push origin main` - Push to remote

## System Commands (macOS)
- `ls -la` - List files with details
- `find . -name "*.ts"` - Find TypeScript files
- `grep -r "pattern" .` - Search for pattern in files
- `open .` - Open folder in Finder

## Environment Setup
- Copy `.env.example` to `.env.local`
- Set HEYGEN_API_KEY in environment
- Set NEXT_PUBLIC_BASE_API_URL (defaults to https://api.heygen.com)