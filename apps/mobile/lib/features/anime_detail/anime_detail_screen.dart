import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import '../../shared/models/anilist_anime.dart';
import '../../shared/providers/anime_provider.dart';
import '../../shared/providers/auth_provider.dart';
import '../../shared/services/anilist_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/slug.dart';
import '../../widgets/glass/glass_container.dart';

class AnimeDetailScreen extends ConsumerStatefulWidget {
  final int animeId;
  const AnimeDetailScreen({super.key, required this.animeId});

  @override
  ConsumerState<AnimeDetailScreen> createState() => _AnimeDetailScreenState();
}

class _AnimeDetailScreenState extends ConsumerState<AnimeDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    ref.read(anilistServiceProvider).setAccessToken(
      ref.read(authStateProvider).accessToken,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final animeAsync = ref.watch(animeDetailProvider(widget.animeId));
    final auth = ref.watch(authStateProvider);
    final service = ref.read(anilistServiceProvider);
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 900;

    return Scaffold(
      body: animeAsync.when(
        data: (anime) {
          if (anime == null) return _errorView(isDark);
          return _buildContent(anime, isDark, auth, service, isDesktop);
        },
        loading: () => _loadingView(isDark),
        error: (_, __) => _errorView(isDark),
      ),
    );
  }

  Widget _buildContent(
    AniListAnime anime, bool isDark, AuthState auth, AniListService service, bool isDesktop,
  ) {
    return NestedScrollView(
      headerSliverBuilder: (context, innerBoxIsScrolled) => [
        _HeroSliver(anime: anime, isDark: isDark, isDesktop: isDesktop),
        SliverToBoxAdapter(
          child: _InfoHeader(anime: anime, isDark: isDark, isDesktop: isDesktop),
        ),
        SliverPersistentHeader(
          pinned: true,
          delegate: _TabBarDelegate(
            tabController: _tabController,
            isDark: isDark,
            labels: ['Overview', 'Episodes', 'Characters', 'More'],
          ),
        ),
      ],
      body: TabBarView(
        controller: _tabController,
        children: [
          _OverviewTab(
            anime: anime, isDark: isDark, auth: auth, service: service, isDesktop: isDesktop,
          ),
            _EpisodesTab(anime: anime, isDark: isDark, animeSlug: anime.id.toString()),
          _CharactersTab(anime: anime, isDark: isDark),
          _MoreTab(anime: anime, isDark: isDark, auth: auth, service: service),
        ],
      ),
    );
  }

  Widget _loadingView(bool isDark) {
    return SafeArea(child: Center(
      child: CircularProgressIndicator(color: AppTheme.primary),
    ));
  }

  Widget _errorView(bool isDark) {
    return SafeArea(child: Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.error_outline, size: 48, color: isDark ? Colors.grey[500] : Colors.grey[400]),
        const SizedBox(height: 16),
        Text('Could not load anime details',
          style: TextStyle(fontSize: 16, color: isDark ? Colors.grey[300] : Colors.grey[600])),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back, size: 18), label: const Text('Go Back')),
      ]),
    ));
  }
}

// ─── Cinematic Hero ───────────────────────────────────────────
class _HeroSliver extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final bool isDesktop;
  const _HeroSliver({required this.anime, required this.isDark, required this.isDesktop});

  @override
  Widget build(BuildContext context) {
    final primaryColor = Theme.of(context).colorScheme.primary;
    final height = isDesktop ? 420.0 : 350.0;

    return SliverAppBar(
      expandedHeight: height,
      pinned: false,
      stretch: true,
      backgroundColor: isDark ? const Color(0xFF0B0B0F) : Colors.white,
      leading: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.4),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            _buildBanner(),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.65),
                    isDark ? const Color(0xFF0B0B0F) : Colors.white,
                  ],
                  stops: const [0.0, 0.4, 1.0],
                ),
              ),
            ),
            if (!isDesktop)
              Positioned(
                left: 16, right: 16, bottom: 16,
                child: _buildMobileHeroContent(context, primaryColor),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBanner() {
    if (anime.bannerImage != null) {
      return CachedNetworkImage(
        imageUrl: anime.bannerImage!, fit: BoxFit.cover,
        errorWidget: (_, __, ___) => _fallbackBanner());
    }
    if (anime.coverLarge != null) {
      return CachedNetworkImage(
        imageUrl: anime.coverLarge!, fit: BoxFit.cover,
        color: Colors.black.withValues(alpha: 0.3),
        colorBlendMode: BlendMode.darken,
        errorWidget: (_, __, ___) => _fallbackBanner());
    }
    return _fallbackBanner();
  }

  Widget _fallbackBanner() {
    return Container(color: isDark ? const Color(0xFF16161D) : Colors.grey[200]);
  }

  Widget _buildMobileHeroContent(BuildContext context, Color primaryColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            width: 80, height: 120,
            child: anime.coverLarge != null
                ? CachedNetworkImage(imageUrl: anime.coverLarge!, fit: BoxFit.cover)
                : Container(color: Colors.grey[800]),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(anime.displayTitle,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, height: 1.2),
                maxLines: 2, overflow: TextOverflow.ellipsis),
              if (anime.titleNative != null) ...[
                const SizedBox(height: 2),
                Text(anime.titleNative!,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
              const SizedBox(height: 6),
              _MetadataRow(anime: anime, primaryColor: primaryColor, isDesktop: false),
              if (anime.description != null) ...[
                const SizedBox(height: 6),
                Text(_strip(anime.description!), maxLines: 2,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11, height: 1.3),
                  overflow: TextOverflow.ellipsis),
              ],
            ],
          ),
        ),
      ],
    );
  }

  String _strip(String s) => s.replaceAll(RegExp(r'<[^>]*>'), '').replaceAll('\n', ' ');
}

