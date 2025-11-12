# 🤝 Contributing to CampusAgent

Thank you for your interest in contributing to CampusAgent! This document provides guidelines and instructions for contributing.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

If you find a bug:

1. **Check existing issues** - See if it's already reported
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (OS, Node version, browser)

### 💡 Suggesting Enhancements

Have an idea? We'd love to hear it!

1. **Check existing issues** - Someone might have suggested it
2. **Create a new issue** with:
   - Clear description of the feature
   - Why it would be useful
   - How it might work
   - Any mockups or examples

### 🔨 Pull Requests

Ready to contribute code? Great!

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

---

## Development Guidelines

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Prefer interfaces over types
- Use explicit types for function parameters and returns
- Avoid `any` - use proper types

```typescript
// Good
interface User {
  name: string;
  id: number;
}

function getUser(id: number): User {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Use descriptive prop names
- Add TypeScript interfaces for props

```tsx
interface ButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

function Button({ onClick, label, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

#### CSS/Tailwind
- Use Tailwind utility classes
- Keep custom CSS minimal
- Follow mobile-first approach
- Use semantic class names for custom components

### File Organization

```
src/
├── components/     # React components (one per file)
├── services/       # Business logic and API calls
├── routes/         # API route handlers
├── types.ts        # Shared TypeScript types
└── utils/          # Utility functions
```

### Naming Conventions

- **Files:** camelCase for utilities, PascalCase for components
- **Components:** PascalCase (e.g., `ChatMessage.tsx`)
- **Functions:** camelCase (e.g., `processMessage`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces:** PascalCase (e.g., `FormData`)

---

## Testing

### Before Submitting

Test your changes:

1. **Functionality:** Does it work as intended?
2. **Edge cases:** What happens with invalid input?
3. **UI/UX:** Is it user-friendly?
4. **Performance:** Does it cause slowdowns?
5. **Backwards compatibility:** Does it break existing features?

### Manual Testing Checklist

- [ ] Chat conversation works
- [ ] Form data is extracted correctly
- [ ] PDF generation succeeds
- [ ] Email generation works
- [ ] UI is responsive
- [ ] No console errors
- [ ] Backend logs are clean

---

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(chat): add support for voice input

fix(pdf): resolve formatting issue with long names

docs(readme): update setup instructions

refactor(agent): simplify reasoning logic
```

---

## Areas for Contribution

### High Priority

- [ ] Unit tests for services
- [ ] E2E tests for user flows
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Input validation
- [ ] Accessibility improvements
- [ ] Mobile optimization

### Features

- [ ] Support for additional form types
- [ ] User authentication
- [ ] Session persistence (database)
- [ ] Real email sending
- [ ] File uploads
- [ ] Multi-language support
- [ ] Dark mode

### Documentation

- [ ] API documentation
- [ ] Code comments
- [ ] Tutorial videos
- [ ] Architecture diagrams
- [ ] Deployment guides

### Infrastructure

- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Testing framework
- [ ] Logging system
- [ ] Monitoring

---

## Code Review Process

### What We Look For

1. **Functionality:** Does it work correctly?
2. **Code Quality:** Is it well-written and maintainable?
3. **Tests:** Are there tests? Do they pass?
4. **Documentation:** Is it documented?
5. **Style:** Does it follow our conventions?

### Timeline

- Initial review: Within 3-5 days
- Feedback: We'll provide constructive feedback
- Iteration: Work together to polish the PR
- Merge: Once approved, we'll merge!

---

## Development Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

Quick start:
```bash
git clone <your-fork>
cd CampusAgent
npm run install:all
cd backend && cp .env.example .env
# Add your GEMINI_API_KEY to backend/.env
npm run dev
```

---

## Project Structure Deep Dive

### Frontend Architecture

```
frontend/src/
├── components/          # React components
│   ├── ChatContainer    # Main chat interface
│   ├── ChatMessage      # Individual message bubble
│   ├── ChatInput        # Message input field
│   └── Sidebar          # Form progress sidebar
├── api/                 # API client layer
│   └── client.ts        # Axios setup and endpoints
├── types.ts             # TypeScript interfaces
├── App.tsx              # Root component
└── index.css            # Global styles + Tailwind
```

### Backend Architecture

```
backend/src/
├── config/              # Configuration
│   └── gemini.ts        # Gemini AI setup
├── services/            # Business logic
│   ├── agentService     # AI agent workflow
│   ├── pdfService       # PDF generation
│   └── emailService     # Email drafting
├── routes/              # Express routes
│   ├── chat             # Chat endpoints
│   ├── pdf              # PDF endpoints
│   └── email            # Email endpoints
├── types.ts             # TypeScript interfaces
└── server.ts            # Express server setup
```

---

## Getting Help

### Questions?

- Open a GitHub Discussion
- Comment on relevant issues
- Reach out to maintainers

### Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Given our eternal gratitude! 🙏

---

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Inappropriate conduct

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to CampusAgent! 🎉**

