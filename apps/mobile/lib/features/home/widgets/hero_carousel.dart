import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/models/anilist_anime.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/home_provider.dart';

class HeroCarousel extends ConsumerStatefulWidget {
  const HeroCarousel({super.key});

  @override
  ConsumerState<HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends ConsumerState<HeroCarousel> {
  late PageController _pageController;
  int _currentPage = 0;
  Timer? _autoSlideTimer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 1.0);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _autoSlideTimer?.cancel();
    super.dispose();
  }

  void _startAutoSlide(int count) {
    _autoSlideTimer?.cancel();
    _autoSlideTimer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (_pageController.hasClients && mounted) {
        final next = (_currentPage + 1) % count;
        _pageController.animateToPage(next,
            duration: 700.ms, curve: Curves.easeInOutCubic);
      }
    });
  }

  void _goToPage(int page) {
    if (_pageController.hasClients) {
      _pageController.animateToPage(page,
          duration: 500.ms, curve: Curves.easeInOutCubic);
    }
  }

  @override
  Widget build(BuildContext context) {
    final trending = ref.watch(trendingAnimeProvider);

    return trending.when(
      data: (list) {
        if (list.isEmpty) return const SizedBox(height: 420);
        WidgetsBinding.instance.addPostFrameCallback((_) => _startAutoSlide(list.length));
        return SizedBox(
          height: 420,
          child: Stack(
            children: [
              PageView.builder(
                controller: _pageController,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemCount: list.length,
                itemBuilder: (_, i) => _HeroSlide(
                  anime: list[i],
                  onPlay: () {
                    final slug = _slug(list[i].displayTitle);
                    context.push('/anime/player?animeId=${list[i].id}&slug=$slug&ep=1');
                  },
                  onDetails: () => context.push('/anime/${list[i].id}'),
                ),
              ),
              Positioned(
                left: 0, right: 0, bottom: 16,
                child: _buildIndicators(list.length),
              ),
            ],
          ),
        );
      },
      loading: () => Container(height: 420, color: AppTheme.card),
      error: (_, __) => const SizedBox(height: 420),
    );
  }

  Widget _buildIndicators(int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (i) {
        final active = i == _currentPage;
        return GestureDetector(
          onTap: () => _goToPage(i),
          child: AnimatedContainer(
            duration: 300.ms,
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: active ? 28 : 6,
            height: 4,
            decoration: BoxDecoration(
              gradient: active ? AppTheme.accentGradient : null,
              color: active ? null : Colors.white.withValues(alpha: 0.25),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        );
      }),
    );
  }

  String _slug(String text) {
    return text.toLowerCase()
        .replaceAll(RegExp(r'[^\w\s-]'), '')
        .replaceAll(RegExp(r'[\s_]+'), '-')
        .replaceAll(RegExp(r'-+'), '-')
        .trim()
        .replaceAll(RegExp(r'^-|-$'), '');
  }
}

class _HeroSlide extends StatelessWidget {
  final AniListAnime anime;
  final VoidCallback onPlay;
  final VoidCallback onDetails;

  const _HeroSlide({
    required this.anime,
    required this.onPlay,
    required this.onDetails,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final hasBanner = anime.bannerImage != null && anime.bannerImage!.isNotEmpty;
    final hasCover = anime.coverLarge != null && anime.coverLarge!.isNotEmpty;

    return Stack(
      fit: StackFit.expand,
      children: [
        if (hasBanner)
          CachedNetworkImage(
            imageUrl: anime.bannerImage!,
            fit: BoxFit.cover,
            alignment: Alignment.topCenter,
            errorWidget: (_, __, ___) => hasCover
                ? _buildCover()
                : _buildPlaceholder(),
          )
        else if (hasCover)
          _buildCover()
        else
          _buildPlaceholder(),
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                Colors.transparent,
                AppTheme.background.withValues(alpha: 0.6),
                AppTheme.background.withValues(alpha: 0.9),
                AppTheme.background,
              ],
              stops: const [0.0, 0.2, 0.45, 0.7, 1.0],
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                AppTheme.background.withValues(alpha: 0.5),
                Colors.transparent,
              ],
              stops: const [0.0, 0.25],
            ),
          ),
        ),
        Positioned(
          left: 20,
          right: width * 0.35,
          bottom: 48,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  _Tag(text: anime.formatLabel, color: AppTheme.primaryLight),
                  const SizedBox(width: 6),
                  _StatusBadge(status: anime.status, episodes: anime.episodes),
                  if (anime.averageScore != null) ...[
                    const SizedBox(width: 6),
                    _Tag(
                      text: (anime.averageScore! / 10).toStringAsFixed(1),
                      color: Colors.amber.shade400,
                      icon: Icons.star,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 12),
              Text(
                anime.displayTitle,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: width > 600 ? 32 : 22,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (anime.genres.isNotEmpty) ...[
                const SizedBox(height: 6),
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: anime.genres.take(4).map((g) => _GenrePill(label: g)).toList(),
                ),
              ],
              if (anime.description != null) ...[
                const SizedBox(height: 10),
                Text(
                  anime.description!,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 12,
                    height: 1.35,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 14),
              Row(
                children: [
                  SizedBox(
                    height: 38,
                    child: ElevatedButton.icon(
                      onPressed: onPlay,
                      icon: const Icon(Icons.play_arrow_rounded, size: 20),
                      label: const Text('Watch Now',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  SizedBox(
                    height: 38,
                    child: OutlinedButton.icon(
                      onPressed: onDetails,
                      icon: const Icon(Icons.info_outline, size: 16),
                      label: const Text('Details',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCover() {
    return Stack(
      fit: StackFit.expand,
      children: [
        CachedNetworkImage(
          imageUrl: anime.coverLarge!,
          fit: BoxFit.cover,
          alignment: Alignment.center,
          color: Colors.black.withValues(alpha: 0.4),
          colorBlendMode: BlendMode.darken,
        ),
        Center(
          child: Text(
            anime.displayTitle,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppTheme.card,
      child: Center(
        child: Icon(Icons.movie_outlined,
            size: 64, color: AppTheme.textMuted.withValues(alpha: 0.15)),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  final Color color;
  final IconData? icon;
  const _Tag({required this.text, required this.color, this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: color),
            const SizedBox(width: 3),
          ],
          Text(text, style: TextStyle(
            color: color, fontSize: 10, fontWeight: FontWeight.w600,
          )),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  final int? episodes;
  const _StatusBadge({required this.status, this.episodes});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    bool pulsate = false;
    switch (status) {
      case 'RELEASING':
        color = AppTheme.airing;
        label = 'Airing${episodes != null ? " • Ep $episodes" : ""}';
        pulsate = true;
        break;
      case 'NOT_YET_RELEASED':
        color = AppTheme.upcoming;
        label = 'Upcoming';
        break;
      case 'CANCELLED':
        color = Colors.redAccent;
        label = 'Cancelled';
        break;
      default:
        color = AppTheme.textMuted;
        label = 'Finished${episodes != null ? " • $episodes Ep" : ""}';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5, height: 5,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: pulsate
                  ? [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 4)]
                  : null,
            ),
          ),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(
            color: color, fontSize: 10, fontWeight: FontWeight.w600,
          )),
        ],
      ),
    );
  }
}

class _GenrePill extends StatelessWidget {
  final String label;
  const _GenrePill({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(label,
          style: const TextStyle(
            color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.w500,
          )),
    );
  }
}