// ─── Info Header: poster + action buttons + title (desktop) or just buttons (mobile) ──
class _InfoHeader extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final bool isDesktop;
  const _InfoHeader({required this.anime, required this.isDark, required this.isDesktop});

  @override
  Widget build(BuildContext context) {
    if (isDesktop) {
      return _buildDesktop(context);
    }
    return _buildMobile();
  }

  Widget _buildDesktop(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 200,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: SizedBox(
                    width: 200, height: 300,
                    child: anime.coverLarge != null
                        ? CachedNetworkImage(imageUrl: anime.coverLarge!, fit: BoxFit.cover)
                        : Container(color: Colors.grey[800]),
                  ),
                ),
                const SizedBox(height: 14),
                _ActionButtons(isDark: isDark, anime: anime),
              ],
            ),
            ),
            const SizedBox(width: 24),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(anime.displayTitle,
                  style: TextStyle(
                    color: isDark ? Colors.white : Colors.black87,
                    fontSize: 26, fontWeight: FontWeight.bold, height: 1.2),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
                if (anime.titleNative != null) ...[
                  const SizedBox(height: 4),
                  Text(anime.titleNative!,
                    style: TextStyle(
                      color: isDark ? Colors.grey[500] : Colors.grey[600],
                      fontSize: 13)),
                ],
                const SizedBox(height: 14),
                _MetadataRow(anime: anime,
                  primaryColor: Theme.of(context).colorScheme.primary, isDesktop: true),
                if (anime.description != null) ...[
                  const SizedBox(height: 14),
                  Text(_strip(anime.description!), maxLines: 3,
                    style: TextStyle(
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      fontSize: 13, height: 1.5),
                    overflow: TextOverflow.ellipsis),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobile() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: _ActionButtons(isDark: isDark, anime: anime),
    );
  }

  String _strip(String s) => s.replaceAll(RegExp(r'<[^>]*>'), '').replaceAll('\n', ' ');
}

// ─── Action Buttons ─────────────────────────────────────────
class _ActionButtons extends StatelessWidget {
  final bool isDark; final AniListAnime anime;
  const _ActionButtons({required this.isDark, required this.anime});

  @override
  Widget build(BuildContext context) {
    final primary = AppTheme.primary;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(flex: 3, child: _WatchButton(isDark: isDark, primary: primary, animeSlug: anime.id.toString(), animeTitle: anime.titleRomaji)),
            const SizedBox(width: 8),
            _AddListButton(isDark: isDark),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _AniListLogoButton(isDark: isDark, anime: anime)),
            const SizedBox(width: 8),
            Expanded(child: _MalLogoButton(isDark: isDark, anime: anime)),
          ],
        ),
      ],
    );
  }
}

class _WatchButton extends StatelessWidget {
  final bool isDark; final Color primary;
  final String animeSlug;
  final String? animeTitle;
  const _WatchButton({required this.isDark, required this.primary, this.animeSlug = '0', this.animeTitle});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(color: primary.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4)),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: () {
          final slug = animeTitle != null ? slugify(animeTitle!) : animeSlug;
          context.push('/anime/player?animeId=$animeSlug&slug=$slug&ep=1');
        },
        icon: const Icon(Icons.play_arrow_rounded, size: 20),
        label: const Text('Watch', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 0,
        ),
      ),
    );
  }
}

class _AddListButton extends StatelessWidget {
  final bool isDark;
  const _AddListButton({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
            border: Border.all(color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.15)),
          ),
          child: Icon(Icons.bookmark_outline_rounded, size: 22,
            color: isDark ? Colors.white70 : Colors.black54),
        ),
      ),
    );
  }
}

