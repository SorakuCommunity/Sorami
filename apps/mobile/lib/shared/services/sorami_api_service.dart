import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SoramiApiService {
  final Dio _dio;

  SoramiApiService({String? baseUrl})
      : _dio = Dio(BaseOptions(
          baseUrl: baseUrl ?? dotenv.env['SORAMIAPI'] ?? 'http://localhost:3000',
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
          headers: {'Accept': 'application/json'},
        ));

  Future<String?> resolveStreamUrl(String animeSlug, int episodeNumber) async {
    try {
      final res = await _dio.get('/episode/$animeSlug/$episodeNumber/stream');
      return res.data['url'] as String?;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> searchAnime(String query) async {
    try {
      final res = await _dio.get('/anime/search', queryParameters: {'q': query});
      return res.data as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>?> getAnimeDetail(String id) async {
    try {
      final res = await _dio.get('/anime/$id');
      return res.data as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> getSources() async {
    try {
      final res = await _dio.get('/anime/sources');
      return (res.data as List).cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> getSourceHealth() async {
    try {
      final res = await _dio.get('/anime/sources/health');
      return res.data as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }

  Future<List<dynamic>> getTrending({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/trending', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getSeasonal({int page = 1, int perPage = 20, String? season, int? seasonYear}) async {
    try {
      final params = <String, String>{'page': page.toString(), 'perPage': perPage.toString()};
      if (season != null) params['season'] = season;
      if (seasonYear != null) params['seasonYear'] = seasonYear.toString();
      final res = await _dio.get('/anime/seasonal', queryParameters: params);
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getTopRated({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/top-rated', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getAiring({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/airing', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getMovies({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/movies', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getLatest({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/latest', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> getAniListPopular({int page = 1, int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/anilist/popular', queryParameters: {'page': page.toString(), 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }

  Future<List<dynamic>> searchAnilist(String query, {int perPage = 20}) async {
    try {
      final res = await _dio.get('/anime/anilist/search', queryParameters: {'q': query, 'perPage': perPage.toString()});
      return res.data as List<dynamic>? ?? [];
    } catch (_) {
      return [];
    }
  }
}
