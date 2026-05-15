import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';

class EpisodeSidebar extends ConsumerWidget {
  const EpisodeSidebar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);
    final episodes = state.episodeList;

    if (episodes.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Text(
            'No episode list available',
            style: TextStyle(color: Colors.grey[600], fontSize: 14),
          ),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: episodes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 6),
      itemBuilder: (_, i) {
        final ep = episodes[i];
        return _EpisodeTile(
          episode: ep,
          isCurrent: ep.isCurrent,
          onTap: ep.isCurrent
              ? null
              : () => ref.read(playerProvider.notifier).setEpisode(ep.number),
        );
      },
    );
  }
}

class _EpisodeTile extends StatelessWidget {
  final EpisodeInfo episode;
  final bool isCurrent;
  final VoidCallback? onTap;

  const _EpisodeTile({
    required this.episode,
    required this.isCurrent,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isCurrent
              ? AppTheme.primary.withValues(alpha: 0.1)
              : Colors.white.withValues(alpha: 0.02),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isCurrent
                ? AppTheme.primary.withValues(alpha: 0.3)
                : Colors.white.withValues(alpha: 0.04),
          ),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: episode.thumbnail != null
                      ? Image.network(
                          episode.thumbnail!,
                          width: 56,
                          height: 32,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _PlaceholderThumbnail(),
                        )
                      : const _PlaceholderThumbnail(),
                ),
                if (isCurrent)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 20),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? AppTheme.primary
                              : Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: Text(
                          'EP ${episode.number}',
                          style: TextStyle(
                            color: isCurrent ? Colors.white : Colors.grey[400],
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          episode.title,
                          style: TextStyle(
                            color: isCurrent ? Colors.white : Colors.grey[400],
                            fontSize: 12,
                            fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  if (episode.duration != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      episode.duration!,
                      style: TextStyle(color: Colors.grey[600], fontSize: 10),
                    ),
                  ],
                ],
              ),
            ),
            if (episode.isWatched)
              const Icon(Icons.check_circle, size: 14, color: AppTheme.primaryLight),
            if (isCurrent)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                margin: const EdgeInsets.only(left: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'NOW',
                  style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _PlaceholderThumbnail extends StatelessWidget {
  const _PlaceholderThumbnail();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 32,
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(Icons.movie_outlined, size: 16, color: Colors.grey[700]),
    );
  }
}
