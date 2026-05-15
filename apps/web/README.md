# AniStream - Anime Streaming Platform

A production-grade anime streaming platform built with Next.js 14, featuring real-time watch parties, Redis caching, and more.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Supabase (Google/Discord)
- **Caching**: Upstash Redis
- **Video Player**: Vidstack (HLS/DASH support)
- **Real-time**: Socket.io (Watch2Together)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **UI**: shadcn/ui + Tailwind CSS + Framer Motion

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://user:password@localhost:5432/anistream
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstach_redis_rest_token
NEXT_PUBLIC_API_BASE_URL=https://apistreams.vercel.app
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Setup Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── search/            # Search page
│   └── watch/[id]/        # Video player page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Navbar, Footer
│   └── features/          # Player, Search, WatchTogether
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities (Prisma, Redis, Supabase, Socket)
├── services/              # API services
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Features

- **Anime Search** with debounced input and filters (genre, year, status, rating)
- **Video Player** with custom controls, subtitles, playback speed, and theater mode
- **Watch2Together** for real-time synchronized viewing with friends
- **Redis Caching** for API responses (24h TTL for anime, 30m for trending)
- **Rate Limiting** via Redis middleware

## License

MIT