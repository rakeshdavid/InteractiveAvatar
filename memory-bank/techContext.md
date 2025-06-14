# Tech Context

# Tech Context

## Technology Stack

*   **Framework:** Next.js
*   **UI:** React, Tailwind CSS
*   **AI:** OpenAI, HeyGen Streaming Avatar

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

## Development Scripts

*   `dev`: Starts the development server.
*   `build`: Builds the application for production.
*   `start`: Starts the production server.
*   `lint`: Lints the codebase for errors.

## Environment Variables

*   `HEYGEN_API_KEY`: The secret key for the HeyGen Streaming Avatar service. This needs to be set in the Vercel project settings.
*   `OPENAI_API_KEY`: The secret key for the OpenAI API. This also needs to be set in the Vercel project settings.
*   `NEXT_PUBLIC_BASE_API_URL`: The public URL for the HeyGen API. This is a public variable and can be set in the Vercel project settings as well.
