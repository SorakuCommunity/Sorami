import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:media_kit/media_kit.dart' hide PlayerState, SubtitleTrack;
import '../../domain/entities/player_state.dart';
import '../../domain/services/player_service.dart';

class PlayerStateNotifier extends StateNotifier<PlayerState> {
  final PlayerService _service;
  Player? _player;

  PlayerStateNotifier(this._service) : super(PlayerState());

  void setPlayer(Player player) {
    _player = player;
  }

  void setVideoUrl(String url) {
    state = state.copyWith(videoUrl: url);
  }

  void setAnimeInfo({String? id, String? title, String? episodeTitle}) {
    state = state.copyWith(
      currentAnimeId: id,
      currentAnimeTitle: title,
      currentEpisodeTitle: episodeTitle,
    );
  }

  void setEpisode(int ep) {
    state = state.copyWith(currentEpisode: ep, status: PlaybackStatus.loading);
    _resolveStream();
  }

  void setStatus(PlaybackStatus s) {
    state = state.copyWith(status: s);
    if (s == PlaybackStatus.playing) {
      _player?.play();
    } else if (s == PlaybackStatus.paused) {
      _player?.pause();
    }
  }

  void setPosition(Duration p) {
    state = state.copyWith(position: p);
  }

  void setDuration(Duration d) {
    state = state.copyWith(duration: d);
  }

  void setVolume(double v) {
    final clamped = v.clamp(0.0, 1.0);
    state = state.copyWith(volume: clamped);
    _player?.setVolume(clamped);
  }

  void setSpeed(double s) {
    state = state.copyWith(playbackSpeed: s);
    _player?.setRate(s);
  }

  void setBrightness(double b) {
    state = state.copyWith(brightness: b.clamp(0.0, 1.0));
  }

  void toggleMute() {
    final muted = !state.isMuted;
    state = state.copyWith(isMuted: muted);
    _player?.setVolume(muted ? 0.0 : state.volume);
  }

  void toggleFullscreen() {
    state = state.copyWith(isFullscreen: !state.isFullscreen);
  }

  void toggleControls() {
    state = state.copyWith(controlsVisible: !state.controlsVisible);
  }

  void showControls() {
    state = state.copyWith(controlsVisible: true);
  }

  void hideControls() {
    state = state.copyWith(controlsVisible: false);
  }

  void toggleAutoPlay() {
    state = state.copyWith(isAutoPlay: !state.isAutoPlay);
  }

  void toggleAutoNext() {
    state = state.copyWith(autoNext: !state.autoNext);
  }

  void toggleAutoSkipIntro() {
    state = state.copyWith(autoSkipIntro: !state.autoSkipIntro);
  }

  void toggleAutoSkipOutro() {
    state = state.copyWith(autoSkipOutro: !state.autoSkipOutro);
  }

  void toggleLightsOff() {
    state = state.copyWith(lightsOff: !state.lightsOff);
  }

  void setBuffering(bool b) {
    state = state.copyWith(isBuffering: b);
  }

  void setQuality(int index, String label) {
    state = state.copyWith(currentQuality: index, selectedQuality: label);
    if (index >= 0 && index < state.qualities.length) {
      final q = state.qualities[index];
      _player?.open(Media(q.url));
      state = state.copyWith(videoUrl: q.url);
    }
  }

  void setSubtitle(int index, String label) {
    state = state.copyWith(currentSubtitle: index, selectedSubtitle: label);
  }

  void setServer(int index, String name) {
    state = state.copyWith(currentServer: index, selectedServer: name);
  }

  void setQualities(List<VideoQuality> q) {
    state = state.copyWith(qualities: q);
  }

  void setSubtitles(List<SubtitleTrack> s) {
    state = state.copyWith(subtitles: s);
  }

  void setServers(List<StreamingServer> s) {
    state = state.copyWith(servers: s);
  }

  void refreshServers() {
    final updated = state.servers.map((s) {
      if (!s.isActive) return s;
      final jitter = (DateTime.now().millisecondsSinceEpoch % 20 - 10);
      final newPing = (s.ping + jitter).clamp(5, 300);
      return StreamingServer(name: s.name, baseUrl: s.baseUrl, isActive: s.isActive, ping: newPing);
    }).toList();
    state = state.copyWith(servers: updated);
  }

