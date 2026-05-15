# Sorami Product Planning Document

## 1. Product Vision

**Sorami** aims to become the premier global anime streaming ecosystem that seamlessly combines high-quality content delivery with vibrant community engagement, delivering a premium, mobile-first experience that captures the essence of Japanese anime culture while leveraging modern technology for unparalleled accessibility and personalization.

### Core Vision Statement:
"To create the definitive anime entertainment platform where fans don't just watch anime—they live it, discuss it, and grow with it within a thriving global community."

### Key Vision Pillars:
- **Premium Quality**: Cinematic streaming experience with multiple quality options, professional subtitles, and ad-free viewing
- **Community-Centric**: Built-in social features that transform passive viewing into active participation
- **Discovery-First**: Intelligent recommendation system that helps users find their next favorite show
- **Mobile-Optimized**: Designed for on-the-go consumption with offline capabilities
- **Culturally Authentic**: Respects and enhances the anime viewing experience with attention to detail

## 2. MVP Scope (Minimum Viable Product)

The MVP focuses on delivering core streaming functionality with essential community features to validate product-market fit.

### Essential Features for MVP:
#### User Authentication & Profiles
- Email/password registration and login
- Google Sign-In integration
- Basic user profile (username, avatar, preferences)
- Secure JWT-based authentication

#### Core Streaming Functionality
- Anime catalog browsing (list and grid views)
- Detailed anime information pages
- Episode listing with basic metadata
- Video player with:
  - HLS streaming support
  - Basic quality selection (SD/HD toggle)
  - Play/pause, seek, volume controls
  - Fullscreen mode
- Basic progress tracking (continue watching)

#### Essential Content Features
- Home screen with:
  - Continue watching row
  - Trending anime row
  - Basic category rows
- Search functionality (text-based)
- Genre filtering
- Basic anime detail pages (title, synopsis, poster, episode list)

#### Community Features (Basic)
- Anime commenting system
- User profiles with basic info
- Ability to follow/unfollow users
- Activity feed showing followed users' comments

#### Essential UI/UX
- Dark mode as default (with light mode toggle)
- Responsive design for mobile devices
- Smooth animations and transitions
- Intuitive navigation (bottom tab bar)
- Consistent branding with Sorami color palette

#### Technical Foundation
- Riverpod state management
- GoRouter navigation
- Dio API client
- Hive local caching for offline support
- Firebase Cloud Messaging for notifications
- RESTful API communication with backend
- Basic error handling and loading states

### Out of Scope for MVP:
- Advanced social features (direct messaging, groups, forums)
- Premium subscription features
- Download for offline viewing
- Advanced video features (subtitle selection, multiple audio tracks, intro skipping)
- Comprehensive analytics dashboard
- Admin content management system
- Multi-language support (beyond basic UI)
- Advanced recommendation algorithms
- Push notifications beyond basic FCM
- Payment processing integration

## 3. Premium Roadmap

The premium roadmap outlines the phased introduction of paid features that enhance the core experience while maintaining accessibility for free users.

### Phase 1: Essential Premium (Month 1-3 post-launch)
**Target: Establish premium value proposition**
- Ad-free viewing experience
- HD streaming unlock (720p+ priority)
- Early access to new episodes (24-hour window)
- Exclusive profile badges and themes
- Basic analytics (viewing history insights)

### Phase 2: Enhanced Experience (Month 4-6)
**Target: Deepen engagement for power users**
- Offline downloads (limited number of episodes)
- Multiple subtitle language support
- Customizable video player (playback speed, skip intro/outro)
- Priority customer support
- Extended watchlist limits
- Custom profile themes and animations

### Phase 3: Community Premium (Month 7-9)
**Target: Enhance social experience for subscribers**
- Custom emojis and reactions in comments
- Ability to create and manage anime clubs/discussion groups
- Enhanced profile customization (banners, animated avatars)
- Exclusive community events and watch parties
- Advanced filtering and sorting in community features
- Ability to pin comments and create polls

