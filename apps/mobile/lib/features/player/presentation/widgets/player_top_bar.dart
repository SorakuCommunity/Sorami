import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';
import '../../../../core/theme/app_theme.dart';
import 'quality_selector.dart';
import 'subtitle_selector.dart';
import 'server_selector.dart';

class PlayerTopBar extends ConsumerWidget {
  const PlayerTopBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 300),
      opacity: state.controlsVisible ? 1.0 : 0.0,
      child: Container(
        padding: EdgeInsets.only(
          top: MediaQuery.of(context).padding.top + 8,
          left: 8,
          right: 8,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.black.withValues(alpha: 0.85),
              Colors.transparent,
            ],
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                _IconBtn(
                  icon: Icons.arrow_back_rounded,
                  onTap: () => Navigator.of(context).pop(),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        state.currentAnimeTitle ?? 'Anime Title',
                        style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (state.currentEpisodeTitle != null)
                        Text(
                          'EP ${state.currentEpisode} - ${state.currentEpisodeTitle}',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 11),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                const Spacer(),
                _IconBtn(
                  icon: Icons.skip_previous_rounded,
                  onTap: state.currentEpisode > 1
                      ? () => ref.read(playerProvider.notifier).prevEpisode()
                      : null,
                ),
                _IconBtn(
                  icon: Icons.skip_next_rounded,
                  onTap: () => ref.read(playerProvider.notifier).nextEpisode(),
                ),
                _IconBtn(
                  icon: Icons.list_rounded,
                  onTap: () => _showEpisodeList(context, ref, state),
                ),
                _IconBtn(
                  icon: state.lightsOff ? Icons.lightbulb : Icons.lightbulb_outline,
                  onTap: () => ref.read(playerProvider.notifier).toggleLightsOff(),
                  active: state.lightsOff,
                ),
                _SettingsBtn(icon: Icons.more_vert_rounded),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                _ToggleChip(
                  label: 'AutoPlay',
                  value: state.isAutoPlay,
                  onToggle: () => ref.read(playerProvider.notifier).toggleAutoPlay(),
                ),
                const SizedBox(width: 4),
                _ToggleChip(
                  label: 'AutoNext',
                  value: state.autoNext,
                  onToggle: () => ref.read(playerProvider.notifier).toggleAutoNext(),
                ),
                const SizedBox(width: 4),
                _ToggleChip(
                  label: 'Skip Intro',
                  value: state.autoSkipIntro,
                  onToggle: () => ref.read(playerProvider.notifier).toggleAutoSkipIntro(),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

void _showEpisodeList(BuildContext context, WidgetRef ref, PlayerState state) {
  final notifier = ref.read(playerProvider.notifier);
  showModalBottomSheet(
    context: context,
    backgroundColor: const Color(0xFF111111),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) => SizedBox(
      height: MediaQuery.of(context).size.height * 0.6,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'Episodes',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (state.currentAnimeTitle != null)
                  Text(
                    state.currentAnimeTitle!,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
          ),
          const Divider(color: Colors.white12, height: 1),
          Expanded(
            child: state.episodeList.isEmpty
                ? Center(
                    child: Text(
                      'No episode list available',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: state.episodeList.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 6),
                    itemBuilder: (_, i) {
                      final ep = state.episodeList[i];
                      final isCurrent = ep.number == state.currentEpisode;
                      return GestureDetector(
                        onTap: isCurrent ? null : () {
                          notifier.setEpisode(ep.number);
                          Navigator.of(ctx).pop();
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: isCurrent
                                ? AppTheme.primary.withValues(alpha: 0.15)
                                : AppTheme.surfaceLight,
                            borderRadius: BorderRadius.circular(8),
                            border: isCurrent
                                ? Border.all(color: AppTheme.primary.withValues(alpha: 0.3))
                                : null,
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isCurrent ? AppTheme.primary : Colors.white.withValues(alpha: 0.08),
                                ),
                                child: Center(
                                  child: Text(
                                    '${ep.number}',
                                    style: TextStyle(
                                      color: isCurrent
                                          ? Colors.white
                                          : Colors.white.withValues(alpha: 0.6),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  ep.title,
                                  style: TextStyle(
                                    color: isCurrent
                                        ? Colors.white
                                        : Colors.white.withValues(alpha: 0.8),
                                    fontSize: 13,
                                    fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w400,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (ep.isWatched)
                                Icon(
                                  Icons.check_circle,
                                  size: 16,
                                  color: AppTheme.primaryLight.withValues(alpha: 0.6),
                                ),
                              if (isCurrent)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'NOW',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    ),
  );
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final bool active;

  const _IconBtn({required this.icon, this.onTap, this.active = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      decoration: BoxDecoration(
        color: (active ? AppTheme.primary : Colors.black26).withValues(
          alpha: active ? 0.8 : 0.4,
        ),
        borderRadius: BorderRadius.circular(8),
      ),
      child: IconButton(
        icon: Icon(icon, color: active ? Colors.white : Colors.white70, size: 20),
        onPressed: onTap ?? () {},
        padding: const EdgeInsets.all(8),
        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
      ),
    );
  }
}

class _ToggleChip extends StatelessWidget {
  final String label;
  final bool value;
  final VoidCallback onToggle;

  const _ToggleChip({required this.label, required this.value, required this.onToggle});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onToggle,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: (value ? AppTheme.primary : Colors.white).withValues(
            alpha: value ? 0.3 : 0.08,
          ),
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: (value ? AppTheme.primary : Colors.white).withValues(
              alpha: value ? 0.5 : 0.1,
            ),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: value ? Colors.white : Colors.white60,
            fontSize: 10,
          ),
        ),
      ),
    );
  }
}

class _SettingsBtn extends StatelessWidget {
  final IconData icon;

  const _SettingsBtn({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      decoration: BoxDecoration(
        color: Colors.black26.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(8),
      ),
      child: IconButton(
        icon: Icon(icon, color: Colors.white70, size: 20),
        onPressed: () => _showSettings(context),
        padding: const EdgeInsets.all(8),
        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
      ),
    );
  }

  void _showSettings(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111111),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => const _SettingsSheet(),
    );
  }
}

class _SettingsSheet extends ConsumerWidget {
  const _SettingsSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[700],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Playback Settings',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          _SettingRow(
            label: 'Playback Speed',
            child: _SpeedSelector(),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () {
              final ctx = context;
              Navigator.of(ctx).pop();
              Future.delayed(const Duration(milliseconds: 100), () {
                if (!ctx.mounted) return;
                QualitySelectorSheet.show(ctx);
              });
            },
            child: _SettingRow(
              label: 'Quality',
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      state.selectedQuality,
                      style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.chevron_right, color: Colors.grey[600], size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () {
              final ctx = context;
              Navigator.of(ctx).pop();
              Future.delayed(const Duration(milliseconds: 100), () {
                if (!ctx.mounted) return;
                SubtitleSelectorSheet.show(ctx);
              });
            },
            child: _SettingRow(
              label: 'Subtitle',
              child: Row(
                children: [
                  Text(
                    state.selectedSubtitle,
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.chevron_right, color: Colors.grey[600], size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () {
              final ctx = context;
              Navigator.of(ctx).pop();
              Future.delayed(const Duration(milliseconds: 100), () {
                if (!ctx.mounted) return;
                ServerSelectorSheet.show(ctx);
              });
            },
            child: _SettingRow(
              label: 'Streaming Server',
              child: Row(
                children: [
                  Container(
                    width: 6, height: 6,
                    decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    state.selectedServer,
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(width: 4),
                  Icon(Icons.chevron_right, color: Colors.grey[600], size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final String label;
  final Widget child;

  const _SettingRow({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)),
        child,
      ],
    );
  }
}

class _SpeedSelector extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentSpeed = ref.watch(playerProvider).playbackSpeed;
    final speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

    return SizedBox(
      height: 32,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        itemCount: speeds.length,
        separatorBuilder: (_, __) => const SizedBox(width: 4),
        itemBuilder: (ctx, i) {
          final isSelected = speeds[i] == currentSpeed;
          return GestureDetector(
            onTap: () {
              ref.read(playerProvider.notifier).setSpeed(speeds[i]);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppTheme.primary.withValues(alpha: 0.3)
                    : Colors.white.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: isSelected ? AppTheme.primary : Colors.white.withValues(alpha: 0.1),
                ),
              ),
              alignment: Alignment.center,
              child: Text(
                '${speeds[i]}x',
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.white60,
                  fontSize: 11,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
