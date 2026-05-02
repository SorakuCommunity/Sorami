import 'package:equatable/equatable.dart';

class Anime extends Equatable {
  final String id;
  final String title;
  final String slug;
  final String? posterUrl;
  final String? bannerUrl;
  final List<String> genres;
  final String status;
  final double? score;

  const Anime({
    required this.id,
    required this.title,
    required this.slug,
    this.posterUrl,
    this.bannerUrl,
    required this.genres,
    required this.status,
    this.score,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        slug,
        posterUrl,
        bannerUrl,
        genres,
        status,
        score,
      ];
}

class Episode extends Equatable {
  final String id;
  final String animeId;
  final int number;
  final String? title;
  final int duration; // in minutes
  final String? hls320;
  final String? hls480;
  final String? hls720;
  final String? hls1080;

  const Episode({
    required this.id,
    required this.animeId,
    required this.number,
    this.title,
    required this.duration,
    this.hls320,
    this.hls480,
    this.hls720,
    this.hls1080,
  });

  @override
  List<Object?> get props => [
        id,
        animeId,
        number,
        title,
        duration,
        hls320,
        hls480,
        hls720,
        hls1080,
      ];
}