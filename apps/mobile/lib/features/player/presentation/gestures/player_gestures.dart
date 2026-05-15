import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
class PlayerGestureWrapper extends ConsumerStatefulWidget {
  final Widget child;
  const PlayerGestureWrapper({super.key, required this.child});

  @override
  ConsumerState<PlayerGestureWrapper> createState() => _PlayerGestureWrapperState();
}

class _PlayerGestureWrapperState extends ConsumerState<PlayerGestureWrapper> {
  bool _showSeekIndicator = false;
  int _seekSeconds = 0;
  double _brightnessStart = 0;
  double _volumeStart = 0;
  double _startX = 0;
  double _startY = 0;

  @override
  void initState() {
    super.initState();
    _brightnessStart = ref.read(playerProvider).brightness;
    _volumeStart = ref.read(playerProvider).volume;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => ref.read(playerProvider.notifier).toggleControls(),
      onDoubleTapDown: (d) => _startX = d.localPosition.dx,
      onDoubleTap: () {
        final centerX = MediaQuery.of(context).size.width / 2;
        if (_startX < centerX) {
          _showSeek(-10);
          ref.read(playerProvider.notifier).seekRelative(-10);
        } else {
          _showSeek(10);
          ref.read(playerProvider.notifier).seekRelative(10);
        }
      },
      onVerticalDragStart: (d) {
        _startX = d.localPosition.dx;
        _startY = d.localPosition.dy;
        _brightnessStart = ref.read(playerProvider).brightness;
        _volumeStart = ref.read(playerProvider).volume;
      },
      onVerticalDragUpdate: (d) {
        final delta = d.localPosition.dy - _startY;
        final screenH = MediaQuery.of(context).size.height;
        final pct = (-delta / screenH).clamp(-1.0, 1.0);
        if (_startX < MediaQuery.of(context).size.width / 2) {
          final b = (_brightnessStart + pct).clamp(0.0, 1.0);
          ref.read(playerProvider.notifier).setBrightness(b);
        } else {
          final v = (_volumeStart + pct).clamp(0.0, 1.0);
          ref.read(playerProvider.notifier).setVolume(v);
        }
      },
      onLongPressStart: (_) => ref.read(playerProvider.notifier).setSpeed(2.0),
      onLongPressEnd: (_) => ref.read(playerProvider.notifier).setSpeed(1.0),
      child: Stack(
        children: [
          widget.child,
          if (_showSeekIndicator)
            _SeekIndicator(seconds: _seekSeconds),
        ],
      ),
    );
  }

  void _showSeek(int seconds) {
    setState(() {
      _seekSeconds = seconds;
      _showSeekIndicator = true;
    });
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) setState(() => _showSeekIndicator = false);
    });
  }
}

class _SeekIndicator extends StatelessWidget {
  final int seconds;
  const _SeekIndicator({required this.seconds});

  @override
  Widget build(BuildContext context) {
    final isRewind = seconds < 0;
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isRewind ? Icons.replay_10_rounded : Icons.forward_10_rounded,
              color: Colors.white, size: 28,
            ),
            const SizedBox(width: 8),
            Text(
              '${isRewind ? '' : '+'}${seconds}s',
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
