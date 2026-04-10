# DentAI Marketing Platform

## Overview
Complete AI-powered marketing automation platform for dental agencies. Generates content for Instagram, YouTube, and Threads with specialized dental knowledge.

## Tech Stack
- Frontend: Next.js 14 + Tailwind CSS + TypeScript
- Backend: Next.js API Routes + Custom Socket.IO server
- Database: Supabase (PostgreSQL)
- Storage: Supabase Storage
- Queue: BullMQ + Upstash Redis
- AI: Anthropic Claude API (claude-sonnet-4-20250514)
- Research: Tavily AI SDK
- Image Rendering: Playwright (HTML → PNG)
- Video Rendering: Remotion
- Deploy: Railway (Docker)

## Project Structure
```
src/                    # Next.js application
  app/                  # App Router pages and API routes
  components/           # React components (ui/, campaign/, dashboard/, etc.)
  lib/                  # Shared libraries (supabase, redis, ai, utils)
  hooks/                # React hooks (useChat, usePipelineStatus, etc.)
  types/                # TypeScript type definitions
pipeline/               # BullMQ pipeline
  orchestrator.js       # Job orchestration and dependency graph
  worker.js             # BullMQ worker
  agents/               # AI agent implementations (ai-*.js)
  utils/                # Utilities (renderer, logger, uploader)
remotion/               # Remotion video compositions
skills/                 # Agent SKILL.md instruction files
knowledge/              # Dental knowledge base (procedures, regulations, etc.)
supabase/               # Database migrations and seed data
```

## Commands
```bash
npm run dev              # Start Next.js dev server
npm run build            # Build for production
node server.js           # Production server with Socket.IO
npm run pipeline:worker  # Start BullMQ worker
npm run pipeline:run     # Run demo pipeline
```

## Key Conventions
- All copy must comply with CFO (Conselho Federal de Odontologia) rules
- No absolute superlatives, no guaranteed results, no prohibited terms
- Pipeline agents use CommonJS (require/module.exports)
- Frontend uses TypeScript with Next.js App Router
- AI calls go through src/lib/ai-cjs.js (CommonJS) or src/lib/ai.ts (ESM)
- All dates in pt-BR format
- Content generated in Brazilian Portuguese

## Environment Variables
See .env.example for all required variables. Critical ones:
- ANTHROPIC_API_KEY — for Claude AI content generation
- NEXT_PUBLIC_SUPABASE_URL + keys — for database and storage
- UPSTASH_REDIS_URL — for BullMQ job queue
- TAVILY_API_KEY — for market research

## Database
Schema in supabase/migrations/001_create_tables.sql
Tables: clients, reference_profiles, campaigns, campaign_pieces, scheduled_posts, chat_messages, pipeline_jobs, media_assets

## Pipeline Flow
Research → Creative (parallel) → Review Loop (max 3 rounds) → Human Approval → Distribution
