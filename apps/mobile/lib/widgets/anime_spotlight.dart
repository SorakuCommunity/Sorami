import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../shared/providers/anime_provider.dart';
import '../shared/models/anilist_anime.dart';

class AnimeSpotlight extends ConsumerStatefulWidget {
  const AnimeSpotlight({super.key});

  @override
  ConsumerState<AnimeSpotlight> createState() => _AnimeSpotlightState();
}

class _AnimeSpotlightState extends ConsumerState<AnimeSpotlight> {
  late PageController _pageController;
  int _currentPage = 0;
  Timer? _autoSlideTimer;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _autoSlideTimer?.cancel();
    super.dispose();
  }

  void _startAutoSlide(int totalItems) {
    _autoSlideTimer?.cancel();
    _autoSlideTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!_isHovered && _pageController.hasClients) {
        final nextPage = (_currentPage + 1) % totalItems;
        _pageController.animateToPage(nextPage,
            duration: const Duration(milliseconds: 600), curve: Curves.easeInOut);
      }
    });
  }

  void _goToPage(int page) {
    if (_pageController.hasClients) {
      _pageController.animateToPage(page,
          duration: const Duration(milliseconds: 400), curve: Curves.easeInOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    final trending = ref.watch(trendingAnimeProvider);

    return trending.when(
      data: (animeList) {
        if (animeList.isEmpty) return const SizedBox.shrink();

        WidgetsBinding.instance.addPostFrameCallback((_) {
          _startAutoSlide(animeList.length);
        });

        return MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() => _isHovered = false),
          child: SizedBox(
            height: 420,
            child: Stack(
              children: [
                PageView.builder(
                  controller: _pageController,
                  onPageChanged: (i) => setState(() => _currentPage = i),
                  itemCount: animeList.length,
                  itemBuilder: (_, i) => _SpotlightCard(anime: animeList[i]),
                ),
                if (animeList.length > 1) ..._buildNavArrows(animeList.length),
                _buildPageIndicator(animeList.length),
              ],
            ),
          ),
        );
      },
      loading: () => _SpotlightShimmer(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  List<Widget> _buildNavArrows(int total) {
    return [
      if (_isHovered)
        Positioned(
          left: 8,
          top: 0,
          bottom: 40,
          child: Center(
            child: _NavArrow(
              icon: Icons.chevron_left,
              onTap: () => _goToPage((_currentPage - 1 + total) % total),
            ),
          ),
        ),
      if (_isHovered)
        Positioned(
          right: 8,
          top: 0,
          bottom: 40,
          child: Center(
            child: _NavArrow(
              icon: Icons.chevron_right,
              onTap: () => _goToPage((_currentPage + 1) % total),
            ),
          ),
        ),
    ];
  }

  Widget _buildPageIndicator(int total) {
    return Positioned(
      bottom: 12,
      left: 0,
      right: 0,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(total, (i) {
          return GestureDetector(
            onTap: () => _goToPage(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: _currentPage == i ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: _currentPage == i
                    ? Theme.of(context).colorScheme.primary
                    : Colors.white.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _SpotlightCard extends StatelessWidget {
  final AniListAnime anime;
  const _SpotlightCard({required this.anime});

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).colorScheme.primary;
    final hasBanner = anime.bannerImage != null && anime.bannerImage!.isNotEmpty;

    return Stack(
      fit: StackFit.expand,
      children: [
        if (hasBanner)
          CachedNetworkImage(
            imageUrl: anime.bannerImage!,
            fit: BoxFit.cover,
            errorWidget: (_, __, ___) => _PlaceholderBanner(),
          )
        else
          _PlaceholderBanner(),
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                (isDark ? const Color(0xFF0B0B0F) : Colors.black).withValues(alpha: 0.85),
                (isDark ? const Color(0xFF0B0B0F) : Colors.black),
              ],
            ),
          ),
        ),
        Positioned(
          left: 20,
          right: 20,
          bottom: 48,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  _Tag(text: anime.formatLabel, color: primaryColor),
                  const SizedBox(width: 6),
                  _Tag(
                    text: anime.statusLabel,
                    color: anime.status == 'RELEASING'
                        ? Colors.green
                        : Colors.grey,
                  ),
                  if (anime.episodes != null) ...[
                    const SizedBox(width: 6),
                    _Tag(
                      text: '${anime.episodes} eps',
                      color: isDark ? Colors.grey[400]! : Colors.grey[300]!,
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 10),
              Text(
                anime.displayTitle,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Text(
                anime.genres.take(3).join(' • '),
                style: TextStyle(
                  color: Colors.grey[300],
                  fontSize: 13,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  if (anime.averageScore != null) ...[
                    Icon(Icons.star, size: 16, color: Colors.amber.shade400),
                    const SizedBox(width: 4),
                    Text(
                      (anime.averageScore! / 10).toStringAsFixed(1),
                      style: TextStyle(
                        color: Colors.amber.shade200,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  if (anime.seasonYear != null) ...[
                    Icon(Icons.calendar_today, size: 13, color: Colors.grey[400]),
                    const SizedBox(width: 4),
                    Text(
                      '${anime.season} ${anime.seasonYear}',
                      style: TextStyle(color: Colors.grey[400], fontSize: 13),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Icon(Icons.subtitles, size: 14, color: Colors.grey[400]),
                  const SizedBox(width: 4),
                  Text(
                    'SUB/DUB',
                    style: TextStyle(color: Colors.grey[400], fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              if (anime.description != null)
                Text(
                  anime.description!,
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 13,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 14),
              Row(
                children: [
                  _ActionButton(
                    icon: Icons.play_arrow,
                    label: 'Watch Now',
                    isPrimary: true,
                    onTap: () {},
                  ),
                  const SizedBox(width: 10),
                  _ActionButton(
                    icon: Icons.info_outline,
                    label: 'Details',
                    isPrimary: false,
                    onTap: () {},
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Tag extends StatelessWidget {
  final String text;
  final Color color;
  const _Tag({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 0.5),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isPrimary;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.isPrimary,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (isPrimary) {
      return SizedBox(
        height: 38,
        child: ElevatedButton.icon(
          onPressed: onTap,
          icon: Icon(icon, size: 18),
          label: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 20),
          ),
        ),
      );
    }

    return SizedBox(
      height: 38,
      child: OutlinedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 18),
        label: Text(label, style: const TextStyle(fontSize: 13)),
        style: OutlinedButton.styleFrom(
          foregroundColor: Colors.white,
          side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 20),
        ),
      ),
    );
  }
}

class _NavArrow extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _NavArrow({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.5),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
    );
  }
}

class _PlaceholderBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.05),
      child: Center(
        child: Icon(Icons.movie_outlined,
            size: 80, color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.1)),
      ),
    );
  }
}

class _SpotlightShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: 420,
      color: isDark ? const Color(0xFF0B0B0F) : const Color(0xFFF0F0F5),
    );
  }
}
