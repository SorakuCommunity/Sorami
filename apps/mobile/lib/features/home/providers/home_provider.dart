import 'dart:math';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/anilist_anime.dart';
import '../../../shared/providers/anime_provider.dart';
export '../../../shared/providers/anime_provider.dart';

final seasonalAnimeProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getSeasonal(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final topRatedAnimeProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getTopRated(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final airingScheduleProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getAiring(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final searchResultsProvider = FutureProvider.family<List<AniListAnime>, String>((ref, query) async {
  if (query.trim().isEmpty) return [];
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.searchAnilist(query, perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final moviesProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getMovies(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final recentlyAddedProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getLatest(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final personalizedRecommendationsProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getTrending(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final communityPicksProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getAniListPopular(perPage: 20);
  return data.map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});

final randomAnimeProvider = FutureProvider<AniListAnime?>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getTrending(perPage: 20);
  if (data.isEmpty) return null;
  final random = Random();
  return AniListAnime.fromJson(data[random.nextInt(data.length)] as Map<String, dynamic>);
});

final randomAnimeCarouselProvider = FutureProvider<List<AniListAnime>>((ref) async {
  final service = ref.read(soramiApiServiceProvider);
  final data = await service.getTrending(perPage: 30);
  data.shuffle(Random(DateTime.now().millisecondsSinceEpoch));
  return data.take(8).map((m) => AniListAnime.fromJson(m as Map<String, dynamic>)).toList();
});
