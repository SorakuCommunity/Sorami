import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../../../core/theme/app_theme.dart';

class QualitySelectorSheet extends ConsumerWidget {
  const QualitySelectorSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111111),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const QualitySelectorSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);
    final qualities = state.qualities;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[700],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Video Quality',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          if (qualities.isEmpty)
            ..._buildDefaultQualities(context, ref)
          else
            ...qualities.asMap().entries.map((e) => _QualityTile(
              label: e.value.label,
              isSelected: e.key == state.currentQuality,
              onTap: () {
                ref.read(playerProvider.notifier).setQuality(e.key, e.value.label);
                Navigator.of(context).pop();
              },
            )),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  List<Widget> _buildDefaultQualities(BuildContext context, WidgetRef ref) {
    final labels = ['Auto', '1080p', '720p', '480p', '360p'];
    return labels.asMap().entries.map((e) => _QualityTile(
      label: e.value,
      isSelected: e.value == ref.read(playerProvider).selectedQuality,
      onTap: () {
        ref.read(playerProvider.notifier).setQuality(e.key, e.value);
        Navigator.of(context).pop();
      },
    )).toList();
  }
}

class _QualityTile extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _QualityTile({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: const EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: isSelected
              ? Border.all(color: AppTheme.primary.withValues(alpha: 0.3))
              : null,
        ),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isSelected ? AppTheme.primary : Colors.grey[600],
              size: 20,
            ),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[400],
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            const Spacer(),
            if (isSelected)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Active', style: TextStyle(color: AppTheme.primary, fontSize: 10)),
              ),
          ],
        ),
      ),
    );
  }
}
