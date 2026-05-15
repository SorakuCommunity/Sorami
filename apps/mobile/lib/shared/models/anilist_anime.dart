class AniListAnime {
  final int id;
  final String titleRomaji;
  final String? titleEnglish;
  final String? titleNative;
  final String? bannerImage;
  final String? coverLarge;
  final String? coverMedium;
  final List<String> genres;
  final List<Tag> tags;
  final String format;
  final int? episodes;
  final int? duration;
  final int? averageScore;
  final int? meanScore;
  final int? popularity;
  final int? favourites;
  final String season;
  final int? seasonYear;
  final String status;
  final String? description;
  final List<String> studios;
  final NextAiringEpisode? nextEpisode;
  final String? source;
  final String? trailerId;
  final String? trailerSite;
  final String? trailerThumbnail;
  final List<String> synonyms;
  final AnimeDate? startDate;
  final AnimeDate? endDate;
  final String? countryOfOrigin;
  final String? hashtag;
  final List<ExternalLink> externalLinks;
  final List<Ranking> rankings;
  final List<CharacterEdge> characters;
  final List<MediaEdge> relations;
  final List<AniListAnime> recommendations;

  const AniListAnime({
    required this.id,
    required this.titleRomaji,
    this.titleEnglish,
    this.titleNative,
    this.bannerImage,
    this.coverLarge,
    this.coverMedium,
    this.genres = const [],
    this.tags = const [],
    this.format = 'TV',
    this.episodes,
    this.duration,
    this.averageScore,
    this.meanScore,
    this.popularity,
    this.favourites,
    this.season = '',
    this.seasonYear,
    this.status = 'FINISHED',
    this.description,
    this.studios = const [],
    this.nextEpisode,
    this.source,
    this.trailerId,
    this.trailerSite,
    this.trailerThumbnail,
    this.synonyms = const [],
    this.startDate,
    this.endDate,
    this.countryOfOrigin,
    this.hashtag,
    this.externalLinks = const [],
    this.rankings = const [],
    this.characters = const [],
    this.relations = const [],
    this.recommendations = const [],
  });

  String get displayTitle => titleEnglish ?? titleRomaji;
  String get formatLabel => format;

  String get statusLabel {
    switch (status) {
      case 'RELEASING': return 'Airing';
      case 'FINISHED': return 'Finished';
      case 'NOT_YET_RELEASED': return 'Upcoming';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  String get seasonLabel => seasonYear != null ? '$season $seasonYear' : season;

  String get airedString {
    if (startDate == null) return 'Unknown';
    final s = startDate!;
    if (endDate == null) {
      return '${s.month}/${s.year}';
    }
    final e = endDate!;
    return '${s.month}/${s.year} - ${e.month}/${e.year}';
  }

  factory AniListAnime.fromJson(Map<String, dynamic> json) {
    final title = json['title'] as Map<String, dynamic>? ?? {};
    final studiosData = json['studios'] as Map<String, dynamic>?;
    final studiosNodes = studiosData?['nodes'] as List<dynamic>? ?? [];
    final nextAiring = json['nextAiringEpisode'] as Map<String, dynamic>?;
    final descriptionRaw = json['description'] as String? ?? '';
    final coverImage = json['coverImage'] as Map<String, dynamic>?;
    final trailer = json['trailer'] as Map<String, dynamic>?;
    final startDateJson = json['startDate'] as Map<String, dynamic>?;
    final endDateJson = json['endDate'] as Map<String, dynamic>?;
    final extLinks = json['externalLinks'] as List<dynamic>? ?? [];
    final rankingsJson = json['rankings'] as List<dynamic>? ?? [];

    // Characters
    final characters = <CharacterEdge>[];
    final charactersData = json['characters'] as Map<String, dynamic>?;
    if (charactersData != null) {
      final edges = charactersData['edges'] as List<dynamic>? ?? [];
      for (final e in edges) {
        final m = e as Map<String, dynamic>;
        final node = m['node'] as Map<String, dynamic>?;
        if (node != null) {
          characters.add(CharacterEdge(
            id: node['id'] as int? ?? 0,
            name: _nameFromJson(node['name']),
            image: node['image'] is Map ? node['image']['large'] as String? : null,
            role: m['role'] as String? ?? '',
            voiceActors: _vaFromJson(m['voiceActors']),
          ));
        }
      }
    }

    // Relations
    final relations = <MediaEdge>[];
    final relationsData = json['relations'] as Map<String, dynamic>?;
    if (relationsData != null) {
      final edges = relationsData['edges'] as List<dynamic>? ?? [];
      for (final e in edges) {
        final m = e as Map<String, dynamic>;
        final node = m['node'] as Map<String, dynamic>?;
        if (node != null) {
          relations.add(MediaEdge(
            id: node['id'] as int? ?? 0,
            title: _titleFromJson(node['title']),
            coverLarge: node['coverImage'] is Map ? node['coverImage']['large'] as String? : null,
            format: node['format'] as String? ?? '',
            relationType: m['relationType'] as String? ?? '',
          ));
        }
      }
    }

    // Recommendations
    final recs = <AniListAnime>[];
    final recsData = json['recommendations'] as Map<String, dynamic>?;
    if (recsData != null) {
      final nodes = recsData['nodes'] as List<dynamic>? ?? [];
      for (final n in nodes) {
        final m = n as Map<String, dynamic>;
        final rec = m['mediaRecommendation'] as Map<String, dynamic>?;
        if (rec != null) {
          recs.add(AniListAnime.fromJson(rec));
        }
      }
    }

    return AniListAnime(
      id: json['id'] as int? ?? 0,
      titleRomaji: title['romaji'] as String? ?? 'Unknown',
      titleEnglish: title['english'] as String?,
      titleNative: title['native'] as String?,
      bannerImage: json['bannerImage'] as String?,
      coverLarge: coverImage?['large'] as String?,
      coverMedium: coverImage?['medium'] as String?,
      genres: (json['genres'] as List<dynamic>?)?.cast<String>() ?? [],
      tags: (json['tags'] as List<dynamic>?)?.map((t) {
        final tm = t as Map<String, dynamic>;
        return Tag(name: tm['name'] as String? ?? '');
      }).toList() ?? [],
      format: json['format'] as String? ?? 'TV',
      episodes: json['episodes'] as int?,
      duration: json['duration'] as int?,
      averageScore: json['averageScore'] as int?,
      meanScore: json['meanScore'] as int?,
      popularity: json['popularity'] as int?,
      favourites: json['favourites'] as int?,
      season: json['season'] as String? ?? '',
      seasonYear: json['seasonYear'] as int?,
      status: json['status'] as String? ?? 'FINISHED',
      description: descriptionRaw.isNotEmpty ? _stripHtml(descriptionRaw) : null,
      studios: studiosNodes.map((s) => (s as Map<String, dynamic>)['name'] as String? ?? '').where((n) => n.isNotEmpty).toList(),
      nextEpisode: nextAiring != null ? NextAiringEpisode(
        episode: nextAiring['episode'] as int? ?? 0,
        timeUntilAiring: nextAiring['timeUntilAiring'] as int? ?? 0,
      ) : null,
      source: json['source'] as String?,
      trailerId: trailer?['id'] as String?,
      trailerSite: trailer?['site'] as String?,
      trailerThumbnail: trailer?['thumbnail'] as String?,
      synonyms: (json['synonyms'] as List<dynamic>?)?.cast<String>() ?? [],
      startDate: startDateJson != null ? AnimeDate.fromJson(startDateJson) : null,
      endDate: endDateJson != null ? AnimeDate.fromJson(endDateJson) : null,
      countryOfOrigin: json['countryOfOrigin'] as String?,
      hashtag: json['hashtag'] as String?,
      externalLinks: extLinks.map((e) {
        final m = e as Map<String, dynamic>;
        return ExternalLink(
          url: m['url'] as String? ?? '',
          site: m['site'] as String? ?? '',
        );
      }).toList(),
      rankings: rankingsJson.map((r) {
        final m = r as Map<String, dynamic>;
        return Ranking(
          rank: m['rank'] as int? ?? 0,
          type: m['type'] as String? ?? '',
          context: m['context'] as String? ?? '',
        );
      }).toList(),
      characters: characters,
      relations: relations,
      recommendations: recs,
    );
  }

  static String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .replaceAll(RegExp(r'\n+'), ' ')
        .trim();
  }

  static String _nameFromJson(dynamic name) {
    if (name is Map) {
      final full = name['full'] as String?;
      if (full != null) return full;
      final first = name['first'] as String? ?? '';
      final last = name['last'] as String? ?? '';
      return '$first $last'.trim();
    }
    return '';
  }

  static String _titleFromJson(dynamic title) {
    if (title is Map) {
      return (title['english'] ?? title['romaji'] ?? '') as String;
    }
    return '';
  }

  static List<VoiceActor> _vaFromJson(dynamic vas) {
    final list = <VoiceActor>[];
    if (vas is List) {
      for (final va in vas) {
        final m = va as Map<String, dynamic>;
        list.add(VoiceActor(
          name: _nameFromJson(m['name']),
          image: m['image'] is Map ? m['image']['large'] as String? : null,
        ));
      }
    }
    return list;
  }
}

class Tag {
  final String name;
  const Tag({required this.name});
}

class AnimeDate {
  final int? year;
  final int? month;
  final int? day;
  const AnimeDate({this.year, this.month, this.day});

  factory AnimeDate.fromJson(Map<String, dynamic> json) {
    return AnimeDate(
      year: json['year'] as int?,
      month: json['month'] as int?,
      day: json['day'] as int?,
    );
  }
}

class ExternalLink {
  final String url;
  final String site;
  const ExternalLink({required this.url, required this.site});
}

class Ranking {
  final int rank;
  final String type;
  final String context;
  const Ranking({required this.rank, required this.type, required this.context});
}

class CharacterEdge {
  final int id;
  final String name;
  final String? image;
  final String role;
  final List<VoiceActor> voiceActors;

  const CharacterEdge({
    required this.id,
    required this.name,
    this.image,
    this.role = '',
    this.voiceActors = const [],
  });
}

class VoiceActor {
  final String name;
  final String? image;
  const VoiceActor({required this.name, this.image});
}

class MediaEdge {
  final int id;
  final String title;
  final String? coverLarge;
  final String format;
  final String relationType;

  const MediaEdge({
    required this.id,
    required this.title,
    this.coverLarge,
    this.format = '',
    this.relationType = '',
  });
}

class NextAiringEpisode {
  final int episode;
  final int timeUntilAiring;

  const NextAiringEpisode({
    required this.episode,
    required this.timeUntilAiring,
  });

  String get timeLeft {
    final days = timeUntilAiring ~/ 86400;
    final hours = (timeUntilAiring % 86400) ~/ 3600;
    final minutes = (timeUntilAiring % 3600) ~/ 60;
    if (days > 0) return '${days}d ${hours}h';
    if (hours > 0) return '${hours}h ${minutes}m';
    return '${minutes}m';
  }
}