  void setEpisodeList(List<EpisodeInfo> e) {
    state = state.copyWith(episodeList: e);
  }

  void setError(String msg) {
    state = state.copyWith(status: PlaybackStatus.error, errorMessage: msg);
  }

  void showToast(String msg) {
    state = state.copyWith(toastMessage: msg);
  }

  void clearToast() {
    state = state.copyWith(toastMessage: null);
  }

  void setSkipIntro(String? start, String? end) {
    state = state.copyWith(skipIntroStart: start, skipIntroEnd: end);
  }

  void setSkipOutro(String? start, String? end) {
    state = state.copyWith(skipOutroStart: start, skipOutroEnd: end);
  }

  Future<void> _resolveStream() async {
    if (state.currentAnimeId == null) return;
    state = state.copyWith(videoUrl: null);
    final url = await _service.resolveStreamUrl(state.currentAnimeId!, state.currentEpisode);
    if (url != null) {
      state = state.copyWith(videoUrl: url, status: PlaybackStatus.playing);
      _player?.open(Media(url));
      if (state.isAutoPlay) _player?.play();
    } else {
      state = state.copyWith(
        errorMessage: 'No streamable URL found for episode ${state.currentEpisode}',
        status: PlaybackStatus.error,
      );
    }
  }

  Future<void> initPlayer(String animeId, int episode) async {
    state = state.copyWith(currentAnimeId: animeId, currentEpisode: episode, status: PlaybackStatus.loading);

    final results = await Future.wait([
      _service.getAnimeDetail(animeId),
      _service.getEpisodes(animeId),
      _resolveStreamUrl(animeId, episode),
    ]);

    final detail = results[0] as Map<String, dynamic>?;
    final episodes = results[1] as List<Map<String, dynamic>>;
    final url = results[2] as String?;

    if (detail != null) {
      state = state.copyWith(
        animeDetail: AnimeDetail.fromSourceDetail(detail),
        currentAnimeTitle: detail['title'] as String?,
      );
    }

    if (episodes.isNotEmpty) {
      state = state.copyWith(
        episodeList: episodes
            .map((e) => EpisodeInfo.fromSourceEpisode(e, currentEpisode: episode))
            .toList(),
      );
    }

    if (url != null) {
      state = state.copyWith(videoUrl: url, status: PlaybackStatus.playing);
      _player?.open(Media(url));
      if (state.isAutoPlay) _player?.play();
    } else {
      state = state.copyWith(
        errorMessage: 'No streamable URL found for episode $episode',
        status: PlaybackStatus.error,
      );
    }
  }

  Future<String?> _resolveStreamUrl(String animeId, int episode) async {
    return _service.resolveStreamUrl(animeId, episode);
  }

  void togglePlayPause() {
    if (state.status == PlaybackStatus.playing) {
      _player?.pause();
      state = state.copyWith(status: PlaybackStatus.paused);
    } else {
      _player?.play();
      state = state.copyWith(status: PlaybackStatus.playing);
    }
  }

  void seekRelative(int seconds) {
    final pos = _player?.state.position ?? state.position;
    final newPos = pos + Duration(seconds: seconds);
    final clamped = newPos < Duration.zero
        ? Duration.zero
        : newPos > state.duration
            ? state.duration
            : newPos;
    _player?.seek(clamped);
    state = state.copyWith(position: clamped);
  }

  void seekToFraction(double fraction) {
    final pos = Duration(milliseconds: (state.duration.inMilliseconds * fraction).round());
    final clamped = pos < Duration.zero
        ? Duration.zero
        : pos > state.duration
            ? state.duration
            : pos;
    _player?.seek(clamped);
    state = state.copyWith(position: clamped);
  }

  void prevEpisode() {
    if (state.currentEpisode > 1) setEpisode(state.currentEpisode - 1);
  }

  void nextEpisode() {
    if (state.currentEpisode < state.episodeList.length) setEpisode(state.currentEpisode + 1);
  }
}

final playerProvider = StateNotifierProvider<PlayerStateNotifier, PlayerState>((ref) {
  return PlayerStateNotifier(PlayerService());
});
