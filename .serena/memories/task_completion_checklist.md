# Task Completion Checklist

## Before Marking Task Complete
1. **Run Linter**: `npm run lint` - Ensure no linting errors
2. **Test Locally**: Start dev server and test functionality
3. **Test API Endpoints**: Use curl or browser to verify API responses
4. **Check TypeScript**: Ensure no type errors in the editor
5. **Verify No Breaking Changes**: Test existing features still work

## API Development Checklist
1. Add proper error handling
2. Include status codes in responses
3. Transform API responses (knowledge_base → prompt)
4. Add request validation
5. Test with missing/invalid parameters

## Git Workflow
1. Review changes with `git status` and `git diff`
2. Stage relevant files only
3. Write descriptive commit messages
4. Never commit `.env` or sensitive data
5. Push to feature branch if working on PR

## Documentation
1. Update type definitions if data structures change
2. Add JSDoc comments for complex functions
3. Update `.env.example` if new env vars added