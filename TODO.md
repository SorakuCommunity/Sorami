# Sorami Development TODO
## Sorami Master TODO

### Foundation / Planning

- [x] Define product vision, MVP scope, premium roadmap
  - [x] Define target audience
    - [x] Anime fans mobile-first users
    - [x] Casual streaming users
    - [x] Premium binge-watch users
  - [x] Define MVP core features
    - [x] Authentication
    - [x] Home discovery
    - [x] Anime detail
    - [x] Streaming player
    - [x] Library system
  - [x] Define premium roadmap
    - [x] Ad-free mode
    - [x] HD / higher quality unlock
    - [x] Early access features
    - [ ] Offline downloads
  - [x] Define post-MVP roadmap
    - [x] Community features
    - [ ] Comments
    - [ ] Rewards / loyalty
    - [ ] AI recommendations

- [x] Finalize brand identity (logo, colors, typography)
  - [ ] Create logo concept
  - [x] Define primary colors
  - [x] Define dark mode palette
  - [ ] Define typography system
  - [x] Define spacing / radius / shadows
  - [ ] Create brand guideline

- [x] Create monorepo structure (apps/, packages/, infra/)
  - [x] apps/mobile
  - [x] apps/api
  - [x] apps/admin
  - [x] apps/landing
  - [x] packages/shared-types
  - [x] packages/branding
  - [x] packages/config
  - [x] packages/ui-web
  - [x] packages/docs
  - [x] infra/docker
  - [x] infra/nginx
  - [x] infra/scripts

