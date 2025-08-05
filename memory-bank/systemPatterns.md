# System Patterns

## Configuration Management Pattern

### Constants-Based Configuration
The application uses a centralized constants file (`app/lib/constants.ts`) for managing selectable options:

*   **AVATARS array** - Available avatar options with `avatar_id`, `name`, `image`, and optional badge flags (`isNew`, `isPopular`)
*   **KNOWLEDGE_BASES array** - Available knowledge contexts with `id`, `name`, and `description`
*   **STT_LANGUAGE_LIST array** - Supported languages for speech-to-text

### Selection UI Pattern
For user-selectable options, the app follows a consistent pattern:

1. **useMemo hook** to find selected item from array
2. **Select component** with standardized props:
   - `isSelected` - function to identify current selection
   - `options` - array of available options
   - `renderOption` - function to display option names
   - `value` - currently selected display value
   - `onSelect` - callback to handle selection changes

### Example Implementation
```typescript
const selectedKnowledgeBase = useMemo(() => {
  const knowledgeBase = KNOWLEDGE_BASES.find(kb => kb.id === config.knowledgeId);
  return knowledgeBase || KNOWLEDGE_BASES[0];
}, [config.knowledgeId]);

<Select
  isSelected={(option) => option.id === selectedKnowledgeBase.id}
  options={KNOWLEDGE_BASES}
  renderOption={(option) => option.name}
  value={selectedKnowledgeBase.name}
  onSelect={(option) => onChange("knowledgeId", option.id)}
/>
```

## State Management Pattern

### Configuration State
*   **StartAvatarRequest** object holds all avatar configuration
*   **useState** for local config state in InteractiveAvatar component
*   **Props drilling** to pass config and onChange handlers to AvatarConfig

### Custom Hooks Architecture
*   **useStreamingAvatarSession** - Core avatar session management
*   **useVoiceChat** - Voice interaction handling
*   **useMessageHistory** - Conversation tracking
*   **Component-specific hooks** for focused functionality

## Avatar Gallery Pattern

### Enhanced Visual Selection with 3D Interactive Effects
*   **AvatarGallery component** - Grid-based visual avatar selection with advanced interactions
*   **3D Tilt System** - Framer-motion based perspective transforms following mouse movement
*   **Dynamic Spotlight** - Mouse-tracking gradient spotlight for premium feel
*   **Dynamic sorting** - NEW badges first, then POPULAR, then regular avatars
*   **Corner badge system** - Extensible badge rendering with proper z-indexing for effects
*   **Responsive grid** - 4-column layout adapting to container width

### Badge Implementation
```typescript
// Avatar with badge flags
{
  avatar_id: "SilasHR_public",
  name: "Silas", 
  image: "/avatars/Silas.jpg",
  isNew: true
}

// Sorting logic prioritizes badges
const sortedAvatars = [...AVATARS].sort((a, b) => {
  if (a.isNew && !b.isNew) return -1;
  if (a.isPopular && !b.isPopular) return -1;
  return 0;
});
```

## Interactive UI Components Pattern

### 3D Tilt Component Architecture
*   **Framer Motion Integration** - useMotionValue, useSpring, useTransform for smooth animations
*   **Mouse Event Handling** - Direct binding to component with proper cleanup
*   **Spring Configuration** - Optimized settings (stiffness: 26.7, damping: 4.1, mass: 0.2)
*   **Transform Template** - perspective(1000px) with rotateX/rotateY based on mouse position

### Spotlight Effect Pattern
*   **Parent Element Detection** - Automatic positioning relative to parent container
*   **Mouse Tracking** - Real-time position updates with spring animations
*   **Opacity Management** - Hover state-based visibility with smooth transitions
*   **CSS Integration** - Tailwind gradient with blur effects

### Implementation Example
```typescript
<Tilt
  rotationFactor={8}
  springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
  onClick={() => onAvatarSelect(avatar.avatar_id)}
>
  <Spotlight
    size={200}
    className="z-10 from-white/50 via-white/20 to-white/10 blur-2xl"
  />
  {/* Content */}
</Tilt>
```

## API Integration Pattern

### Environment-Based Configuration
*   **Server-side API routes** for secure token generation
*   **Environment variables** for API credentials (`HEYGEN_API_KEY`)
*   **Public environment variables** for client-side URLs (`NEXT_PUBLIC_BASE_API_URL`)

## Development Workflow Pattern

### GitHub Strategy Implementation
*   **Feature Branch Workflow** - Development on feature branches with descriptive names
*   **Comprehensive Pull Requests** - Detailed PR descriptions with technical impact analysis
*   **Squash Merge Strategy** - Clean commit history maintenance through squash merging
*   **Professional Documentation** - README updates and memory bank synchronization

### Deployment Pipeline
*   **Dependency Management** - pnpm lockfile synchronization for consistent builds
*   **Build Verification** - Local build testing before deployment
*   **Environment Variables** - Production configuration through hosting platform settings
*   **Automated Deployment** - Vercel integration with GitHub for continuous deployment
