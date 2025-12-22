# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: GapTrack

AI-powered job application tracker. Privacy-first, runs locally, no backend.

## Tech Stack
- React + Vite (frontend)
- File System Access API (local storage)
- Gemini API or Ollama (AI analysis)
- GitHub Pages (hosting)

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture
```
src/
  components/    # React components
  hooks/         # Custom hooks (useStorage, useAI)
  utils/         # Helper functions
  App.jsx        # Main app
  main.jsx       # Entry point
```

## Key Features
1. Resume upload + AI parsing
2. JD paste + gap analysis
3. Application tracking (status, notes)
4. Local file storage (File System API)
5. AI: Gemini (cloud) or Ollama (local)
