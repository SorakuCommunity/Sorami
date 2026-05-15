import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../shared/models/anilist_anime.dart';

class AnimeCard extends StatefulWidget {
  final AniListAnime anime;
  final VoidCallback? onTap;

  const AnimeCard({
    super.key,
    required this.anime,
    this.onTap,
  });

  @override
  State<AnimeCard> createState() => _AnimeCardState();
}

class _AnimeCardState extends State<AnimeCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _scaleAnim;
  late Animation<double> _overlayAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
    _overlayAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).colorScheme.primary;
    final anime = widget.anime;
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    return MouseRegion(
      onEnter: (_) => _animController.forward(),
      onExit: (_) => _animController.reverse(),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: _animController,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnim.value,
              child: child,
            );
          },
          child: AspectRatio(
            aspectRatio: 0.68,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 6,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (anime.coverLarge != null)
                    CachedNetworkImage(
                      imageUrl: anime.coverLarge!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _placeholder(isDark),
                    )
                  else
                    _placeholder(isDark),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.8),
                        ],
                        stops: const [0.35, 1.0],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: _StatusBadge(status: anime.statusLabel),
                  ),
                  Positioned(
                    left: 10,
                    right: 10,
                    bottom: 10,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizeTransition(
                          sizeFactor: _overlayAnim,
                          axisAlignment: 1.0,
                          child: Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: _OverlayContent(
                              anime: anime,
                              primaryColor: primaryColor,
                              isDesktop: isDesktop,
                            ),
                          ),
                        ),
                        Text(
                          anime.displayTitle,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: isDesktop ? 13 : 11,
                            fontWeight: FontWeight.w600,
                            height: 1.2,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (anime.averageScore != null) ...[
                              Icon(
                                Icons.star,
                                size: isDesktop ? 11 : 10,
                                color: Colors.amber.shade300,
                              ),
                              const SizedBox(width: 2),
                              Text(
                                (anime.averageScore! / 10).toStringAsFixed(1),
                                style: TextStyle(
                                  color: Colors.amber.shade200,
                                  fontSize: isDesktop ? 10 : 9,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 5),
                            ],
                            _MiniTag(
                              text: anime.formatLabel,
                              color: primaryColor,
                              fontSize: isDesktop ? 9 : 8,
                            ),
                            const SizedBox(width: 3),
                            _MiniTag(
                              text: 'SUB',
                              color: Colors.blueAccent,
                              fontSize: isDesktop ? 9 : 8,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _placeholder(bool isDark) {
    return Container(
      color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.06),
      child: Center(
        child: Icon(
          Icons.movie_outlined,
          size: 40,
          color: (isDark ? Colors.white : Colors.black).withValues(alpha: 0.15),
        ),
      ),
    );
  }
}

class _OverlayContent extends StatelessWidget {
  final AniListAnime anime;
  final Color primaryColor;
  final bool isDesktop;

  const _OverlayContent({
    required this.anime,
    required this.primaryColor,
    required this.isDesktop,
  });

  @override
  Widget build(BuildContext context) {
    final fs = isDesktop ? 9.0 : 8.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (anime.genres.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Wrap(
              spacing: 3,
              runSpacing: 3,
              children: anime.genres.take(3).map((g) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    color: primaryColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(3),
                  ),
                  child: Text(
                    g,
                    style: TextStyle(
                      fontSize: fs,
                      color: primaryColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        Row(
          children: [
            Icon(Icons.videocam, size: fs + 1, color: Colors.white70),
            const SizedBox(width: 3),
            Text(
              '${anime.episodes ?? '?'} eps',
              style: TextStyle(fontSize: fs, color: Colors.white70),
            ),
            const SizedBox(width: 8),
            Icon(Icons.star, size: fs + 1, color: Colors.amber.shade300),
            const SizedBox(width: 3),
            Text(
              anime.averageScore != null
                  ? (anime.averageScore! / 10).toStringAsFixed(1)
                  : '?',
              style: TextStyle(fontSize: fs, color: Colors.white70),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    switch (status) {
      case 'Airing':
        bgColor = const Color(0xFF4CAF50);
        break;
      case 'Upcoming':
        bgColor = const Color(0xFFFF9800);
        break;
      case 'Finished':
        bgColor = const Color(0xFF9E9E9E);
        break;
      case 'Cancelled':
        bgColor = const Color(0xFFF44336);
        break;
      default:
        bgColor = const Color(0xFF9E9E9E);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Text(
        status,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}

class _MiniTag extends StatelessWidget {
  final String text;
  final Color color;
  final double fontSize;

  const _MiniTag({
    required this.text,
    required this.color,
    this.fontSize = 9,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        border: Border.all(color: color.withValues(alpha: 0.6), width: 0.5),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
