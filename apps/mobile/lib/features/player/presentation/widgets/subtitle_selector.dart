import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../../../core/theme/app_theme.dart';

class SubtitleSelectorSheet extends ConsumerWidget {
  const SubtitleSelectorSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111111),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const SubtitleSelectorSheet(),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(playerProvider);
    final subtitles = state.subtitles;

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
            'Subtitles',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          _SubtitleTile(
            label: 'Off',
            language: '',
            isSelected: state.selectedSubtitle == 'Off',
            onTap: () {
              ref.read(playerProvider.notifier).setSubtitle(-1, 'Off');
              Navigator.of(context).pop();
            },
          ),
          if (subtitles.isEmpty)
            ...['English', 'Spanish', 'French', 'Japanese', 'Portuguese'].map((l) => _SubtitleTile(
              label: l,
              language: l,
              isSelected: state.selectedSubtitle == l,
              onTap: () {
                ref.read(playerProvider.notifier).setSubtitle(0, l);
                Navigator.of(context).pop();
              },
            ))
          else
            ...subtitles.asMap().entries.map((e) => _SubtitleTile(
              label: e.value.label,
              language: e.value.language,
              isSelected: e.key == state.currentSubtitle,
              onTap: () {
                ref.read(playerProvider.notifier).setSubtitle(e.key, e.value.label);
                Navigator.of(context).pop();
              },
            )),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Subtitle Settings', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                _SubSettingRow(label: 'Size', value: 'Medium'),
                const SizedBox(height: 6),
                _SubSettingRow(label: 'Opacity', value: '90%'),
                const SizedBox(height: 6),
                _SubSettingRow(label: 'Background', value: 'Dark'),
              ],
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _SubtitleTile extends StatelessWidget {
  final String label;
  final String language;
  final bool isSelected;
  final VoidCallback onTap;

  const _SubtitleTile({
    required this.label,
    required this.language,
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
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.grey[400],
                    fontSize: 14,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
                if (language.isNotEmpty)
                  Text(
                    language,
                    style: TextStyle(color: Colors.grey[600], fontSize: 11),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SubSettingRow extends StatelessWidget {
  final String label; final String value;
  const _SubSettingRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: const TextStyle(color: Colors.white70, fontSize: 13)),
      ],
    );
  }
}
