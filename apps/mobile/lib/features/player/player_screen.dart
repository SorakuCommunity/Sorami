import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:better_player_plus/better_player_plus.dart';

class PlayerScreen extends ConsumerStatefulWidget {
  const PlayerScreen({super.key, required this.animeId, required this.episodeNumber});

  final String animeId;
  final int episodeNumber;

  @override
  ConsumerState<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends ConsumerState<PlayerScreen> {
  late BetterPlayerController _betterPlayerController;
  final BetterPlayerDataSource _betterPlayerDataSource = BetterPlayerDataSource(
    BetterPlayerDataSourceType.network,
    // In a real app, this would come from the API based on animeId and episodeNumber
    // For now, we use a placeholder URL (note: this is not a real video)
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  );

  @override
  void initState() {
    super.initState();
    _betterPlayerController = BetterPlayerController(
      const BetterPlayerConfiguration(
        aspectRatio: 16 / 9,
        placeholder: Container(
          color: Colors.grey[800],
        ),
        allowFullScreen: true,
        autoPlay: true,
        // We would typically get subtitles and multiple qualities from the API
      ),
    )..setupDataSource(_betterPlayerDataSource);
  }

  @override
  void dispose() {
    _betterPlayerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BetterPlayer(
        controller: _betterPlayerController,
      ),
    );
  }
}