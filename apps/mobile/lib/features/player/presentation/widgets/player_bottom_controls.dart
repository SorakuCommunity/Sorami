import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';
import '../../../../core/theme/app_theme.dart';
import 'quality_selector.dart';
import 'subtitle_selector.dart';
import 'server_selector.dart';

class PlayerBottomControls extends ConsumerStatefulWidget {
  const PlayerBottomControls({super.key});

  @override
  ConsumerState<PlayerBottomControls> createState() => _PlayerBottomControlsState();
}

class _PlayerBottomControlsState extends ConsumerState<PlayerBottomControls> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(playerProvider);
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= 900;

    return AnimatedOpacity(
      duration: const Duration(milliseconds: 300),
      opacity: state.controlsVisible ? 1.0 : 0.0,
      child: Container(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          bottom: MediaQuery.of(context).padding.bottom + 8,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black.withValues(alpha: 0.9),
              Colors.transparent,
            ],
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _ProgressBar(state: state),
            const SizedBox(height: 6),
            Row(
              children: [
                Text(
                  state.positionFormatted,
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontFeatures: [FontFeature.tabularFigures()]),
                ),
                Expanded(
                  child: GestureDetector(
                    onTapDown: (details) {
                      final renderBox = context.findRenderObject() as RenderBox;
                      final localPos = renderBox.globalToLocal(details.globalPosition);
                      final barWidth = MediaQuery.of(context).size.width - 100;
                      final fraction = (localPos.dx / barWidth).clamp(0.0, 1.0);
                      ref.read(playerProvider.notifier).seekToFraction(fraction);
                    },
                    child: Container(
                      height: 20,
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                      alignment: Alignment.center,
                      child: LayoutBuilder(
                        builder: (ctx, constraints) {
                          final pct = state.progress.clamp(0.0, 1.0);
                          return Stack(
                            children: [
                              Container(
                                height: 3,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              Container(
                                height: 3,
                                width: constraints.maxWidth * pct,
                                decoration: BoxDecoration(
                                  color: AppTheme.primary,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              if (pct > 0 && pct < 1)
                                Positioned(
                                  left: constraints.maxWidth * pct - 5,
                                  top: -2,
                                  child: Container(
                                    width: 7,
                                    height: 7,
                                    decoration: const BoxDecoration(
                                      color: AppTheme.primary,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                            ],
                          );
                        },
                      ),
                    ),
                  ),
                ),
                Text(
                  '-${state.remainingFormatted}',
                  style: const TextStyle(color: Colors.white70, fontSize: 11, fontFeatures: [FontFeature.tabularFigures()]),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                _ControlBtn(
                  icon: state.isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
                  onTap: () => ref.read(playerProvider.notifier).toggleMute(),
                ),
                const SizedBox(width: 4),
                SizedBox(
                  width: isDesktop ? 80 : 60,
                  child: SliderTheme(
                    data: SliderThemeData(
                      trackHeight: 3,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 5),
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                      activeTrackColor: AppTheme.primary,
                      inactiveTrackColor: Colors.white.withValues(alpha: 0.15),
                      thumbColor: AppTheme.primary,
                      overlayColor: AppTheme.primary.withValues(alpha: 0.12),
                    ),
                    child: Slider(
                      value: state.volume,
                      onChanged: (v) => ref.read(playerProvider.notifier).setVolume(v),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                _ControlBtn(
                  icon: Icons.hd_rounded,
                  onTap: () => QualitySelectorSheet.show(context),
                  label: state.selectedQuality,
                ),
                const SizedBox(width: 4),
                _ControlBtn(
                  icon: Icons.subtitles_rounded,
                  onTap: () => SubtitleSelectorSheet.show(context),
                  label: state.selectedSubtitle == 'Off' ? 'Sub' : state.selectedSubtitle,
                ),
                const SizedBox(width: 4),
                _ControlBtn(
                  icon: Icons.dns_rounded,
                  onTap: () => ServerSelectorSheet.show(context),
                  label: state.selectedServer,
                ),
                const Spacer(),
                if (isDesktop) ...[
                  _ControlBtn(icon: Icons.brightness_6_rounded, onTap: () {}),
                  const SizedBox(width: 4),
                  _ControlBtn(icon: Icons.screenshot_monitor_rounded, onTap: () {}),
                  const SizedBox(width: 4),
                ],
                _ControlBtn(
                  icon: state.isFullscreen
                      ? Icons.fullscreen_exit_rounded
                      : Icons.fullscreen_rounded,
                  onTap: () => ref.read(playerProvider.notifier).toggleFullscreen(),
                ),
              ],
            ),
            const SizedBox(height: 4),
          ],
        ),
      ),
    );
  }
}

class _ProgressBar extends StatelessWidget {
  final PlayerState state;
  const _ProgressBar({required this.state});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (d) {
        final box = context.findRenderObject() as RenderBox;
        final pos = box.globalToLocal(d.globalPosition);
        final fraction = (pos.dx / box.size.width).clamp(0.0, 1.0);
        context.findAncestorStateOfType<_PlayerBottomControlsState>()
            ?.ref
            .read(playerProvider.notifier)
            .seekToFraction(fraction);
      },
      child: Container(
        height: 24,
        alignment: Alignment.center,
        child: LayoutBuilder(
          builder: (ctx, constraints) {
            final pct = state.progress.clamp(0.0, 1.0);
            return Stack(
              children: [
                Container(
                  height: 3,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Container(
                  height: 3,
                  width: constraints.maxWidth * pct,
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                if (pct > 0 && pct < 1)
                  Positioned(
                    left: constraints.maxWidth * pct - 5,
                    top: -2,
                    child: Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: AppTheme.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _ControlBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String? label;

  const _ControlBtn({
    required this.icon,
    required this.onTap,
    this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black26.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(8),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white, size: 16),
                if (label != null) ...[
                  const SizedBox(width: 4),
                  Text(
                    label!,
                    style: const TextStyle(color: Colors.white70, fontSize: 10),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
