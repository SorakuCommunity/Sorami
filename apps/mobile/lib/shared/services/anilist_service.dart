import 'package:dio/dio.dart';
import '../models/anilist_anime.dart';

class AniListService {
  final Dio _dio;
  String? _accessToken;
  static const String _baseUrl = 'https://graphql.anilist.co';

  AniListService({Dio? dio})
      : _dio = dio ?? Dio(BaseOptions(
          baseUrl: _baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ));

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Map<String, String> get _headers {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    return headers;
  }

  Future<Map<String, dynamic>> _post(String query, Map<String, dynamic> variables) async {
    final response = await _dio.post(
      '',
      data: {'query': query, 'variables': variables},
      options: Options(headers: _headers),
    );
    return response.data as Map<String, dynamic>;
  }

  Future<List<AniListAnime>> getTrending({int page = 1, int perPage = 10}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });

      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];

      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getPopular({int page = 1, int perPage = 10}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });

      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];

      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getLatestEpisodes({int page = 1, int perPage = 10}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(status: RELEASING, sort: UPDATED_AT_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });

      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];

      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<AniListAnime?> getById(int id) async {
    const query = '''
      query (\$id: Int) {
        Media(id: \$id, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          coverImage { large }
          genres
          format
          episodes
          duration
          averageScore
          season
          seasonYear
          status
          description
          studios { nodes { name } }
          nextAiringEpisode { episode timeUntilAiring }
          meanScore
          popularity
          favourites
          source
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'id': id},
      });

      final data = response.data as Map<String, dynamic>;
      final media = data['data']?['Media'] as Map<String, dynamic>?;
      if (media == null) return null;

      return AniListAnime.fromJson(media);
    } on DioException {
      return null;
    }
  }

  String _getCurrentSeason(int month) {
    if (month >= 1 && month <= 3) return 'WINTER';
    if (month >= 4 && month <= 6) return 'SPRING';
    if (month >= 7 && month <= 9) return 'SUMMER';
    return 'FALL';
  }

  Future<List<AniListAnime>> getSeasonal({int page = 1, int perPage = 20}) async {
    final now = DateTime.now();
    final season = _getCurrentSeason(now.month);
    final year = now.year;

    const query = '''
      query (\$page: Int, \$perPage: Int, \$season: MediaSeason, \$seasonYear: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(season: \$season, seasonYear: \$seasonYear, sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage, 'season': season, 'seasonYear': year},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getTopRated({int page = 1, int perPage = 20}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(sort: SCORE_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getAiringSchedule({int page = 1, int perPage = 20}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> searchAnime(String search, {int page = 1, int perPage = 20}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int, \$search: String) {
        Page(page: \$page, perPage: \$perPage) {
          media(search: \$search, sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'search': search, 'page': page, 'perPage': perPage},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getMovies({int page = 1, int perPage = 20}) async {
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(format: MOVIE, sort: POPULARITY_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<List<AniListAnime>> getRandom({int perPage = 20}) async {
    final random = DateTime.now().millisecondsSinceEpoch;
    const query = '''
      query (\$page: Int, \$perPage: Int) {
        Page(page: \$page, perPage: \$perPage) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { romaji english native }
            bannerImage
            coverImage { large }
            genres
            format
            episodes
            duration
            averageScore
            season
            seasonYear
            status
            description
            studios { nodes { name } }
            nextAiringEpisode { episode timeUntilAiring }
            meanScore
            popularity
            favourites
            source
          }
        }
      }
    ''';

    try {
      final page = (random % 10) + 1;
      final response = await _dio.post('', data: {
        'query': query,
        'variables': {'page': page, 'perPage': perPage},
      });
      final data = response.data as Map<String, dynamic>;
      final pageData = data['data']?['Page'] as Map<String, dynamic>?;
      if (pageData == null) return [];
      final mediaList = pageData['media'] as List<dynamic>? ?? [];
      return mediaList.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
    } on DioException {
      return [];
    }
  }

  Future<Map<String, dynamic>?> getMediaListEntry(int mediaId) async {
    const query = '''
      query (\$mediaId: Int) {
        MediaList(mediaId: \$mediaId, type: ANIME) {
          id
          status
          score
          progress
          startedAt { year month day }
          completedAt { year month day }
          notes
        }
      }
    ''';

    try {
      final data = await _post(query, {'mediaId': mediaId});
      final entry = data['data']?['MediaList'] as Map<String, dynamic>?;
      return entry;
    } on DioException {
      return null;
    }
  }

  Future<bool> updateMediaListEntry({
    required int mediaId,
    String? status,
    int? score,
    int? progress,
    String? notes,
  }) async {
    const mutation = '''
      mutation (\$mediaId: Int, \$status: MediaListStatus, \$score: Int, \$progress: Int, \$notes: String) {
        SaveMediaListEntry(mediaId: \$mediaId, status: \$status, score: \$score, progress: \$progress, notes: \$notes) {
          id
          status
          score
          progress
        }
      }
    ''';

    try {
      final variables = <String, dynamic>{'mediaId': mediaId};
      if (status != null) variables['status'] = status;
      if (score != null) variables['score'] = score;
      if (progress != null) variables['progress'] = progress;
      if (notes != null) variables['notes'] = notes;

      final data = await _post(mutation, variables);
      return data['data']?['SaveMediaListEntry'] != null;
    } on DioException {
      return false;
    }
  }

  Future<bool> saveReview({
    required int mediaId,
    required String body,
    String? summary,
    int? score,
  }) async {
    const mutation = '''
      mutation (\$mediaId: Int, \$body: String, \$summary: String, \$score: Int) {
        SaveReview(mediaId: \$mediaId, body: \$body, summary: \$summary, score: \$score) {
          id
          score
          summary
        }
      }
    ''';

    try {
      final variables = <String, dynamic>{
        'mediaId': mediaId,
        'body': body,
      };
      if (summary != null) variables['summary'] = summary;
      if (score != null) variables['score'] = score;

      final data = await _post(mutation, variables);
      return data['data']?['SaveReview'] != null;
    } on DioException {
      return false;
    }
  }

  Future<AniListAnime?> getAnimeDetail(int id) async {
    const query = '''
      query (\$id: Int) {
        Media(id: \$id, type: ANIME) {
          id
          title { romaji english native }
          bannerImage
          coverImage { large medium }
          genres
          tags { name }
          format
          episodes
          duration
          averageScore
          meanScore
          popularity
          favourites
          season
          seasonYear
          status
          description
          source
          countryOfOrigin
          hashtag
          synonyms
          startDate { year month day }
          endDate { year month day }
          studios { nodes { name } }
          nextAiringEpisode { episode timeUntilAiring }
          trailer { id site thumbnail }
          externalLinks { url site }
          rankings { rank type context }
          characters {
            edges {
              node { id name { full } image { large } }
              role
              voiceActors { name { full } image { large } }
            }
          }
          relations {
            edges {
              node { id title { romaji english } coverImage { large } format }
              relationType
            }
          }
          recommendations {
            nodes {
              mediaRecommendation {
                id
                title { romaji english }
                coverImage { large }
                averageScore
                genres
                format
              }
            }
          }
        }
      }
    ''';

    try {
      final data = await _post(query, {'id': id});
      final media = data['data']?['Media'] as Map<String, dynamic>?;
      if (media == null) return null;
      return AniListAnime.fromJson(media);
    } on DioException {
      return null;
    }
  }
}
