# Custom Registry Setup Guide

This guide documents the custom registries configured for this shadcn/ui project.

## Configured Registries

### Magic UI Registry (@magic)
- **URL**: https://magicui.design/r/{name}.json
- **Description**: 150+ free and open-source animated components built with React, TypeScript, Tailwind CSS, and Framer Motion
- **Status**: ✅ Working
- **Features**: Animated components, motion effects, advanced UI patterns

### Origin UI Registry (@originui) 
- **URL**: https://originui.com/r/{name}.json
- **Description**: Extensive collection of copy-and-paste components for quickly building app UIs
- **Status**: ✅ Working  
- **Features**: Beautiful UI components built with Tailwind CSS and React

### BaseCN Registry (@basecn)
- **URL**: https://basecn.dev/r/{name}.json
- **Description**: shadcn/ui compatible components using Base UI primitives
- **Status**: ✅ Working
- **Features**: Accessible components with Base UI integration

### Registry Configuration

The registries are configured in `components.json`:

```json
{
  "registries": {
    "@magic": "https://magicui.design/r/{name}.json",
    "@originui": "https://originui.com/r/{name}.json", 
    "@basecn": "https://basecn.dev/r/{name}.json"
  }
}
```

## Installation Methods

### 1. Namespaced Installation (Recommended)
Use the registry namespace to install components:

```bash
# Install from Magic UI registry
npx shadcn@latest add @magic/globe
npx shadcn@latest add @magic/marquee

# Install from Origin UI registry
npx shadcn@latest add @originui/button  
npx shadcn@latest add @originui/card

# Install from BaseCN registry
npx shadcn@latest add @basecn/input
npx shadcn@latest add @basecn/button
```

### 2. Direct URL Installation
Install components using their direct registry URLs:

```bash
# Install from Magic UI with direct URL
npx shadcn@latest add "https://magicui.design/r/globe.json"
npx shadcn@latest add "https://magicui.design/r/marquee.json"

# Install from Origin UI with direct URL
npx shadcn@latest add "https://originui.com/r/button.json"

# Install from BaseCN with direct URL  
npx shadcn@latest add "https://basecn.dev/r/input.json"
```

## Available Components

### Magic UI Components (Verified Working)
- `globe` - Interactive 3D globe with WebGL
- `marquee` - Scrolling text animation component
- Many more available at https://magicui.design/

### Origin UI Components (Verified Working)
- `button` - Enhanced button component with Origin UI styling
- `card` - Styled card components
- Many more available at https://originui.com/

### BaseCN Components (Verified Working)
- `input` - Accessible input component with Base UI
- `button` - Button component with Base UI primitives
- Many more available at https://basecn.dev/

### Component Installation Examples

```bash
# Install animated globe component from Magic UI
npx shadcn@latest add @magic/globe

# Install marquee animation component from Magic UI
npx shadcn@latest add @magic/marquee

# Install button component from Origin UI  
npx shadcn@latest add @originui/button

# Install input component from BaseCN
npx shadcn@latest add @basecn/input

# Install multiple components at once from different registries
npx shadcn@latest add @magic/globe @originui/button @basecn/input
```

## Registry Research Notes

### Working Registries
1. **Magic UI** - Fully functional with namespaced and direct URL installation
2. **Origin UI** - Comprehensive component library with enhanced styling  
3. **BaseCN** - Base UI primitives integrated with shadcn/ui
4. **Official shadcn** - Default registry (always available)

### Registries Investigated (Not Currently Configured)
1. **Aceternity UI** - Registry endpoints return 404 errors
2. **Motion Primitives** - Registry endpoints return 404 errors
3. **Kokonut UI** - Registry endpoints return 404 errors  
4. **UI.pub** - Registry endpoint structure unclear
5. **Neobrutalism.dev** - Uses CLI-specific installation methods

## Troubleshooting

### Common Issues

1. **Component not found error**
   - Verify the component name exists in the registry
   - Check the registry URL is accessible
   - Use direct URL installation as fallback

2. **Registry configuration error**
   - Ensure `components.json` is valid JSON
   - Verify all required fields are present
   - Check CSS and config paths are correct

### Registry Testing Commands

```bash
# Test registry endpoint
curl "https://magicui.design/r/globe.json"

# Validate components.json
cat components.json | jq .

# Install basic shadcn component (fallback test)
npx shadcn@latest add button
```

## Future Registry Additions

To add new registries:

1. Research the registry's endpoint structure
2. Test component installation with direct URLs
3. Add to `components.json` registries section  
4. Test namespaced installation
5. Update this documentation

### Additional Registries Available (From Official List)
The following registries are available from the official shadcn registry list but not yet tested:
- `@clerk` - Clerk authentication components
- `@blocks` - UI blocks and patterns
- `@animate-ui` - Animation-focused components
- `@tailark` - Tailwind-based components
- `@react-bits` - React component bits  

These can be added following the same process used for the current registries.

## Dependencies

Components from external registries may include additional dependencies:
- Magic UI components often require `cobe`, `motion`, and other animation libraries
- Origin UI components may include enhanced styling and additional utilities
- BaseCN components require Base UI primitives and class-variance-authority
- Dependencies are automatically installed during component installation

## File Structure

Custom registry components are installed in organized directories:
```
components/
├── ui/           # Standard shadcn + Origin UI + BaseCN components
│   ├── button.tsx
│   ├── input.tsx
│   └── dialog.tsx
└── magicui/      # Magic UI registry components  
    ├── globe.tsx
    └── marquee.tsx
```

---

*Last updated: September 2025*
*Registry setup completed successfully with Magic UI, Origin UI, and BaseCN integration*