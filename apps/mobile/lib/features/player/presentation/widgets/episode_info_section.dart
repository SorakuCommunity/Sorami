import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';

class EpisodeInfoSection extends ConsumerWidget {
  const EpisodeInfoSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    return Container(
      padding: const EdgeInsets.all(16),
      color: const Color(0xFF0B0B0F),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'EP ${state.currentEpisode}${state.currentEpisodeTitle != null ? ' - ${state.currentEpisodeTitle}' : ''}',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      state.currentAnimeTitle ?? 'Anime Title',
                      style: TextStyle(color: Colors.grey[500], fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _InfoChip(icon: Icons.calendar_today, label: '2024'),
                        const SizedBox(width: 8),
                        _InfoChip(icon: Icons.timer_outlined, label: '24 min'),
                        const SizedBox(width: 8),
                        _InfoChip(icon: Icons.videocam, label: '1080p'),
                      ],
                    ),
                  ],
                ),
              ),
              if (!isDesktop) ...[
                const SizedBox(width: 12),
                _ActionBtn(icon: Icons.flag_outlined, label: 'Report'),
                const SizedBox(width: 6),
                _ActionBtn(icon: Icons.download_rounded, label: 'Download'),
                const SizedBox(width: 6),
                _ActionBtn(icon: Icons.share_outlined, label: 'Share'),
              ],
            ],
          ),
          if (isDesktop) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                _ActionBtn(icon: Icons.flag_outlined, label: 'Report'),
                const SizedBox(width: 8),
                _ActionBtn(icon: Icons.download_rounded, label: 'Download'),
                const SizedBox(width: 8),
                _ActionBtn(icon: Icons.share_outlined, label: 'Share'),
                const Spacer(),
                _ServerDropdown(),
                const SizedBox(width: 8),
                _SubtitleDropdown(),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon; final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 11, color: Colors.grey[500]),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.grey[400], fontSize: 11)),
      ]),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon; final String label;
  const _ActionBtn({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14, color: Colors.grey[400]),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(color: Colors.grey[400], fontSize: 11)),
      ]),
    );
  }
}

class _ServerDropdown extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        const Text('Sorami', style: TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(width: 4),
        const Text('12ms', style: TextStyle(color: Colors.greenAccent, fontSize: 10)),
        const SizedBox(width: 4),
        Icon(Icons.expand_more, color: Colors.grey[500], size: 16),
      ]),
    );
  }
}

class _SubtitleDropdown extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        const Text('Sub: Off', style: TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(width: 4),
        Icon(Icons.expand_more, color: Colors.grey[500], size: 16),
      ]),
    );
  }
}