- [x] Setup GitHub repository + branching strategy
  - [x] master branch
  - [x] dev branch
  - [x] feature/*
  - [x] fix/*
  - [x] release/*
  - [x] Protect master branch
  - [x] Require PR review

- [x] Setup issue labels + milestone planning
  - [x] bug
  - [x] feature
  - [x] urgent
  - [x] enhancement
  - [x] docs
  - [x] MVP
  - [x] v1.1
  - [x] v2.0

---

## Mobile App (Flutter)

- [x] Setup Flutter architecture
  - [x] Riverpod / Bloc decision (Riverpod chosen)
  - [x] Routing system (GoRouter)
  - [x] Theme system
  - [ ] Env config
  - [ ] Error handling

- [ ] Setup Firebase configuration
  - [ ] Create Firebase project
  - [ ] Android app register
  - [ ] iOS app register
  - [ ] Add firebase config files
  - [ ] Test initialization

- [x] Implement authentication
  - [x] Email register
  - [x] Email login
  - [x] Google login
  - [ ] Forgot password
  - [ ] Persist session
  - [x] Logout

- [x] Create home screen
  - [ ] Hero slider banner
  - [x] Continue watching
  - [x] Trending anime
  - [ ] Latest episodes
  - [ ] Popular this week
  - [ ] Pull to refresh

- [ ] Implement search functionality
  - [ ] Search input
  - [ ] Debounce query
  - [ ] Genre filter
  - [ ] Year filter
  - [ ] Status filter
  - [ ] Sorting options

- [x] Create anime detail screen
  - [x] Poster header
  - [x] Synopsis
  - [x] Genres
  - [x] Episode list
  - [ ] Related anime
  - [x] Add to watchlist

- [x] Implement video player with HLS support
  - [x] HLS streaming
  - [ ] Subtitle support
  - [ ] Quality selector
  - [ ] Skip intro
  - [x] Continue progress save
  - [x] Fullscreen mode
  - [ ] Gesture controls

- [x] Create library screens
  - [x] Watch history
  - [x] Favorites
  - [x] Watchlist
  - [ ] Downloads

- [ ] Implement account settings
  - [ ] Profile edit
  - [ ] Language selector
  - [ ] Theme switcher
  - [x] Logout
  - [ ] Subscription page

- [ ] Add multi-language support
  - [ ] English
  - [ ] Indonesia
  - [ ] Japanese labels ready

- [ ] Implement notifications
  - [ ] New episode alerts
  - [ ] Promo alerts
  - [ ] Continue watching reminders

- [ ] Add premium features
  - [ ] Ad-free mode
  - [ ] HD unlock
  - [ ] Priority server access

- [ ] Add offline playback support
  - [ ] Download manager
  - [ ] DRM/basic protection
  - [ ] Resume offline playback

- [ ] Polish UI/UX
  - [ ] Smooth transitions
  - [ ] Skeleton loading
  - [ ] Empty states
  - [ ] Error states

- [ ] Optimize performance
  - [ ] Lazy loading
  - [ ] Image caching
  - [ ] Reduce rebuilds
  - [ ] API pagination

- [ ] Testing
  - [ ] Unit tests
  - [ ] Widget tests
  - [ ] Smoke tests

- [ ] Release preparation
  - [ ] Android APK
  - [ ] Android AAB
  - [ ] iOS build prep
  - [ ] Store assets

---

## Backend API (NestJS)

- [x] Setup NestJS architecture
  - [x] Modules structure
  - [x] Config env
  - [x] Validation pipes
  - [x] Global exception filter

- [x] Setup PostgreSQL + Prisma
  - [x] User schema
  - [x] Anime schema
  - [x] Episode schema
  - [ ] Library schema
  - [ ] Subscription schema

- [x] Implement authentication module
  - [x] Register API
  - [x] Login API
  - [x] JWT access token
  - [ ] Refresh token
  - [ ] Logout API

- [ ] Create user management endpoints
  - [ ] Get profile
  - [ ] Update profile
  - [ ] Delete account

- [ ] Implement anime CRUD
  - [ ] Create anime
  - [ ] Update anime
  - [ ] Delete anime
  - [ ] List anime
  - [ ] Trending endpoint

- [ ] Implement episode management
  - [ ] Add episode
  - [ ] Edit episode
  - [ ] Delete episode
  - [ ] Reorder episodes

- [ ] Create streaming endpoints
  - [ ] Signed URLs
  - [ ] Token validation
  - [ ] Anti hotlink

- [ ] Implement library features
  - [ ] Save history
  - [ ] Favorites API
  - [ ] Watchlist API
  - [ ] Continue watching sync

- [ ] Add comment and rating system
  - [ ] Post comment
  - [ ] Delete comment
  - [ ] Rating average

- [ ] Implement notification system
  - [ ] Push queue
  - [ ] Broadcast notifications

- [ ] Admin-only endpoints
  - [ ] Manage users
  - [ ] Manage anime
  - [ ] Manage subscriptions

- [ ] Security hardening
  - [ ] Rate limiting
  - [ ] Helmet headers
  - [ ] CORS config
  - [ ] Input sanitization

- [ ] Implement caching with Redis
  - [ ] Home cache
  - [ ] Trending cache
  - [ ] Session cache

- [ ] File upload handling
  - [ ] Poster upload
  - [ ] Banner upload
  - [ ] Subtitle upload

- [ ] Integrate Cloudflare R2
  - [ ] Credentials setup
  - [ ] Upload service
  - [ ] Delete service

- [ ] Logging and monitoring
  - [ ] Request logs
  - [ ] Error logs
  - [ ] Audit logs

- [ ] Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests

- [ ] CI/CD Docker deployment
  - [ ] Dockerfile
  - [ ] Compose
  - [ ] Auto deploy

---

## Admin Panel (Next.js)

- [ ] Setup admin foundation
  - [ ] Auth guard
  - [ ] Dashboard layout
  - [ ] Sidebar nav

- [ ] Authentication
  - [ ] NextAuth/custom login
  - [ ] Session protection
  - [ ] Role access

- [ ] Dashboard analytics
  - [ ] Users count
  - [ ] Views count
  - [ ] Revenue chart
  - [ ] Active subscriptions

- [ ] Anime management
  - [ ] Add anime
  - [ ] Edit anime
  - [ ] Delete anime
  - [ ] Bulk import

- [ ] Episode management
  - [ ] Upload HLS links
  - [ ] Upload subtitles
  - [ ] Sort episodes

- [ ] User management panel
  - [ ] Search users
  - [ ] Ban/unban
  - [ ] Premium assign

- [ ] Notification center
  - [ ] Broadcast push
  - [ ] Scheduled notices

- [ ] Billing management
  - [ ] Subscription plans
  - [ ] Payments table

- [ ] Responsive design
  - [ ] Tablet support
  - [ ] Mobile support

- [ ] Testing + deploy
  - [ ] Component tests
  - [ ] Deploy Vercel

---

## Landing Website (Next.js)

- [ ] Create homepage
  - [ ] Hero CTA
  - [ ] App preview
  - [ ] Feature highlights
  - [ ] Testimonials
  - [ ] Download CTA

- [ ] Create pricing page
  - [ ] Free plan
  - [ ] Premium monthly
  - [ ] Premium yearly

- [ ] Add static pages
  - [ ] About
  - [ ] Contact
  - [ ] Privacy policy
  - [ ] Terms

- [ ] Community page
  - [ ] Discord CTA
  - [ ] Events section

- [ ] SEO optimization
  - [ ] Metadata
  - [ ] Sitemap
  - [ ] Robots.txt
  - [ ] Open Graph

- [ ] UI polish
  - [ ] Dark/light mode
  - [ ] Smooth animations
  - [ ] Mobile responsive

- [ ] Deploy Vercel

---

## Shared Packages

- [x] Define shared TypeScript types
  - [ ] DTOs
  - [ ] Interfaces
  - [ ] Enums

- [ ] Branding package
  - [ ] Logo assets
  - [ ] Colors
  - [ ] Typography tokens

- [x] Shared config package
  - [x] ESLint
  - [x] Prettier
  - [x] TSConfig

- [ ] Shared UI package
  - [ ] Buttons
  - [ ] Cards
  - [ ] Inputs
  - [ ] Modals

- [ ] Internal docs

---

## DevOps

- [ ] Setup Docker containers
- [ ] Configure Nginx reverse proxy
- [ ] Setup GitHub Actions
- [ ] Configure Sentry
- [ ] Setup Uptime Kuma
- [ ] Create deployment scripts
- [ ] Setup env stages
  - [ ] local
  - [ ] staging
  - [ ] production
- [ ] Configure Cloudflare CDN + WAF
- [ ] Setup database backups

---

## General

- [ ] Create API documentation (Swagger)
- [ ] Implement testing strategy
  - [ ] Setup performance monitoring
  - [ ] Add analytics system
  - [ ] CI/CD all services
  - [ ] Create deployment guides
  - [ ] Setup feature flags
  - [ ] Implement i18n across all platforms

---

## MVP Launch Priority

- [ ] Auth complete
- [ ] Home complete
- [ ] Anime detail complete
- [ ] Streaming complete
- [ ] Watchlist complete
- [ ] Payment ready
- [ ] Production deploy
- [ ] Closed beta testing