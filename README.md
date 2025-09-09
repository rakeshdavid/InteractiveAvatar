# Maslow AI Interactive Avatar Playground

![Maslow AI Interactive Avatar Playground Screenshot](./public/demo.png)

A modern, interactive AI avatar playground built with Next.js that provides real-time conversation experiences with customizable AI personalities. Features comprehensive prompts management, multiple avatar selection, and seamless white-label branding.

## ✨ Key Features

- **Interactive AI Avatars**: Real-time conversation with lifelike AI avatars
- **Prompts Management**: Full CRUD operations for managing conversation prompts
- **Multiple Avatars**: Choose from a variety of avatar personalities and voices
- **White-Label Ready**: Complete Maslow AI branding with centralized error messaging
- **Modern UI**: Responsive design with optimized container layouts
- **Production Ready**: Comprehensive testing suite and error handling

## 🚀 Getting Started

1. **Environment Setup**: Copy `.env.example` to `.env` and add your Maslow AI API key:
   ```bash
   HEYGEN_API_KEY=your_maslow_ai_api_key_here
   ```

2. **Install Dependencies**: 
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Test AI Avatar**: Click the "Test AI Avatar" button to start your interactive session

## 🎯 Using the Avatar Playground

To start your session with an Interactive Avatar, click the "Test AI Avatar" button. 

If you want to see a different Avatar, try a different voice, or switch Knowledge Bases, you can close the session and change the settings in the configuration panel, then start the session again.

## 🧠 Knowledge Base Management

The application features a comprehensive prompts management system with multiple pre-configured Knowledge Bases:

- **Trashtalking Therapist** - A sassy therapeutic assistant that provides helpful advice with attitude
- **Trash Talking Santa** - A festive Santa with a mischievous personality and playful banter
- **Custom Prompts** - Create, edit, and manage your own conversation prompts through the integrated prompts manager

### Prompts Management Features
- ✅ **Full CRUD Operations** - Create, read, update prompts via Maslow AI API
- ✅ **Centralized Error Handling** - Professional error messages with consistent Maslow AI branding
- ✅ **Real-time Updates** - Optimistic updates with rollback on failure
- ✅ **Comprehensive Validation** - Client and server-side validation
- ✅ **Toast Notifications** - User-friendly feedback for all operations

## 🧪 Testing & Quality Assurance

The project includes a comprehensive testing suite for error message verification:

```bash
# Run error message audit
node test-audit-simple.js

# Run full Playwright tests
./test-error-messages.sh

# View visual demo
open test-error-demo.html
```

## 🏗️ Architecture

### White-Label Ready
- **Centralized Error Messages**: All user-facing messages use Maslow AI branding
- **Consistent API Responses**: Professional error handling across all endpoints
- **Brand Compliance**: Zero backend provider exposure to end users

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand with optimistic updates
- **UI Components**: shadcn/ui with custom design system
- **Testing**: Playwright for comprehensive error message verification
- **API**: RESTful endpoints with full error handling

## 📊 Project Status

**Version**: v2.0.25 - Maslow AI Rebranding & Error Message Centralization
**Status**: ✅ **PRODUCTION READY** - Complete white-label rebranding implemented


