# CampusAgent Frontend

React + TypeScript frontend for the CampusAgent intelligent forms assistant.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide React (icons)

## Project Structure

```
src/
├── components/         # React components
│   ├── ChatContainer.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   └── Sidebar.tsx
├── api/               # API client
│   └── client.ts
├── types.ts           # TypeScript types
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Tailwind + custom styles
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Components

### App.tsx
- Root component
- Manages global state
- Handles API calls
- Coordinates child components

### ChatContainer
- Displays conversation
- Auto-scrolls to latest message
- Shows loading indicator
- Contains ChatMessage and ChatInput

### ChatMessage
- Renders individual messages
- Styles user vs agent messages
- Shows timestamps
- Displays user/agent icons

### ChatInput
- Text input for messages
- Send button
- Enter to send, Shift+Enter for new line
- Disabled during loading

### Sidebar
- Shows collected form data
- Action buttons (Start New, Download PDF, Generate Email)
- Real-time progress tracking
- FormField sub-components

## API Client

Located in `src/api/client.ts`

### Methods

```typescript
// Start new session
chatApi.startNewSession()

// Send message
chatApi.sendMessage(sessionId, message, formData)

// Generate PDF
chatApi.generatePdf(sessionId, formData)

// Generate email
chatApi.generateEmail(sessionId, formData)
```

## Styling

### Tailwind Utilities

Custom classes in `index.css`:

```css
.chat-bubble          # Base message bubble
.chat-bubble-user     # User message style
.chat-bubble-agent    # Agent message style
.btn-primary          # Primary button
.btn-secondary        # Secondary button
```

### Theme Colors

Primary color scale (blue):
- 50-900: Various shades
- Default: 600 (`#0284c7`)

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Flexbox layouts
- Responsive sidebar

## Adding Features

### New Component

1. Create `ComponentName.tsx` in `components/`
2. Define props interface
3. Export component
4. Import in parent component

### New API Endpoint

1. Add method to `api/client.ts`
2. Define request/response types
3. Handle in component

### New Form Field

1. Add to `types.ts` FormData interface
2. Update Sidebar to display it
3. Backend will handle collection

## Building for Production

```bash
# Build
npm run build

# Output: dist/ directory
```

Deploy `dist/` to:
- Vercel
- Netlify
- GitHub Pages
- Any static host

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | `/api` (proxied) |

## Troubleshooting

**Dev server won't start**
- Check if port 3000 is in use
- Try `PORT=3001 npm run dev`

**Can't connect to backend**
- Ensure backend is running on port 5000
- Check proxy config in `vite.config.ts`

**Build errors**
- Run `npm run lint` to check issues
- Fix TypeScript errors

**Styling not working**
- Check if Tailwind is configured
- Verify `index.css` imports Tailwind directives
- Run `npm install` to ensure PostCSS is installed

## VS Code Setup

Recommended extensions:
- ESLint
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Performance Tips

- Use React.memo for expensive components
- Implement virtualization for long message lists
- Code splitting with React.lazy
- Optimize images and assets

## Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npx prettier --write src/
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- No IE11 support