class _AniListLogoButton extends StatelessWidget {
  final bool isDark; final AniListAnime anime;
  const _AniListLogoButton({required this.isDark, required this.anime});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () async {
          final uri = Uri.parse('https://anilist.co/anime/${anime.id}');
          if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: const Color(0xFF02A9FF).withValues(alpha: 0.12),
            border: Border.all(color: const Color(0xFF02A9FF).withValues(alpha: 0.25)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 20, height: 20,
                decoration: BoxDecoration(
                  color: const Color(0xFF02A9FF),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Center(child: Text('A',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold))),
              ),
              const SizedBox(width: 6),
              Text('AniList', style: TextStyle(
                color: const Color(0xFF02A9FF), fontSize: 12, fontWeight: FontWeight.w600)),
              const Icon(Icons.open_in_new, size: 12, color: Color(0xFF02A9FF)),
            ],
          ),
        ),
      ),
    );
  }
}

class _MalLogoButton extends StatelessWidget {
  final bool isDark; final AniListAnime anime;
  const _MalLogoButton({required this.isDark, required this.anime});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () async {
          final uri = Uri.parse('https://myanimelist.net/anime/${anime.id}');
          if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            color: const Color(0xFF2E51A2).withValues(alpha: 0.12),
            border: Border.all(color: const Color(0xFF2E51A2).withValues(alpha: 0.25)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 20, height: 20,
                decoration: BoxDecoration(
                  color: const Color(0xFF2E51A2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Center(child: Text('M',
                  style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold))),
              ),
              const SizedBox(width: 6),
              Text('MAL', style: TextStyle(
                color: const Color(0xFF2E51A2), fontSize: 12, fontWeight: FontWeight.w600)),
              const Icon(Icons.open_in_new, size: 12, color: Color(0xFF2E51A2)),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Metadata badges ─────────────────────────────────────────
class _MetadataRow extends StatelessWidget {
  final AniListAnime anime; final Color primaryColor; final bool isDesktop;
  const _MetadataRow({required this.anime, required this.primaryColor, required this.isDesktop});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6, runSpacing: 6,
      children: [
        _MetaBadge(
          icon: Icons.star, label: anime.averageScore != null
              ? (anime.averageScore! / 10).toStringAsFixed(1) : '?',
          color: Colors.amber, bgColor: Colors.amber.withValues(alpha: 0.15)),
        _MetaBadge(label: anime.formatLabel, color: primaryColor, bgColor: primaryColor.withValues(alpha: 0.15)),
        _MetaBadge(label: anime.statusLabel, color: Colors.greenAccent, bgColor: Colors.greenAccent.withValues(alpha: 0.15)),
        if (anime.episodes != null)
          _MetaBadge(icon: Icons.videocam, label: '${anime.episodes} eps', color: Colors.white70, bgColor: Colors.white.withValues(alpha: 0.08)),
        if (anime.duration != null)
          _MetaBadge(icon: Icons.timer_outlined, label: '${anime.duration}m', color: Colors.white70, bgColor: Colors.white.withValues(alpha: 0.08)),
        _MetaBadge(label: anime.seasonLabel, color: Colors.white70, bgColor: Colors.white.withValues(alpha: 0.08)),
        if (anime.studios.isNotEmpty)
          _MetaBadge(label: anime.studios.first, color: Colors.cyanAccent, bgColor: Colors.cyanAccent.withValues(alpha: 0.12)),
      ],
    );
  }
}

class _MetaBadge extends StatelessWidget {
  final IconData? icon; final String label; final Color color; final Color bgColor;
  const _MetaBadge({this.icon, required this.label, required this.color, required this.bgColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(6)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        if (icon != null) ...[Icon(icon, size: 12, color: color), const SizedBox(width: 3)],
        Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
      ]),
    );
  }
}

// ─── Sticky Tab Bar Delegate (box/card style) ──────────────
class _TabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabController tabController; final bool isDark; final List<String> labels;

  _TabBarDelegate({
    required this.tabController, required this.isDark, required this.labels,
  });

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0B0B0F) : Colors.white,
        border: Border(bottom: BorderSide(
          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06))),
      ),
      child: TabBar(
        controller: tabController,
        indicator: BoxDecoration(
          color: AppTheme.primary,
          borderRadius: BorderRadius.circular(10),
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        labelColor: Colors.white,
        unselectedLabelColor: isDark ? Colors.grey[500] : Colors.grey[600],
        labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontSize: 12),
        dividerColor: Colors.transparent,
        tabAlignment: TabAlignment.fill,
        onTap: (i) => tabController.animateTo(i),
        tabs: labels.map((l) => Tab(
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(l),
          ),
        )).toList(),
      ),
    );
  }

  @override
  double get maxExtent => 52;
  @override
  double get minExtent => 52;
  @override
  bool shouldRebuild(covariant _TabBarDelegate oldDelegate) => false;
}

