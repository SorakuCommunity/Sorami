# Production-Grade Anime Streaming Platform: System Architecture & Implementation Blueprint

This document serves as a comprehensive guide for building a high-performance, scalable anime streaming platform using the specified tech stack. It is structured to be consumed by **Kilo AI** for step-by-step code generation.

---

## LAYER 1 — SYSTEM ARCHITECTURE

### Architecture Overview
The system follows a **Modern Monolith** architecture using **Next.js (App Router)**. It leverages **Server-Side Rendering (SSR)** for SEO-critical pages (Home, Detail) and **Client-Side Rendering (CSR)** for interactive components (Player, Watch2Together).

- **Frontend/Backend:** Next.js (TypeScript)
- **Data Persistence:** PostgreSQL (Supabase) via Prisma ORM.
- **Caching & Rate Limiting:** Redis (Upstash).
- **Real-time Sync:** Socket.io (Watch2Together) & Supabase Realtime (Notifications/Status).
- **Video Delivery:** Vidstack (HLS/Dash support).

### Data Flow Diagram
```text
[User Browser] 
      │
      ▼
[Next.js App Router (Middleware: Rate Limiting via Redis)]
      │
      ├─▶ [Cache Check: Redis (Upstash)] ───┐
      │         (If Hit: Return Data)       │
      │                                     │
      ├─▶ [Database: Supabase (PostgreSQL)] │
      │                                     │
      └─▶ [External API: apistreams.vercel.app]
                │
                └─▶ [Redis: Set Cache (TTL 1h-24h)]
```

### Real-time Flow (Watch2Together)
```text
[User A (Host)] ◀───▶ [Socket.io Server] ◀───▶ [User B (Guest)]
      │                      │                       │
      └─▶ [Play/Pause/Seek] ─┴─▶ [Broadcast Event] ──┘
```

---

## LAYER 2 — IMPLEMENTATION BLUEPRINT

### Project Structure
```text
/src
  /app                # Next.js App Router (Pages & Route Handlers)
  /components         # UI Components (shadcn/ui, Framer Motion)
    /ui               # Base shadcn components
    /shared           # Navbar, Footer, Layouts
    /features         # Feature-specific (Player, Search, W2T)
  /hooks              # Custom React Hooks (Zustand, TanStack Query)
  /lib                # Utility functions (Prisma, Redis, Supabase clients)
  /services           # External API wrappers & Business logic
  /store              # Zustand state management
  /types              # TypeScript interfaces/types
/prisma               # Database schema
/public               # Static assets
```

### Data Models (Prisma Schema Overview)
- **User:** id, email, username, avatar, watch_history, favorites.
- **Anime (Cache/Ref):** id, title, slug, poster, rating (Synced from external API).
- **Room (Watch2Together):** id, hostId, animeId, currentEpisode, status (playing/paused), currentTime.

### Redis Strategy
- `anime:{id}`: Stores full anime metadata. TTL: 24h.
- `trending`: Stores list of trending anime. TTL: 30m.
- `ratelimit:{ip}`: Tracks request count. TTL: 1m.

---

## LAYER 3 — KILO AI EXECUTION PROMPTS

### Prompt 1: Project Initialization
**Objective:** Setup the base Next.js project with styling and UI libraries.
**Files to Create:** `package.json`, `tailwind.config.js`, `components.json`, `src/app/layout.tsx`.
**Instructions:**
- Initialize Next.js with TypeScript and App Router.
- Install `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`.
- Setup `shadcn/ui` and add base components: `Button`, `Input`, `Card`, `Skeleton`.
- Create a global layout with a dark-themed responsive Navbar.

### Prompt 2: Database & Auth Setup (Supabase + Prisma)
**Objective:** Configure Supabase Auth and Prisma ORM.
**Files to Create:** `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/lib/supabase.ts`.
**Instructions:**
- Define `User`, `Favorite`, and `WatchHistory` models in Prisma.
- Setup Supabase client for Auth (Google/Discord).
- Create a middleware to protect `/profile` and `/watch` routes.

### Prompt 3: Anime API Service with Redis Caching
**Objective:** Create a service to fetch data from `apistreams.vercel.app` with Upstash Redis caching.
**Files to Create:** `src/lib/redis.ts`, `src/services/anime.service.ts`, `src/app/api/anime/[id]/route.ts`.
**Instructions:**
- Implement a `fetchAnime` function with retry logic.
- Check Redis for `anime:{id}` before calling the external API.
- If cache miss, fetch from API and store in Redis with 24h TTL.
- Implement rate limiting using Redis in a Next.js middleware.

### Prompt 4: Video Player Integration (Vidstack)
**Objective:** Build a high-performance video player.
**Files to Create:** `src/components/features/Player.tsx`, `src/app/watch/[id]/page.tsx`.
**Instructions:**
- Integrate `Vidstack` player with HLS support.
- Implement custom UI for: Subtitle selection, Speed control (0.5x - 2x), and Auto-skip intro.
- Add "Theater Mode" toggle using Zustand for state.

### Prompt 5: Watch2Together (Socket.io Sync)
**Objective:** Implement real-time synchronization for group watching.
**Files to Create:** `src/lib/socket.ts`, `src/hooks/useWatchTogether.ts`.
**Instructions:**
- Setup a Socket.io client to connect to a sync server.
- Sync `play`, `pause`, and `seek` events between host and guests.
- Implement "Host Transfer" logic if the current host disconnects.

### Prompt 6: Search & Filter System
**Objective:** Build a robust search system with "Power Filters".
**Files to Create:** `src/components/features/Search.tsx`, `src/app/search/page.tsx`.
**Instructions:**
- Create a search bar with debounced input.
- Implement filters for: Genre, Year, Status, and Rating.
- Use TanStack Query for fetching and caching search results on the client.

---
**End of Blueprint**
