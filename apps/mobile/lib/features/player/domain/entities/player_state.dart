enum PlaybackStatus { idle, loading, playing, paused, buffering, error, completed }

class PlayerState {
  PlaybackStatus status;
  Duration position;
  Duration duration;
  double volume;
  double playbackSpeed;
  double brightness;
  bool isFullscreen;
  bool isMuted;
  bool controlsVisible;
  bool isBuffering;
  bool isAutoPlay;
  bool autoNext;
  bool autoSkipIntro;
  bool autoSkipOutro;
  bool lightsOff;
  bool isPiP;
  int currentQuality;
  int currentSubtitle;
  int currentServer;
  int currentEpisode;
  String selectedQuality;
  String selectedSubtitle;
  String selectedServer;
  List<VideoQuality> qualities;
  List<SubtitleTrack> subtitles;
  List<StreamingServer> servers;
  List<EpisodeInfo> episodeList;
  AnimeDetail? animeDetail;
  String? currentAnimeId;
  String? currentAnimeTitle;
  String? currentEpisodeTitle;
  String? videoUrl;
  String? thumbnailUrl;
  String? skipIntroStart;
  String? skipIntroEnd;
  String? skipOutroStart;
  String? skipOutroEnd;
  String? errorMessage;
  String? toastMessage;

  PlayerState({
    this.status = PlaybackStatus.idle,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.volume = 1.0,
    this.playbackSpeed = 1.0,
    this.brightness = 0.0,
    this.isFullscreen = false,
    this.isMuted = false,
    this.controlsVisible = true,
    this.isBuffering = false,
    this.isAutoPlay = true,
    this.autoNext = true,
    this.autoSkipIntro = true,
    this.autoSkipOutro = true,
    this.lightsOff = false,
    this.isPiP = false,
    this.currentQuality = 0,
    this.currentSubtitle = 0,
    this.currentServer = 0,
    this.currentEpisode = 1,
    this.selectedQuality = 'Auto',
    this.selectedSubtitle = 'Off',
    this.selectedServer = 'Sorami',
    this.qualities = const [],
    this.subtitles = const [],
    this.servers = const [],
    this.episodeList = const [],
    this.animeDetail,
    this.currentAnimeId,
    this.currentAnimeTitle,
    this.currentEpisodeTitle,
    this.videoUrl,
    this.thumbnailUrl,
    this.skipIntroStart,
    this.skipIntroEnd,
    this.skipOutroStart,
    this.skipOutroEnd,
    this.errorMessage,
    this.toastMessage,
  });

  double get progress => duration.inMilliseconds > 0 ? position.inMilliseconds / duration.inMilliseconds : 0.0;
  String get positionFormatted => _fmt(position);
  String get durationFormatted => _fmt(duration);
  String get remainingFormatted => _fmt(duration - position);