// ─── Overview Tab ────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final AuthState auth;
  final AniListService service; final bool isDesktop;

  const _OverviewTab({
    required this.anime, required this.isDark, required this.auth,
    required this.service, required this.isDesktop,
  });

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;

    if (isDesktop) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 7, child: _buildMainContent(context, primary)),
          SizedBox(
            width: 320,
            child: _Sidebar(anime: anime, isDark: isDark, primary: primary, auth: auth),
          ),
        ],
      );
    }

    return _buildMainContent(context, primary);
  }

  Widget _buildMainContent(BuildContext context, Color primary) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (anime.trailerId != null && anime.trailerSite == 'youtube')
            _TrailerSection(trailerId: anime.trailerId!, isDark: isDark),
          if (anime.trailerId != null && anime.trailerSite == 'youtube') const SizedBox(height: 20),
          const SizedBox(height: 24),
          if (anime.characters.isNotEmpty) ...[
            _SectionTitle(title: 'Characters & Voice Actors', isDark: isDark),
            const SizedBox(height: 12),
            _CharactersCarousel(characters: anime.characters, isDark: isDark),
            const SizedBox(height: 24),
          ],
          if (anime.relations.isNotEmpty) ...[
            _SectionTitle(title: 'Relations', isDark: isDark),
            const SizedBox(height: 12),
            _RelationsRow(relations: anime.relations, isDark: isDark),
            const SizedBox(height: 24),
          ],
          if (anime.recommendations.isNotEmpty) ...[
            _SectionTitle(title: 'Recommendations', isDark: isDark),
            const SizedBox(height: 12),
            _RecommendationsCarousel(recommendations: anime.recommendations, isDark: isDark),
            const SizedBox(height: 24),
          ],
          if (auth.isLoggedIn) ...[
            _ListControlsPanel(anime: anime, isDark: isDark, service: service, auth: auth),
          ] else ...[
            _LoginPromptCard(isDark: isDark, primary: primary),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title; final bool isDark;
  const _SectionTitle({required this.title, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Container(width: 3, height: 16, decoration: BoxDecoration(
        color: AppTheme.primary, borderRadius: BorderRadius.circular(2))),
      const SizedBox(width: 8),
      Text(title, style: TextStyle(
        fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
    ]);
  }
}

// ─── Trailer ─────────────────────────────────────────────────
class _TrailerSection extends StatelessWidget {
  final String trailerId; final bool isDark;
  const _TrailerSection({required this.trailerId, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionTitle(title: 'Trailer', isDark: isDark),
        const SizedBox(height: 12),
        Container(
          height: 200,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: isDark ? const Color(0xFF16161D) : Colors.grey[200],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              Center(
                child: Icon(Icons.play_circle_outline, size: 60,
                  color: isDark ? Colors.grey[600] : Colors.grey[400]),
              ),
              Center(
                child: IconButton(
                  icon: Icon(Icons.play_circle_fill, size: 56, color: AppTheme.primary),
                  onPressed: () {},
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── Characters Carousel (with Voice Actors) ────────────────
class _CharactersCarousel extends StatelessWidget {
  final List<CharacterEdge> characters; final bool isDark;
  const _CharactersCarousel({required this.characters, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: characters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final c = characters[i];
          final va = c.voiceActors.isNotEmpty ? c.voiceActors.first : null;
          return SizedBox(
            width: 130,
            child: Column(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: SizedBox(
                    width: 100, height: 100,
                    child: c.image != null
                        ? CachedNetworkImage(imageUrl: c.image!, fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => _charPlaceholder())
                        : _charPlaceholder(),
                  ),
                ),
                const SizedBox(height: 6),
                Text(c.name, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 11, fontWeight: FontWeight.w600)),
                Text(c.role, style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[500], fontSize: 10)),
                if (va != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (va.image != null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: SizedBox(width: 18, height: 18,
                            child: CachedNetworkImage(imageUrl: va.image!, fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(color: Colors.grey[700]))),
                        ),
                      if (va.image != null) const SizedBox(width: 4),
                      Flexible(
                        child: Text(va.name, textAlign: TextAlign.center, maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontSize: 9)),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _charPlaceholder() => Container(
    color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
    child: Icon(Icons.person, color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.15)));
}

// ─── Relations ───────────────────────────────────────────────
class _RelationsRow extends StatelessWidget {
  final List<MediaEdge> relations; final bool isDark;
  const _RelationsRow({required this.relations, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 160,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: relations.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final r = relations[i];
          return SizedBox(
            width: 110,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(width: 110, height: 100,
                    child: r.coverLarge != null
                        ? CachedNetworkImage(imageUrl: r.coverLarge!, fit: BoxFit.cover)
                        : Container(color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06))),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(3)),
                  child: Text(r.relationType,
                    style: TextStyle(color: AppTheme.primary, fontSize: 9, fontWeight: FontWeight.w600)),
                ),
                const SizedBox(height: 2),
                Text(r.title, maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 10)),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── Recommendations ─────────────────────────────────────────
class _RecommendationsCarousel extends StatelessWidget {
  final List<AniListAnime> recommendations; final bool isDark;
  const _RecommendationsCarousel({required this.recommendations, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 200,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: recommendations.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final r = recommendations[i];
          return SizedBox(
            width: 130,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: SizedBox(
                    width: 130, height: 140,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        if (r.coverLarge != null)
                          CachedNetworkImage(imageUrl: r.coverLarge!, fit: BoxFit.cover)
                        else
                          Container(color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06)),
                        Positioned(
                          top: 6, right: 6,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.7),
                              borderRadius: BorderRadius.circular(4)),
                            child: Row(mainAxisSize: MainAxisSize.min, children: [
                              Icon(Icons.star, size: 10, color: Colors.amber),
                              const SizedBox(width: 2),
                              Text(r.averageScore != null
                                  ? (r.averageScore! / 10).toStringAsFixed(1) : '?',
                                style: const TextStyle(color: Colors.white, fontSize: 9)),
                            ]),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(r.displayTitle, maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 11, fontWeight: FontWeight.w500)),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ─── List Controls ───────────────────────────────────────────
class _ListControlsPanel extends ConsumerStatefulWidget {
  final AniListAnime anime; final bool isDark;
  final AniListService service; final AuthState auth;
  const _ListControlsPanel({
    required this.anime, required this.isDark, required this.service, required this.auth,
  });

  @override
  ConsumerState<_ListControlsPanel> createState() => _ListControlsPanelState();
}

class _ListControlsPanelState extends ConsumerState<_ListControlsPanel> {
  String? _status; int? _score; int? _progress; bool _loading = true; bool _saving = false;
  final _notesC = TextEditingController();

  static const _opts = ['CURRENT', 'COMPLETED', 'PLANNING', 'DROPPED', 'PAUSED', 'REPEATING'];
  String _lbl(String s) => switch (s) {
    'CURRENT' => 'Watching', 'COMPLETED' => 'Completed', 'PLANNING' => 'Plan to Watch',
    'DROPPED' => 'Dropped', 'PAUSED' => 'Paused', 'REPEATING' => 'Rewatching', _ => s,
  };

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    widget.service.setAccessToken(widget.auth.accessToken);
    final e = await widget.service.getMediaListEntry(widget.anime.id);
    if (mounted) { setState(() {
      _status = e?['status'] as String?; _score = e?['score'] as int?;
      _progress = e?['progress'] as int?;
      if (e?['notes'] != null) _notesC.text = e!['notes'] as String;
      _loading = false;
    }); }
  }

  Future<void> _save({String? s, int? sc, int? p, String? n}) async {
    setState(() => _saving = true);
    widget.service.setAccessToken(widget.auth.accessToken);
    await widget.service.updateMediaListEntry(
      mediaId: widget.anime.id, status: s, score: sc, progress: p, notes: n);
    if (mounted) { setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Saved!'), duration: Duration(seconds: 1))); }
  }

  @override
  void dispose() { _notesC.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return GlassContainer(
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(Icons.list, size: 18, color: widget.isDark ? Colors.grey[400] : Colors.grey[600]),
            const SizedBox(width: 8),
            Text('My List', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600,
              color: widget.isDark ? Colors.white : Colors.black87)),
          ]),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _status,
            decoration: _dec('Status'),
            items: _opts.map((s) => DropdownMenuItem(value: s, child: Text(_lbl(s)))).toList(),
            onChanged: (v) { setState(() => _status = v); _save(s: v); }),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: DropdownButtonFormField<int>(
              initialValue: _score,
              decoration: _dec('Score'),
              items: List.generate(10, (i) => (i + 1) * 10).map((s) =>
                DropdownMenuItem(value: s, child: Text('${s ~/ 10}/10'))).toList(),
              onChanged: (v) { setState(() => _score = v); _save(sc: v); })),
            const SizedBox(width: 12),
            Expanded(child: TextFormField(
              initialValue: _progress?.toString(),
              decoration: _dec('Progress'),
              keyboardType: TextInputType.number,
              onFieldSubmitted: (v) { final p = int.tryParse(v); if (p != null) _save(p: p); })),
          ]),
          const SizedBox(height: 10),
          TextFormField(
            controller: _notesC,
            decoration: _dec('Notes'),
            maxLines: 2,
            onFieldSubmitted: (v) => _save(n: v)),
          const SizedBox(height: 12),
          SizedBox(width: double.infinity, child: ElevatedButton.icon(
            onPressed: _saving ? null : () => _save(s: _status, sc: _score, p: _progress, n: _notesC.text),
            icon: _saving
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.save, size: 18),
            label: Text(_saving ? 'Saving...' : 'Save All'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary, foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              padding: const EdgeInsets.symmetric(vertical: 12)))),
        ]),
      ),
    );
  }

  InputDecoration _dec(String l) => InputDecoration(
    labelText: l, border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10));
}