### Phase 4: Creator & Industry Access (Month 10-12)
**Target: Connect fans with creators**
- Access to creator interviews and behind-the-scenes content
- Fan art showcases and contests
- Merchandise discounts and early access
- Virtual convention access
- Creator Q&A sessions
- Licensed soundtrack access

### Premium Pricing Strategy:
- **Tier 1 (Basic Premium)**: $4.99/month - Ad-free + HD + Early access
- **Tier 2 (Standard Premium)**: $7.99/month - Tier 1 + Downloads + Enhanced player
- **Tier 3 (Ultimate Premium)**: $12.99/month - All features + Community perks + Creator access
- Annual discounts: 2 months free with annual commitment
- Student discount: 20% off with .edu verification
- Family plan: Up to 4 profiles for 1.5x individual price

## 4. Target Audience

### Primary Audience:
**The Engaged Anime Enthusiast (Ages 16-30)**
- Actively watches 3+ anime series per season
- Participates in online anime communities (Reddit, Discord, forums)
- Follows anime news and seasonal announcements
- Comfortable with subscription services (already pays for Netflix, Crunchyroll, etc.)
- Values both content quality and community interaction
- Primarily mobile-first or multi-device user
- Geographic focus: North America, Southeast Asia, Latin America (growing markets)

### Secondary Audiences:
1. **Casual Anime Fans (Ages 13-35)**
   - Watches 1-2 series per season
   - Primarily uses free, ad-supported options
   - Potential conversion target through freemium model
   - Values simplicity and content discovery

2. **Hardcore Collectors (Ages 18-40+)**
   - Purchases physical media, figures, merchandise
   - Values exclusivity and collector's items
   - Target for premium tiers and special events
   - Less price-sensitive for unique offerings

3. **Anime Creators & Industry**
   - Studios seeking global distribution channels
   - Creators looking for fan engagement metrics
   - Licensing partners for soundtracks, merchandise
   - B2B opportunities for content delivery and analytics

### Audience Characteristics:
#### Psychographics:
- Values authenticity and respect for source material
- Appreciates both subbed and dubbed content (preference varies by region)
- Engages in theory-crafting, fan art, cosplay, discussions
- Seeks belonging in communities with shared interests
- Early adopters of technology and entertainment trends
- Socially connected, shares discoveries with friends

#### Behavioral Patterns:
- Peak viewing hours: 7 PM - 12 AM local time
- Weekend binge-watching common
- Seasonal anticipation drives engagement spikes
- High rewatch value for favorite series
- Merchandise purchasing correlates with series completion
- Active during convention seasons (spring/summer/fall)

#### Pain Points with Current Solutions:
- Fragmented viewing across multiple platforms
- Poor recommendation systems leading to discovery fatigue
- Limited community integration in mainstream services
- Inconsistent subtitle quality and timing
- Regional licensing restrictions
- Poor mobile experience on some platforms
- Lack of offline options for commuters/travelers
- Ad interruptions breaking immersion
- No way to see what friends are watching

### Market Positioning:
Sorami occupies the sweet spot between:
- **Pure Play Streaming** (Crunchyroll, Funimation) - Strong on content, weak on community
- **Social Platforms** (Reddit, Discord) - Strong on community, weak on organized streaming
- **General Entertainment** (Netflix, Hulu) - Weak on anime specialization and community depth
- **Piracy Sites** - Strong on accessibility and community, weak on legality and quality

Our advantage: Legal, high-quality streaming + integrated community + mobile-first design + premium enhancements

## Success Metrics for MVP Launch:
- **Activation Rate**: >40% of signups complete profile and watch first episode
- **Retention**: >25% Day 7 retention, >15% Day 30 retention
- **Engagement**: >3 sessions per week per active user
- **Community**: >15% of active users leave at least one comment per week
- **Technical**: >95% video start success rate, <2% buffering rate
- **NPS**: >30 within first 3 months post-launch

This planning document provides the strategic foundation for Sorami's development, ensuring that implementation efforts align with clear business objectives and user needs.