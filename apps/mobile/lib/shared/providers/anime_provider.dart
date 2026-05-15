import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/sorami_api_service.dart';
import '../services/anilist_service.dart';
import '../models/anilist_anime.dart';

final soramiApiServiceProvider = Provider<SoramiApiService>((ref) {
  return SoramiApiService();
});

final anilistServiceProvider = Provider<AniListService>((ref) {
  return AniListService();
});

final trendingAnimeProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getTrending(perPage: 10);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final popularAnimeProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getAniListPopular(perPage: 10);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final latestAnimeProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getLatest(perPage: 10);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final animeDetailProvider = FutureProvider.family<AniListAnime?, int>((ref, id) async {
  final service = ref.read(anilistServiceProvider);
  return service.getAnimeDetail(id);
});