class _LoginPromptCard extends StatelessWidget {
  final bool isDark; final Color primary;
  const _LoginPromptCard({required this.isDark, required this.primary});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity, padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: primary.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12),
        border: Border.all(color: primary.withValues(alpha: 0.2))),
      child: Column(children: [
        Icon(Icons.login, size: 32, color: primary),
        const SizedBox(height: 8),
        Text('Log in with AniList', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600,
          color: isDark ? Colors.white : Colors.black87)),
        const SizedBox(height: 4),
        Text('Track your progress, rate anime, and write reviews',
          style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
          textAlign: TextAlign.center),
        const SizedBox(height: 12),
        ElevatedButton.icon(
          onPressed: () => Navigator.of(context).pop(),
          icon: const Icon(Icons.manage_accounts, size: 18),
          label: const Text('Login in Profile'),
          style: ElevatedButton.styleFrom(
            backgroundColor: primary, foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)))),
      ]),
    );
  }
}

// ─── Right Sidebar ───────────────────────────────────────────
class _Sidebar extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final Color primary; final AuthState auth;
  const _Sidebar({required this.anime, required this.isDark, required this.primary, required this.auth});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 16, 16, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _InfoCard(anime: anime, isDark: isDark, primary: primary),
          const SizedBox(height: 12),
          if (auth.isLoggedIn && anime.nextEpisode != null)
            _WatchProgressCard(episode: anime.nextEpisode!.episode, isDark: isDark),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final Color primary;
  const _InfoCard({required this.anime, required this.isDark, required this.primary});

  @override
  Widget build(BuildContext context) {
    final items = <_InfoRow>[
      _InfoRow('Native', anime.titleNative ?? '-'),
      _InfoRow('Romaji', anime.titleRomaji),
      if (anime.titleEnglish != null) _InfoRow('English', anime.titleEnglish!),
      _InfoRow('Status', anime.statusLabel),
      if (anime.studios.isNotEmpty) _InfoRow('Studio', anime.studios.join(', ')),
      _InfoRow('Source', _fmtSource(anime.source)),
      _InfoRow('Episodes', anime.episodes?.toString() ?? '?'),
      if (anime.duration != null) _InfoRow('Duration', '${anime.duration} min'),
      _InfoRow('Rating', anime.averageScore != null
          ? '${(anime.averageScore! / 10).toStringAsFixed(1)}/10' : 'N/A'),
      if (anime.meanScore != null)
        _InfoRow('Mean Score', '${anime.meanScore! / 10}'),
      _InfoRow('Popularity', '#${anime.popularity ?? '?'}'),
      if (anime.favourites != null) _InfoRow('Favorites', '${anime.favourites}'),
      _InfoRow('Season', anime.seasonLabel),
      _InfoRow('Aired', anime.airedString),
      if (anime.countryOfOrigin != null) _InfoRow('Country', anime.countryOfOrigin!),
    ];

    return GlassContainer(
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Information', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87)),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              SizedBox(width: 90, child: Text(item.label,
                style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontSize: 12))),
              Expanded(child: Text(item.value,
                style: TextStyle(color: isDark ? Colors.white70 : Colors.black87, fontSize: 12, fontWeight: FontWeight.w500))),
            ]),
          )),
          if (anime.genres.isNotEmpty) ...[
            const SizedBox(height: 8),
            Wrap(spacing: 4, runSpacing: 4,
              children: anime.genres.take(6).map((g) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: primary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(4)),
                child: Text(g, style: TextStyle(color: primary, fontSize: 10, fontWeight: FontWeight.w500)),
              )).toList()),
          ],
        ]),
      ),
    );
  }

  String _fmtSource(String? s) {
    if (s == null) return '-';
    return s.split('_').map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase()).join(' ');
  }
}

