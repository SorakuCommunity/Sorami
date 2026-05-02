# Sorami Anime Streaming Ecosystem

Sorami is a modern, scalable, premium anime streaming ecosystem built with a clean monorepo architecture.

## 🏗️ Monorepo Structure
```
sorami/
├── apps/
│   ├── mobile/         # Flutter Mobile App
│   ├── api/            # NestJS Backend API
│   ├── admin/          # Next.js Admin Dashboard
│   └── landing/        # Marketing Website
├── packages/
│   ├── shared-types/   # Shared DTOs, interfaces, enums
│   ├── branding/       # Logo, fonts, colors, tokens
│   ├── config/         # ESLint, Prettier, TSConfig
│   ├── ui-web/         # Shared web UI components
│   └── docs/           # Internal documentation
├── infra/
│   ├── docker/         # Docker configurations
│   ├── nginx/          # Nginx configurations
│   └── scripts/        # Deployment and utility scripts
└── .github/
    └── workflows/      # GitHub Actions CI/CD
```

## 🚀 Tech Stack

### Mobile Frontend
- Flutter 3.x
- Dart
- Riverpod
- GoRouter
- Better Player Plus
- Dio
- Hive Flutter
- Cached Network Image
- Firebase Messaging

### Backend API
- NestJS 10.x
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Cloudflare R2
- Cloudflare CDN
- JWT Auth

### Admin Panel
- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn UI

### DevOps
- Docker
- Turborepo
- pnpm
- GitHub Actions
- Nginx
- VPS Ubuntu
- Sentry
- Uptime Kuma

## 📱 Core Features

### Public User
- **Home**: Hero spotlight slider, Continue watching, Trending anime, Popular today, Ongoing updates, Completed anime, New season releases, Recommended for you
- **Search**: Realtime search, Genre filter, Status filter, Year filter, Studio filter, Popular keywords
- **Anime Detail**: Poster banner, Synopsis, Genre chips, Score/rating, Characters, Staff, Relations, Trailer, Episode list, Recommendations
- **Streaming Player**: HLS playback, Subtitle selector, Multi quality selector (320p/480p/720p/1080p), Resume progress, Auto next episode, Skip intro, Fullscreen landscape, Playback speed, Gesture volume/brightness/seek
- **Library**: Watch history, Favorites, Watchlist, Downloads, Continue offline playback
- **Account**: Login/Register, Google login, Notification settings, Dark mode default, Light mode, Device session management

### Community Features
- Comments per anime
- Episode discussions
- User ratings
- Anime reviews
- Follow users
- Activity feed
- Profile badges

### Premium Features
- No ads
- Faster CDN route
- Full HD unlock (720p+)
- Priority streaming
- Early access simulcast
- Exclusive badge
- Premium profile flair

### Admin Panel Features
- Dashboard: Total users, Active viewers, Daily streams, Popular anime, Revenue analytics, Peak traffic chart, Retention analytics
- Anime Management: Add/Edit/Delete anime, Bulk import anime, Schedule releases, Spotlight banner control, Genre management
- Episode Management: Upload HLS source, Subtitle management, Multi-quality links, Auto publish scheduler
- User Management: Ban user, Reset library, Subscription management, Warning system
- Notification Center: Push broadcast, Episode release alerts, Promotional campaigns

## 🛠️ Getting Started

### Prerequisites
- Node.js >=18.0.0
- pnpm >=8.0.0
- Flutter >=3.0.0
- PostgreSQL
- Redis

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Prisma setup (for API)
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev

# Start development servers
pnpm dev  # Runs all apps in parallel
```

### Individual Service Commands
```bash
# Mobile app
cd apps/mobile
flutter pub get
flutter run

# API
cd apps/api
pnpm run start:dev

# Admin panel
cd apps/admin
pnpm dev

# Landing website
cd apps/landing
pnpm dev
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Lint code
pnpm lint

# Build all apps
pnpm build
```

## 📦 Deployment

### Backend API (Docker/VPS)
```bash
cd apps/api
docker build -t sorami-api .
docker run -p 3000:3000 sorami-api
```

### Admin Panel & Landing (Vercel)
```bash
# Admin panel
cd apps/admin
vercel

# Landing website
cd apps/landing
vercel
```

### Mobile App
Follow Flutter build instructions for Android/iOS releases.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- Inspired by Netflix Mobile, Crunchyroll, Miruro, AniList, and HiAnime
- Built with ❤️ by Soraku Studio
- Powered by the Soraku Community