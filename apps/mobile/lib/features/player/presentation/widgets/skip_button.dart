import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../../../core/theme/app_theme.dart';

class SkipButtons extends ConsumerWidget {
  const SkipButtons({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);
    final positionSec = state.position.inSeconds;

    final introStart = int.tryParse(state.skipIntroStart ?? '') ?? 0;
    final introEnd = int.tryParse(state.skipIntroEnd ?? '') ?? 0;
    final outroStart = int.tryParse(state.skipOutroStart ?? '') ?? 0;
    final outroEnd = int.tryParse(state.skipOutroEnd ?? '') ?? 0;

    final showIntro = state.skipIntroStart != null && state.skipIntroEnd != null &&
        introStart > 0 && introEnd > 0 &&
        positionSec >= introStart && positionSec < introEnd;

    final showOutro = state.skipOutroStart != null && state.skipOutroEnd != null &&
        outroStart > 0 && outroEnd > 0 &&
        positionSec >= outroStart && positionSec < outroEnd;

    if (!showIntro && !showOutro) return const SizedBox.shrink();

    return Positioned(
      right: 16,
      bottom: 80,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: state.controlsVisible ? 1.0 : 0.0,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showIntro)
              _SkipBtn(
                label: 'Skip Intro',
                onTap: () {
                  final s = ref.read(playerProvider.notifier);
                  if (state.skipIntroEnd != null) {
                    final pos = Duration(seconds: int.tryParse(state.skipIntroEnd!) ?? 0);
                    s.seekRelative(pos.inSeconds - state.position.inSeconds);
                  }
                },
              ),
            if (showOutro)
              const SizedBox(height: 8),
            if (showOutro)
              _SkipBtn(
                label: 'Skip Outro',
                onTap: () {
                  final s = ref.read(playerProvider.notifier);
                  if (state.skipOutroEnd != null) {
                    final pos = Duration(seconds: int.tryParse(state.skipOutroEnd!) ?? 0);
                    s.seekRelative(pos.inSeconds - state.position.inSeconds);
                  }
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _SkipBtn extends StatelessWidget {
  final String label; final VoidCallback onTap;
  const _SkipBtn({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.primary.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.primary.withValues(alpha: 0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.skip_next_rounded, color: AppTheme.primary, size: 18),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