class _InfoRow {
  final String label; final String value;
  const _InfoRow(this.label, this.value);
}

class _WatchProgressCard extends StatelessWidget {
  final int episode; final bool isDark;
  const _WatchProgressCard({required this.episode, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GlassContainer(
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(Icons.timelapse, size: 18, color: AppTheme.primary),
            const SizedBox(width: 8),
            Text('Continue Watching', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87)),
          ]),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: 0.3,
            backgroundColor: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.08),
            color: AppTheme.primary),
          const SizedBox(height: 8),
          Text('Episode $episode', style: TextStyle(fontSize: 12,
            color: isDark ? Colors.grey[400] : Colors.grey[600])),
        ]),
      ),
    );
  }
}

// ─── Episodes Tab ────────────────────────────────────────────
class _EpisodesTab extends StatefulWidget {
  final AniListAnime anime; final bool isDark;
  final String animeSlug;
  const _EpisodesTab({required this.anime, required this.isDark, this.animeSlug = '0'});

  @override
  State<_EpisodesTab> createState() => _EpisodesTabState();
}

class _EpisodesTabState extends State<_EpisodesTab> {
  bool _gridView = false;

  @override
  Widget build(BuildContext context) {
    final count = widget.anime.episodes ?? 12;
    final displayCount = count > 12 ? 12 : count;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(
          children: [
            _SectionTitle(title: 'Episodes', isDark: widget.isDark),
            const Spacer(),
            _ViewToggle(
              isGrid: _gridView,
              isDark: widget.isDark,
              onToggle: () => setState(() => _gridView = !_gridView),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text('${widget.anime.episodes ?? '?'} episodes available',
          style: TextStyle(color: widget.isDark ? Colors.grey[400] : Colors.grey[600], fontSize: 13)),
        const SizedBox(height: 12),
        if (_gridView)
          _buildGridView(displayCount)
        else
          _buildListView(displayCount),
      ]),
    );
  }

