# Tech Context

## Technology Stack

*   **Framework:** Next.js 14
*   **UI:** React 18, Tailwind CSS
*   **Animations:** Framer Motion (3D tilt, spotlight effects)
*   **AI:** OpenAI, HeyGen Streaming Avatar SDK
*   **Components:** Enhanced avatar gallery with 3D interactive effects, badge system, responsive grid layouts

## Dependencies

*   `@heygen/streaming-avatar`: For the interactive avatar functionality.
*   `@radix-ui/react-select`: For custom select components.
*   `@radix-ui/react-switch`: For switch components.
*   `@radix-ui/react-toggle-group`: For toggle group components.
*   `ahooks`: A collection of React Hooks.
*   `next`: The core Next.js framework.
*   `openai`: For interacting with the OpenAI API.
*   `react`: The core React library.
*   `react-dom`: For rendering React components in the browser.
*   `framer-motion`: Animation library for 3D tilt and smooth transitions.
*   `clsx`: Utility for conditional className construction.
*   `tailwind-merge`: Utility for merging Tailwind CSS classes efficiently.

## Development Scripts

*   `dev`: Starts the development server.
*   `build`: Builds the application for production.
*   `start`: Starts the production server.
*   `lint`: Lints the codebase for errors.

## Environment Variables

*   `HEYGEN_API_KEY`: The secret key for the HeyGen Streaming Avatar service. This needs to be set in the Vercel project settings.
*   `OPENAI_API_KEY`: The secret key for the OpenAI API. This also needs to be set in the Vercel project settings.
*   `NEXT_PUBLIC_BASE_API_URL`: The public URL for the HeyGen API. This is a public variable and can be set in the Vercel project settings as well.

## Development Workflow

### GitHub Strategy
*   **Feature Branch Development** - `feature/enhanced-avatar-gallery` branch for organized development
*   **Pull Request Management** - [PR #1](https://github.com/rakeshdavid/InteractiveAvatar/pull/1) with comprehensive documentation
*   **Squash Merge Strategy** - Clean commit history with detailed commit messages
*   **Professional Documentation** - README updates with Rivalista branding and streamlined content

### Deployment Pipeline
*   **Dependency Management** - pnpm lockfile synchronization resolved for consistent builds
*   **Vercel Integration** - Automatic deployment triggers from main branch commits
*   **Build Verification** - Local build testing confirms production readiness
*   **Environment Configuration** - Production variables configured through Vercel dashboard
