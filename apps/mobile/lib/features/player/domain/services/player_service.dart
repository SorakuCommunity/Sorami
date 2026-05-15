import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class PlayerService {
  final Dio _dio;

  PlayerService()
      : _dio = Dio(BaseOptions(
          baseUrl: dotenv.env['SORAMIAPI'] ?? 'http://localhost:3000',
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 15),
        ));

  Future<String?> resolveStreamUrl(String animeSlug, int episodeNumber) async {
    try {
      final res = await _dio.get('/episode/$animeSlug/$episodeNumber/stream');
      return res.data['url'] as String?;
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

  Future<List<Map<String, dynamic>>> getEpisodes(String animeId) async {
    try {
      final res = await _dio.get('/episode/$animeId');
      return (res.data as List).cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }
}
