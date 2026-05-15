import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:media_kit/media_kit.dart' hide PlayerState;
import 'package:media_kit_video/media_kit_video.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';
import '../widgets/player_top_bar.dart';
import '../widgets/player_bottom_controls.dart';
import '../overlays/loading_overlay.dart';
import '../widgets/skip_button.dart';
import '../widgets/episode_info_section.dart';
import '../widgets/episode_sidebar.dart';
import '../widgets/anime_detail_section.dart';
import '../widgets/keyboard_shortcuts.dart';
import '../gestures/player_gestures.dart';
import '../../../../core/theme/app_theme.dart';

class PlayerScreen extends ConsumerStatefulWidget {
  final String animeId;
  final String slug;
  final int episodeNumber;

  const PlayerScreen({
    super.key,
    required this.animeId,
    this.slug = '',
    required this.episodeNumber,
  });

  @override
  ConsumerState<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends ConsumerState<PlayerScreen> {
  late final Player _player;
  late final VideoController _videoController;
  int _selectedTabIndex = 0;
  Timer? _hideTimer;
  StreamSubscription? _posSub;
  StreamSubscription? _durSub;
  StreamSubscription? _bufSub;
  StreamSubscription? _errSub;
  StreamSubscription? _compSub;
  StreamSubscription? _stateSub;

  @override
  void initState() {
    super.initState();
    _player = Player();
    _videoController = VideoController(_player);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initPlayer();
    });
  }

  void _initPlayer() {
    final notifier = ref.read(playerProvider.notifier);
    notifier.setPlayer(_player);
    notifier.initPlayer(widget.slug.isNotEmpty ? widget.slug : widget.animeId, widget.episodeNumber);

    _posSub = _player.stream.position.listen((pos) {
      if (!mounted) return;
      ref.read(playerProvider.notifier).setPosition(pos);
    });

    _durSub = _player.stream.duration.listen((dur) {
      if (!mounted) return;
      ref.read(playerProvider.notifier).setDuration(dur);
    });

    _bufSub = _player.stream.buffering.listen((buf) {
      if (!mounted) return;
      ref.read(playerProvider.notifier).setBuffering(buf);
      if (buf) {
        ref.read(playerProvider.notifier).setStatus(PlaybackStatus.buffering);
      } else {
        final cur = ref.read(playerProvider);
        if (cur.status == PlaybackStatus.buffering) {
          ref.read(playerProvider.notifier).setStatus(PlaybackStatus.playing);
        }
      }
    });

    _errSub = _player.stream.error.listen((e) {
      if (!mounted) return;
      ref.read(playerProvider.notifier).setError(e.toString());
    });

    _compSub = _player.stream.completed.listen((_) {
      if (!mounted) return;
      ref.read(playerProvider.notifier).setStatus(PlaybackStatus.completed);
      final cur = ref.read(playerProvider);
      if (cur.autoNext && cur.currentEpisode < cur.episodeList.length) {
        ref.read(playerProvider.notifier).nextEpisode();
      }
    });

    _stateSub = _player.stream.playing.listen((isPlaying) {
      if (!mounted) return;
      if (isPlaying) {
        ref.read(playerProvider.notifier).setStatus(PlaybackStatus.playing);
        _startHideTimer();
      } else {
        ref.read(playerProvider.notifier).setStatus(PlaybackStatus.paused);
        _cancelHideTimer();
      }
    });
  }

  void _startHideTimer() {
    _cancelHideTimer();
    _hideTimer = Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      final cur = ref.read(playerProvider);
      if (cur.status == PlaybackStatus.playing) {
        ref.read(playerProvider.notifier).hideControls();
      }
    });
  }

  void _cancelHideTimer() {
    _hideTimer?.cancel();
    _hideTimer = null;
  }

  void _onUserInteraction() {
    ref.read(playerProvider.notifier).showControls();
    final cur = ref.read(playerProvider);
    if (cur.status == PlaybackStatus.playing) {
      _startHideTimer();
    }
  }

  @override
  void dispose() {
    _cancelHideTimer();
    _posSub?.cancel();
    _durSub?.cancel();
    _bufSub?.cancel();
    _errSub?.cancel();
    _compSub?.cancel();
    _stateSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(playerProvider);
    final isFullscreen = state.isFullscreen;

    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardShortcutHandler(
        child: isFullscreen
            ? _buildFullscreenBody(state)
            : _buildNormalBody(state),
      ),
    );
  }

  Widget _buildFullscreenBody(PlayerState state) {
    return GestureDetector(
      onTap: _onUserInteraction,
      child: _buildVideoArea(state),
    );
  }

  Widget _buildNormalBody(PlayerState state) {
    return Column(
      children: [
        GestureDetector(
          onTap: _onUserInteraction,
          child: _buildVideoArea(state),
        ),
        _buildContentSection(state),
      ],
    );
  }

  Widget _buildContentSection(PlayerState state) {
    return Expanded(
      child: Container(
        color: const Color(0xFF0B0B0F),
        child: Column(
          children: [
            _buildTabBar(),
            Expanded(
              child: IndexedStack(
                index: _selectedTabIndex,
                children: const [
                  EpisodeSidebar(),
                  AnimeDetailSection(),
                  _InfoTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    final tabs = ['Episodes', 'Details', 'Info'];
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0B0B0F),
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: List.generate(tabs.length, (i) {
          final isSelected = _selectedTabIndex == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTabIndex = i),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isSelected ? AppTheme.primary : Colors.transparent,
                      width: 2,
                    ),
                  ),
                ),
                child: Text(
                  tabs[i],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[600],
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildVideoArea(PlayerState state) {
    final isFullscreen = state.isFullscreen;

    return SizedBox(
      height: isFullscreen
          ? MediaQuery.of(context).size.height
          : MediaQuery.of(context).size.width * 0.5625,
      child: PlayerGestureWrapper(
        child: RepaintBoundary(
          child: ExcludeSemantics(
            child: Stack(
              clipBehavior: Clip.hardEdge,
              children: [
                RepaintBoundary(
                  child: Video(
                    controller: _videoController,
                    fill: Colors.black,
                  ),
                ),
                PlayerCenterOverlay(),
                SkipButtons(),
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: PlayerTopBar(),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: PlayerBottomControls(),
                ),
                if (state.toastMessage != null)
                  Positioned(
                    top: MediaQuery.of(context).padding.top + 100,
                    left: 0,
                    right: 0,
                    child: _ToastMessage(message: state.toastMessage!),
                  ),
                if (state.lightsOff)
                  Positioned.fill(
                    child: IgnorePointer(
                      child: Container(color: Colors.black.withValues(alpha: 0.85)),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoTab extends ConsumerWidget {
  const _InfoTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        EpisodeInfoSection(),
        const SizedBox(height: 16),
        AnimeDetailSection(),
      ],
    );
  }
}

class _ToastMessage extends StatefulWidget {
  final String message;
  const _ToastMessage({required this.message});

  @override
  State<_ToastMessage> createState() => _ToastMessageState();
}

class _ToastMessageState extends State<_ToastMessage> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    _controller.forward();
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _controller.reverse();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.75),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            widget.message,
            style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ),
      ),
    );
  }
}
