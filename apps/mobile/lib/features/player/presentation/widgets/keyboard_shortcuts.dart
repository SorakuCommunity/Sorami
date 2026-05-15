import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';

class KeyboardShortcutHandler extends ConsumerStatefulWidget {
  final Widget child;
  const KeyboardShortcutHandler({super.key, required this.child});

  @override
  ConsumerState<KeyboardShortcutHandler> createState() => _KeyboardShortcutHandlerState();
}

class _KeyboardShortcutHandlerState extends ConsumerState<KeyboardShortcutHandler> {
  @override
  Widget build(BuildContext context) {
    return Focus(
      autofocus: true,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent) {
          _handleKey(event.logicalKey);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: widget.child,
    );
  }

  void _handleKey(LogicalKeyboardKey key) {
    final notifier = ref.read(playerProvider.notifier);
    final state = ref.read(playerProvider);

    if (key == LogicalKeyboardKey.space) {
      notifier.togglePlayPause();
    } else if (key == LogicalKeyboardKey.arrowLeft) {
      notifier.seekRelative(-10);
      notifier.showToast('-10s');
    } else if (key == LogicalKeyboardKey.arrowRight) {
      notifier.seekRelative(10);
      notifier.showToast('+10s');
    } else if (key == LogicalKeyboardKey.arrowUp) {
      notifier.setVolume(state.volume + 0.1);
    } else if (key == LogicalKeyboardKey.arrowDown) {
      notifier.setVolume(state.volume - 0.1);
    } else if (key == LogicalKeyboardKey.keyF) {
      notifier.toggleFullscreen();
    } else if (key == LogicalKeyboardKey.keyM) {
      notifier.toggleMute();
    } else if (key == LogicalKeyboardKey.keyN) {
      notifier.nextEpisode();
    } else if (key == LogicalKeyboardKey.keyP) {
      notifier.prevEpisode();
    } else if (key == LogicalKeyboardKey.escape) {
      notifier.toggleControls();
    }
  }
}
