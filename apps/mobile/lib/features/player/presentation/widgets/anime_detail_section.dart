import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../application/providers/player_provider.dart';

class AnimeDetailSection extends ConsumerStatefulWidget {
  const AnimeDetailSection({super.key});

  @override
  ConsumerState<AnimeDetailSection> createState() => _AnimeDetailSectionState();
}

class _AnimeDetailSectionState extends ConsumerState<AnimeDetailSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(playerProvider).animeDetail;
    if (detail == null) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: detail.posterUrl != null
                    ? Image.network(
                        detail.posterUrl!,
                        width: 80,
                        height: 112,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 80, height: 112,
                          color: AppTheme.surfaceLight,
                          child: const Icon(Icons.movie_outlined, color: AppTheme.textMuted),
                        ),
                      )
                    : Container(
                        width: 80, height: 112,
                        color: AppTheme.surfaceLight,
                        child: const Icon(Icons.movie_outlined, color: AppTheme.textMuted),
                      ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      detail.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        _InfoBadge(
                          icon: Icons.star_rounded,
                          label: detail.scoreLabel,
                          color: AppTheme.primaryLight,
                        ),
                        const SizedBox(width: 8),
                        if (detail.status != null)
                          _InfoBadge(
                            icon: detail.isAiring ? Icons.fiber_manual_record_rounded : Icons.check_circle_outline,
                            label: detail.isAiring ? 'Airing' : detail.status!,
                            color: detail.isAiring ? AppTheme.airing : AppTheme.finished,
                          ),
                        const SizedBox(width: 8),
                        if (detail.format != null)
                          _InfoBadge(
                            icon: Icons.videocam_rounded,
                            label: detail.format!,
                            color: AppTheme.neonBlue,
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    if (detail.genres.isNotEmpty)
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: detail.genres.take(4).map((g) => _GenreChip(label: g)).toList(),
                      ),
                  ],
                ),
              ),
            ],
          ),
          if (detail.synopsis != null && detail.synopsis!.isNotEmpty) ...[
            const SizedBox(height: 12),
            AnimatedCrossFade(
              duration: const Duration(milliseconds: 200),
              crossFadeState: _expanded ? CrossFadeState.showSecond : CrossFadeState.showFirst,
              firstChild: _SynopsisPreview(
                text: detail.synopsis!,
                onTap: () => setState(() => _expanded = true),
              ),
              secondChild: _SynopsisFull(
                text: detail.synopsis!,
                onTap: () => setState(() => _expanded = false),
              ),
            ),
          ],
          const SizedBox(height: 12),
          if (detail.studio != null || detail.season != null)
            Row(
              children: [
                if (detail.studio != null)
                  _MetaChip(icon: Icons.business_rounded, label: detail.studio!),
                if (detail.studio != null && detail.season != null) const SizedBox(width: 8),
                if (detail.season != null)
                  _MetaChip(icon: Icons.calendar_month_rounded, label: detail.season!),
              ],
            ),
        ],
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _InfoBadge({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 3),
          Text(
            label,
            style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _GenreChip extends StatelessWidget {
  final String label;
  const _GenreChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
      ),
      child: Text(
        label,
        style: const TextStyle(color: AppTheme.primaryLight, fontSize: 10, fontWeight: FontWeight.w500),
      ),
    );
  }
}

class _SynopsisPreview extends StatelessWidget {
  final String text;
  final VoidCallback onTap;

  const _SynopsisPreview({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final preview = text.length > 150 ? '${text.substring(0, 150)}...' : text;
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            preview,
            style: TextStyle(color: Colors.grey[400], fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 4),
          Text(
            'Read more',
            style: TextStyle(color: AppTheme.primary.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _SynopsisFull extends StatelessWidget {
  final String text;
  final VoidCallback onTap;

  const _SynopsisFull({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            text,
            style: TextStyle(color: Colors.grey[400], fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 4),
          Text(
            'Show less',
            style: TextStyle(color: AppTheme.primary.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MetaChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: Colors.grey[500]),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(color: Colors.grey[400], fontSize: 11),
          ),
        ],
      ),
    );
  }
}
