import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../shared/models/anilist_anime.dart';
import '../../../core/theme/app_theme.dart';

class ResponsiveCardGrid extends StatelessWidget {
  final List<Widget> children;
  final double spacing;
  final double runSpacing;

  const ResponsiveCardGrid({
    super.key,
    required this.children,
    this.spacing = 12,
    this.runSpacing = 16,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 900;
        final crossAxisCount = isDesktop ? 5 : 3;
        final totalSpacing = spacing * (crossAxisCount - 1);
        final cardWidth = (constraints.maxWidth - 40 - totalSpacing) / crossAxisCount;

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Wrap(
            spacing: spacing,
            runSpacing: runSpacing,
            children: children.map((c) => SizedBox(width: cardWidth, child: c)).toList(),
          ),
        );
      },
    );
  }
}

class TrendingCard extends StatefulWidget {
  final AniListAnime anime;
  final int rank;
  final VoidCallback? onTap;

  const TrendingCard({
    super.key,
    required this.anime,
    required this.rank,
    this.onTap,
  });

  @override
  State<TrendingCard> createState() => _TrendingCardState();
}

class _TrendingCardState extends State<TrendingCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final anime = widget.anime;
    final rankColors = [
      const Color(0xFFFFD700),
      const Color(0xFFC0C0C0),
      const Color(0xFFCD7F32),
      AppTheme.primaryLight,
      AppTheme.neonBlue,
    ];
    final rankColor = widget.rank <= rankColors.length
        ? rankColors[widget.rank - 1]
        : AppTheme.textMuted;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: 300.ms,
          curve: Curves.easeOutCubic,
          transform: _isHovered ? Matrix4.diagonal3Values(1.03, 1.03, 1) : Matrix4.identity(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 0.68,
                child: Stack(
                  children: [
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        image: widget.anime.coverLarge != null
                            ? DecorationImage(
                                image: CachedNetworkImageProvider(widget.anime.coverLarge!),
                                fit: BoxFit.cover,
                              )
                            : null,
                        color: AppTheme.card,
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: widget.anime.coverLarge == null
                          ? Center(
                              child: Icon(Icons.movie_outlined,
                                  size: 28, color: AppTheme.textMuted.withValues(alpha: 0.3)),
                            )
                          : null,
                    ),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        gradient: AppTheme.cardOverlay,
                      ),
                    ),
                    Positioned(
                      top: 6, left: 6,
                      child: Container(
                        width: 26, height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: rankColor.withValues(alpha: 0.2),
                          border: Border.all(color: rankColor, width: 1.5),
                        ),
                        child: Center(
                          child: Text('${widget.rank}',
                              style: TextStyle(color: rankColor, fontSize: 11, fontWeight: FontWeight.w800)),
                        ),
                      ),
                    ),
                    if (widget.anime.averageScore != null)
                      Positioned(
                        bottom: 6, right: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(3),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.star, size: 9, color: Colors.amber.shade400),
                              const SizedBox(width: 2),
                              Text((widget.anime.averageScore! / 10).toStringAsFixed(1),
                                  style: const TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                    AnimatedOpacity(
                      duration: 200.ms,
                      opacity: _isHovered ? 1 : 0,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primary.withValues(alpha: 0.3),
                              blurRadius: 12, spreadRadius: 1,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 6),
              Text(
                anime.displayTitle,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                maxLines: 1, overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 1),
              Row(
                children: [
                  if (anime.genres.isNotEmpty)
                    Text(anime.genres.first,
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                  if (anime.episodes != null) ...[
                    const SizedBox(width: 4),
                    Text('${anime.episodes} eps',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 10)),
                  ],
                  const Spacer(),
                  _StatusDot(status: anime.status),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

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

class _AnimeCardState extends State<AnimeCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final anime = widget.anime;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: 300.ms,
          curve: Curves.easeOutCubic,
          transform: _isHovered ? Matrix4.diagonal3Values(1.03, 1.03, 1) : Matrix4.identity(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 0.68,
                child: Stack(
                  children: [
                    AnimatedContainer(
                      duration: 300.ms,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        image: widget.anime.coverLarge != null
                            ? DecorationImage(
                                image: CachedNetworkImageProvider(widget.anime.coverLarge!),
                                fit: BoxFit.cover,
                              )
                            : null,
                        color: AppTheme.card,
                        boxShadow: _isHovered
                            ? [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.2), blurRadius: 10, spreadRadius: 1)]
                            : null,
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: widget.anime.coverLarge == null
                          ? Center(
                              child: Icon(Icons.movie_outlined,
                                  size: 28, color: AppTheme.textMuted.withValues(alpha: 0.3)))
                          : null,
                    ),
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        gradient: AppTheme.cardOverlay,
                      ),
                    ),
                    Positioned(
                      top: 6, left: 6,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _MiniBadge(text: anime.formatLabel, color: AppTheme.primary),
                          if (anime.status == 'RELEASING') ...[
                            const SizedBox(width: 3),
                            _MiniBadge(text: 'HD', color: AppTheme.airing),
                          ],
                        ],
                      ),
                    ),
                    Positioned(
                      bottom: 6, right: 6,
                      child: _ScoreBadge(score: anime.averageScore),
                    ),
                    AnimatedOpacity(
                      duration: 200.ms,
                      opacity: _isHovered ? 1 : 0,
                      child: Container(
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, AppTheme.primary.withValues(alpha: 0.85)],
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.play_arrow, size: 16, color: Colors.white),
                            const SizedBox(width: 4),
                            const Text('Watch',
                                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 6),
              Text(
                anime.displayTitle,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 12, fontWeight: FontWeight.w600),
                maxLines: 1, overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 1),
              Row(
                children: [
                  if (anime.averageScore != null) ...[
                    Icon(Icons.star, size: 10, color: Colors.amber.shade400),
                    const SizedBox(width: 2),
                    Text((anime.averageScore! / 10).toStringAsFixed(1),
                        style: TextStyle(color: Colors.amber.shade200, fontSize: 10, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 4),
                  ],
                  Text(anime.genres.isNotEmpty ? anime.genres.first : anime.formatLabel,
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class EpisodeCard extends StatelessWidget {
  final AniListAnime anime;
  final int episodeNumber;
  final VoidCallback? onTap;

  const EpisodeCard({
    super.key,
    required this.anime,
    required this.episodeNumber,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 280,
        margin: const EdgeInsets.only(right: 12),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: SizedBox(
                width: 100, height: 64,
                child: anime.coverLarge != null
                    ? CachedNetworkImage(
                        imageUrl: anime.coverLarge!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => Container(
                          color: AppTheme.card,
                          child: Icon(Icons.movie_outlined,
                              size: 24, color: AppTheme.textMuted.withValues(alpha: 0.3)),
                        ),
                      )
                    : Container(
                        color: AppTheme.card,
                        child: Icon(Icons.movie_outlined,
                            size: 24, color: AppTheme.textMuted.withValues(alpha: 0.3)),
                      ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(anime.displayTitle,
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('Episode $episodeNumber',
                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                  if (anime.nextEpisode != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text('Airs ${anime.nextEpisode!.timeLeft}',
                          style: TextStyle(color: AppTheme.airing.withValues(alpha: 0.8), fontSize: 10, fontWeight: FontWeight.w500)),
                    ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text('SUB',
                  style: TextStyle(color: AppTheme.primaryLight, fontSize: 9, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}

class GenreChip extends StatefulWidget {
  final String label;
  final IconData? icon;
  final bool isSelected;
  final VoidCallback? onTap;

  const GenreChip({
    super.key,
    required this.label,
    this.icon,
    this.isSelected = false,
    this.onTap,
  });

  @override
  State<GenreChip> createState() => _GenreChipState();
}

class _GenreChipState extends State<GenreChip> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: 200.ms,
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: widget.isSelected
                ? AppTheme.primary.withValues(alpha: 0.2)
                : AppTheme.surfaceLight,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: widget.isSelected
                  ? AppTheme.primary.withValues(alpha: 0.5)
                  : _isHovered
                      ? AppTheme.primary.withValues(alpha: 0.2)
                      : Colors.white.withValues(alpha: 0.06),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (widget.icon != null) ...[
                Icon(widget.icon, size: 14,
                    color: widget.isSelected ? AppTheme.primaryLight : AppTheme.textSecondary),
                const SizedBox(width: 4),
              ],
              Text(widget.label,
                  style: TextStyle(
                    color: widget.isSelected ? AppTheme.primaryLight : AppTheme.textPrimary,
                    fontSize: 12, fontWeight: widget.isSelected ? FontWeight.w600 : FontWeight.w500,
                  )),
            ],
          ),
        ),
      ),
    );
  }
}

class _ScoreBadge extends StatelessWidget {
  final int? score;
  const _ScoreBadge({this.score});

  @override
  Widget build(BuildContext context) {
    if (score == null) return const SizedBox.shrink();
    final color = score! >= 75 ? AppTheme.airing : score! >= 50 ? AppTheme.upcoming : AppTheme.textMuted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(3),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.star, size: 9, color: color),
          const SizedBox(width: 2),
          Text((score! / 10).toStringAsFixed(1),
              style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _MiniBadge extends StatelessWidget {
  final String text;
  final Color color;
  const _MiniBadge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(3),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(text,
          style: TextStyle(color: color, fontSize: 8, fontWeight: FontWeight.w700)),
    );
  }
}

class _StatusDot extends StatelessWidget {
  final String status;
  const _StatusDot({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    switch (status) {
      case 'RELEASING':
        color = AppTheme.airing;
        break;
      case 'NOT_YET_RELEASED':
        color = AppTheme.upcoming;
        break;
      default:
        color = AppTheme.finished;
    }
    return Container(
      width: 5, height: 5,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 3)],
      ),
    );
  }
}