  static String _fmt(Duration d) {
    final h = d.inHours;
    final m = d.inMinutes.remainder(60);
    final s = d.inSeconds.remainder(60);
    if (h > 0) return '$h:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  PlayerState copyWith({
    PlaybackStatus? status,
    Duration? position,
    Duration? duration,
    double? volume,
    double? playbackSpeed,
    double? brightness,
    bool? isFullscreen,
    bool? isMuted,
    bool? controlsVisible,
    bool? isBuffering,
    bool? isAutoPlay,
    bool? autoNext,
    bool? autoSkipIntro,
    bool? autoSkipOutro,
    bool? lightsOff,
    bool? isPiP,
    int? currentQuality,
    int? currentSubtitle,
    int? currentServer,
    int? currentEpisode,
    String? selectedQuality,
    String? selectedSubtitle,
    String? selectedServer,
    List<VideoQuality>? qualities,
    List<SubtitleTrack>? subtitles,
    List<StreamingServer>? servers,
    List<EpisodeInfo>? episodeList,
    AnimeDetail? animeDetail,
    String? currentAnimeId,
    String? currentAnimeTitle,
    String? currentEpisodeTitle,
    String? videoUrl,
    String? thumbnailUrl,
    String? skipIntroStart,
    String? skipIntroEnd,
    String? skipOutroStart,
    String? skipOutroEnd,
    String? errorMessage,
    String? toastMessage,
  }) {
    return PlayerState(
      status: status ?? this.status,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      volume: volume ?? this.volume,
      playbackSpeed: playbackSpeed ?? this.playbackSpeed,
      brightness: brightness ?? this.brightness,
      isFullscreen: isFullscreen ?? this.isFullscreen,
      isMuted: isMuted ?? this.isMuted,
      controlsVisible: controlsVisible ?? this.controlsVisible,
      isBuffering: isBuffering ?? this.isBuffering,
      isAutoPlay: isAutoPlay ?? this.isAutoPlay,
      autoNext: autoNext ?? this.autoNext,
      autoSkipIntro: autoSkipIntro ?? this.autoSkipIntro,
      autoSkipOutro: autoSkipOutro ?? this.autoSkipOutro,
      lightsOff: lightsOff ?? this.lightsOff,
      isPiP: isPiP ?? this.isPiP,
      currentQuality: currentQuality ?? this.currentQuality,
      currentSubtitle: currentSubtitle ?? this.currentSubtitle,
      currentServer: currentServer ?? this.currentServer,
      currentEpisode: currentEpisode ?? this.currentEpisode,
      selectedQuality: selectedQuality ?? this.selectedQuality,
      selectedSubtitle: selectedSubtitle ?? this.selectedSubtitle,
      selectedServer: selectedServer ?? this.selectedServer,
      qualities: qualities ?? this.qualities,
      subtitles: subtitles ?? this.subtitles,
      servers: servers ?? this.servers,
      episodeList: episodeList ?? this.episodeList,
      animeDetail: animeDetail ?? this.animeDetail,
      currentAnimeId: currentAnimeId ?? this.currentAnimeId,
      currentAnimeTitle: currentAnimeTitle ?? this.currentAnimeTitle,
      currentEpisodeTitle: currentEpisodeTitle ?? this.currentEpisodeTitle,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      skipIntroStart: skipIntroStart ?? this.skipIntroStart,
      skipIntroEnd: skipIntroEnd ?? this.skipIntroEnd,
      skipOutroStart: skipOutroStart ?? this.skipOutroStart,
      skipOutroEnd: skipOutroEnd ?? this.skipOutroEnd,
      errorMessage: errorMessage ?? this.errorMessage,
      toastMessage: toastMessage ?? this.toastMessage,
    );
  }
}

class VideoQuality {
  final String label;
  final String url;
  final bool isDefault;
  const VideoQuality({required this.label, required this.url, this.isDefault = false});
}

class SubtitleTrack {
  final String label;
  final String url;
  final String language;
  final bool isDefault;
  const SubtitleTrack({required this.label, required this.url, required this.language, this.isDefault = false});
}

class StreamingServer {
  final String name;
  final String baseUrl;
  final bool isActive;
  final int ping;
  const StreamingServer({required this.name, required this.baseUrl, this.isActive = true, this.ping = 0});
}

class AnimeDetail {
  final String title;
  final String? synopsis;
  final String? posterUrl;
  final List<String> genres;
  final double? score;
  final String? status;
  final String? season;
  final String? studio;
  final String? format;
  final int? totalEpisodes;
  final int? averageScore;

  const AnimeDetail({
    required this.title,
    this.synopsis,
    this.posterUrl,
    this.genres = const [],
    this.score,
    this.status,
    this.season,
    this.studio,
    this.format,
    this.totalEpisodes,
    this.averageScore,
  });

  factory AnimeDetail.fromSourceDetail(Map<String, dynamic> json) {
    return AnimeDetail(
      title: json['title'] as String? ?? '',
      synopsis: json['synopsis'] as String?,
      posterUrl: json['posterUrl'] as String?,
      genres: (json['genres'] as List<dynamic>?)?.cast<String>() ?? [],
      score: (json['score'] as num?)?.toDouble(),
      status: json['status'] as String?,
      season: json['season'] as String?,
      studio: json['studio'] as String?,
      format: json['format'] as String?,
      totalEpisodes: json['totalEpisodes'] as int?,
      averageScore: json['averageScore'] as int?,
    );
  }

  bool get isAiring => status == 'RELEASING';
  String get scoreLabel => score != null ? (score! / 10).toStringAsFixed(1) : 'N/A';
}

class EpisodeInfo {
  final int number;
  final String title;
  final String? thumbnail;
  final String? duration;
  final String? episodePageUrl;
  final bool isWatched;
  final bool isCurrent;
  const EpisodeInfo({
    required this.number,
    required this.title,
    this.thumbnail,
    this.duration,
    this.episodePageUrl,
    this.isWatched = false,
    this.isCurrent = false,
  });

  factory EpisodeInfo.fromSourceEpisode(Map<String, dynamic> json, {int currentEpisode = 1}) {
    return EpisodeInfo(
      number: json['number'] as int? ?? 0,
      title: json['title'] as String? ?? 'Episode ${json['number'] ?? 0}',
      duration: json['duration']?.toString(),
      episodePageUrl: json['episodePageUrl'] as String?,
      isWatched: false,
      isCurrent: (json['number'] as int?) == currentEpisode,
    );
  }
}