  Widget _buildListView(int count) {
    return ListView.separated(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      itemCount: count,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) => _EpisodeCard(
        number: i + 1, isDark: widget.isDark, isGrid: false,
        animeSlug: widget.anime.id.toString(),
        onTap: () {
          final slug = slugify(widget.anime.titleRomaji);
          context.push('/anime/player?animeId=${widget.anime.id}&slug=$slug&ep=${i + 1}');
        },
      ),
    );
  }

  Widget _buildGridView(int count) {
    return GridView.builder(
      shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.of(context).size.width >= 600 ? 4 : 3,
        childAspectRatio: 0.75,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: count,
      itemBuilder: (context, i) => _EpisodeCard(
        number: i + 1, isDark: widget.isDark, isGrid: true,
        animeSlug: widget.anime.id.toString(),
        onTap: () {
          final slug = slugify(widget.anime.titleRomaji);
          context.push('/anime/player?animeId=${widget.anime.id}&slug=$slug&ep=${i + 1}');
        },
      ),
    );
  }
}

class _EpisodeCard extends StatelessWidget {
  final int number; final bool isDark; final bool isGrid; final String animeSlug; final VoidCallback onTap;
  const _EpisodeCard({required this.number, required this.isDark, required this.isGrid, required this.animeSlug, required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (isGrid) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            decoration: BoxDecoration(
              color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.play_circle_outline, size: 28,
                            color: AppTheme.primary.withValues(alpha: 0.5)),
                          const SizedBox(height: 4),
                          Text('EP $number',
                            style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[500], fontSize: 10)),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(8, 6, 8, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text('Episode $number',
                          style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 11),
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      Text('24m', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[500], fontSize: 9)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06)),
          ),
          child: Row(children: [
            Container(
              width: 48, height: 36,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Center(
                child: Icon(Icons.play_arrow_rounded, size: 18, color: AppTheme.primary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Episode $number',
                    style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 14, fontWeight: FontWeight.w500)),
                  Text('Episode $number',
                    style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[500], fontSize: 11)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text('24m', style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[500], fontSize: 11)),
            ),
          ]),
        ),
      ),
    );
  }
}

class _ViewToggle extends StatelessWidget {
  final bool isGrid; final bool isDark; final VoidCallback onToggle;
  const _ViewToggle({required this.isGrid, required this.isDark, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ToggleBtn(
            icon: Icons.list_rounded,
            selected: !isGrid,
            isDark: isDark,
            onTap: isGrid ? onToggle : null,
          ),
          _ToggleBtn(
            icon: Icons.grid_view_rounded,
            selected: isGrid,
            isDark: isDark,
            onTap: !isGrid ? onToggle : null,
          ),
        ],
      ),
    );
  }
}

