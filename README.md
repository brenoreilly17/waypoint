# Waypoint

An AI-powered travel planner that optimizes trip suggestions around loyalty points and rewards. Built as a solo project to explore agentic AI application design.

## What it does

Waypoint takes a user through a 7-step guided intake (destination flexibility, dates, points/rewards programs, preferences) and generates a set of personalized trip options. Instead of a fixed rules engine, trip generation is handled by the Claude API with web search enabled, so the tool can reason through options — flight/points tradeoffs, destination fit — rather than following a hardcoded script.

## Architecture

- **Frontend** — React (Vite), a 7-step form UI with a carousel-style results view (`src/App.jsx`)
- **Backend (production)** — Vercel serverless functions: `api/plan.js` generates trip plans, `api/itinerary.js` handles itinerary detail/refinement
- **Backend (local dev)** — `server.js`, an Express server mirroring the serverless logic for local testing
- **AI orchestration** — Claude API calls with web search as a tool, plus the Pexels API for destination imagery
- **Mock mode** — a `MOCK_MODE` flag returns fixed sample results (Lisbon/Edinburgh/Reykjavik) without live API calls, for UI development without burning API costs

## Status

Actively developed. Pending: support for one-way trips, different return airport than departure, and return-date validation.
