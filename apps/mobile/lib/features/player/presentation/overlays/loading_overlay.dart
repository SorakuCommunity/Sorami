import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';
import '../../../../core/theme/app_theme.dart';

class PlayerCenterOverlay extends ConsumerWidget {
  const PlayerCenterOverlay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);

    if (state.status == PlaybackStatus.loading || state.isBuffering) {
      return const _LoadingIndicator();
    }

    if (state.status == PlaybackStatus.error) {
      return _ErrorOverlay(
        message: state.errorMessage ?? 'Playback error',
        onRetry: () => ref.read(playerProvider.notifier).initPlayer(
          ref.read(playerProvider).currentAnimeId ?? '',
          ref.read(playerProvider).currentEpisode,
        ),
      );
    }

    if (state.status == PlaybackStatus.paused) {
      return const _PauseOverlay();
    }

    return const SizedBox.shrink();
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.3),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 60, height: 60,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                color: AppTheme.primary.withValues(alpha: 0.8),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Loading stream...',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
      ),
    );
  }
}

class _PauseOverlay extends StatelessWidget {
  const _PauseOverlay();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 72, height: 72,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.6),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 40),
      ),
    );
  }
}

class _ErrorOverlay extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorOverlay({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withValues(alpha: 0.85),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.redAccent, size: 48),
              const SizedBox(height: 16),
              Text(message, textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70, fontSize: 14)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
