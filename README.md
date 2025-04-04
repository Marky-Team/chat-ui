# Marky Chat UI

Chat interface for the Marky platform. Built with Next.js and TypeScript.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Tech Stack
- Next.js 14
- TypeScript
- TailwindCSS

## Project Structure
```
chat-ui/
├── app/              # Next.js app routes
├── components/       # UI components
├── lib/             # Utilities
└── public/          # Static assets
```

## Environment Variables
Create `.env` file:
```env
OPENAI_API_KEY=
MARKY_API_KEY=
```

## Notes
- All commits must follow [Conventional Commits](https://www.conventionalcommits.org/)
- Run `npm run lint` before committing
- Add tests for new features