class _ToggleBtn extends StatelessWidget {
  final IconData icon; final bool selected; final bool isDark; final VoidCallback? onTap;
  const _ToggleBtn({required this.icon, required this.selected, required this.isDark, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primary.withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, size: 18,
          color: selected ? AppTheme.primary : (isDark ? Colors.grey[500] : Colors.grey[600])),
      ),
    );
  }
}

// ─── Characters Tab (with Voice Actors) ──────────────────────
class _CharactersTab extends StatelessWidget {
  final AniListAnime anime; final bool isDark;
  const _CharactersTab({required this.anime, required this.isDark});

  @override
  Widget build(BuildContext context) {
    if (anime.characters.isEmpty) {
      return Center(child: Text('No character data available',
        style: TextStyle(color: isDark ? Colors.grey[500] : Colors.grey[400])));
    }
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _SectionTitle(title: 'Characters & Voice Actors', isDark: isDark),
        const SizedBox(height: 12),
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: _crossAxisCount(MediaQuery.of(context).size.width),
              childAspectRatio: 0.7, crossAxisSpacing: 12, mainAxisSpacing: 12),
            itemCount: anime.characters.length,
            itemBuilder: (context, i) {
              final c = anime.characters[i];
              final va = c.voiceActors.isNotEmpty ? c.voiceActors.first : null;
              return Container(
                decoration: BoxDecoration(
                  color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.04),
                  borderRadius: BorderRadius.circular(10)),
                child: Column(children: [
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(width: 72, height: 72,
                      child: c.image != null
                          ? CachedNetworkImage(imageUrl: c.image!, fit: BoxFit.cover)
                          : Container(color: Colors.grey[800])),
                  ),
                  const Spacer(),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(8, 0, 8, 8),
                    child: Column(children: [
                      Text(c.name, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87)),
                      Text(c.role, style: TextStyle(fontSize: 9,
                        color: isDark ? Colors.grey[500] : Colors.grey[500])),
                      if (va != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (va.image != null)
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: SizedBox(width: 16, height: 16,
                                  child: CachedNetworkImage(imageUrl: va.image!, fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => Container(color: Colors.grey[700]))),
                              ),
                            if (va.image != null) const SizedBox(width: 3),
                            Flexible(
                              child: Text(va.name, textAlign: TextAlign.center, maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 8,
                                  color: isDark ? Colors.grey[400] : Colors.grey[600])),
                            ),
                          ],
                        ),
                      ],
                    ]),
                  ),
                ]),
              );
            },
          ),
        ),
      ]),
    );
  }

  int _crossAxisCount(double w) => w >= 900 ? 6 : w >= 600 ? 4 : 3;
}

// ─── More Tab ────────────────────────────────────────────────
class _MoreTab extends StatelessWidget {
  final AniListAnime anime; final bool isDark; final AuthState auth; final AniListService service;
  const _MoreTab({required this.anime, required this.isDark, required this.auth, required this.service});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: ListView(
        children: [
          if (anime.relations.isNotEmpty) ...[
            _SectionTitle(title: 'Relations', isDark: isDark),
            const SizedBox(height: 12),
            _RelationsRow(relations: anime.relations, isDark: isDark),
            const SizedBox(height: 24),
          ],
          if (anime.recommendations.isNotEmpty) ...[
            _SectionTitle(title: 'Recommendations', isDark: isDark),
            const SizedBox(height: 12),
            _RecommendationsCarousel(recommendations: anime.recommendations, isDark: isDark),
            const SizedBox(height: 24),
          ],
          if (anime.externalLinks.isNotEmpty) ...[
            _SectionTitle(title: 'External Links', isDark: isDark),
            const SizedBox(height: 12),
            ...anime.externalLinks.map((link) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: OutlinedButton.icon(
                onPressed: () async {
                  final uri = Uri.parse(link.url);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: Icon(Icons.open_in_new, size: 16, color: AppTheme.primary),
                label: Text(link.site, style: const TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.primary,
                  side: BorderSide(color: AppTheme.primary.withValues(alpha: 0.3)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            )),
          ],
          const SizedBox(height: 24),
          Row(children: [
            _ActionChip(
              label: 'AniList', icon: Icons.open_in_new,
              color: AppTheme.primary,
              onTap: () async {
                final uri = Uri.parse('https://anilist.co/anime/${anime.id}');
                if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
              }),
            const SizedBox(width: 10),
            _ActionChip(
              label: 'MyAnimeList', icon: Icons.open_in_new,
              color: Colors.blueAccent,
              onTap: () async {
                final uri = Uri.parse('https://myanimelist.net/anime/${anime.id}');
                if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
              }),
          ]),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ─── Reusable Action Chip ───────────────────────────────────
class _ActionChip extends StatelessWidget {
  final String label; final IconData icon; final Color color; final VoidCallback onTap;
  const _ActionChip({required this.label, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}
