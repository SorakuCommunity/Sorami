import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../application/providers/player_provider.dart';
import '../../domain/entities/player_state.dart';
import '../../../../core/theme/app_theme.dart';

class ServerSelectorSheet extends ConsumerStatefulWidget {
  const ServerSelectorSheet({super.key});

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111111),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const ServerSelectorSheet(),
    );
  }

  @override
  ConsumerState<ServerSelectorSheet> createState() => _ServerSelectorSheetState();
}

class _ServerSelectorSheetState extends ConsumerState<ServerSelectorSheet> {
  Timer? _refreshTimer;
  DateTime _lastUpdated = DateTime.now();

  @override
  void initState() {
    super.initState();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) {
        ref.read(playerProvider.notifier).refreshServers();
        setState(() => _lastUpdated = DateTime.now());
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Color _pingColor(int ping) {
    if (ping <= 0) return Colors.grey;
    if (ping < 50) return const Color(0xFF22C55E);
    if (ping < 150) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  String _pingLabel(int ping) {
    if (ping <= 0) return 'Offline';
    return '${ping}ms';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(playerProvider);
    final servers = state.servers;

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
          Row(
            children: [
              const Text(
                'Streaming Server',
                style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 8),
              Icon(Icons.dns_outlined, color: Colors.grey[500], size: 18),
              const Spacer(),
              Text(
                '${_lastUpdated.hour.toString().padLeft(2, '0')}:${_lastUpdated.minute.toString().padLeft(2, '0')}:${_lastUpdated.second.toString().padLeft(2, '0')}',
                style: TextStyle(color: Colors.grey[600], fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                'Auto-fallback enabled • Updates every 30s',
                style: TextStyle(color: Colors.grey[600], fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (servers.isEmpty)
            ..._defaultServers(context, ref, state)
          else
            ...servers.asMap().entries.map((e) => _ServerTile(
              name: e.value.name,
              ping: e.value.ping,
              isActive: e.value.isActive,
              isSelected: e.key == state.currentServer,
              pingColor: _pingColor(e.value.ping),
              pingLabel: _pingLabel(e.value.ping),
              onTap: e.value.isActive
                  ? () {
                      ref.read(playerProvider.notifier).setServer(e.key, e.value.name);
                      Navigator.of(context).pop();
                    }
                  : null,
            )),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  List<Widget> _defaultServers(BuildContext context, WidgetRef ref, PlayerState state) {
    final defaults = [
      _ServerData('Sorami', 12, true),
      _ServerData('Kiwi', 34, true),
      _ServerData('Vidstream', 0, false),
      _ServerData('Hianime', 89, true),
      _ServerData('Akamai', 0, false),
    ];
    return defaults.map((s) => _ServerTile(
      name: s.name,
      ping: s.ping,
      isActive: s.active,
      isSelected: s.name == state.selectedServer,
      pingColor: _pingColor(s.ping),
      pingLabel: _pingLabel(s.ping),
      onTap: s.active
          ? () {
              final idx = defaults.indexOf(s);
              ref.read(playerProvider.notifier).setServer(idx, s.name);
              Navigator.of(context).pop();
            }
          : null,
    )).toList();
  }
}

class _ServerData {
  final String name;
  final int ping;
  final bool active;
  const _ServerData(this.name, this.ping, this.active);
}

class _ServerTile extends StatelessWidget {
  final String name;
  final int ping;
  final bool isActive;
  final bool isSelected;
  final Color pingColor;
  final String pingLabel;
  final VoidCallback? onTap;

  const _ServerTile({
    required this.name,
    required this.ping,
    required this.isActive,
    required this.isSelected,
    required this.pingColor,
    required this.pingLabel,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isActive ? onTap : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        margin: const EdgeInsets.only(bottom: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.primary.withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? AppTheme.primary.withValues(alpha: 0.3)
                : isActive
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.red.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: isActive ? pingColor : Colors.redAccent,
                shape: BoxShape.circle,
                boxShadow: isActive
                    ? [BoxShadow(color: pingColor.withValues(alpha: 0.5), blurRadius: 6)]
                    : [BoxShadow(color: Colors.redAccent.withValues(alpha: 0.3), blurRadius: 4)],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: TextStyle(
                      color: isSelected ? Colors.white : isActive ? Colors.white70 : Colors.grey[500],
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                  if (!isActive)
                    Text(
                      'Offline',
                      style: TextStyle(color: Colors.redAccent.withValues(alpha: 0.7), fontSize: 11),
                    ),
                ],
              ),
            ),
            if (isActive) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: pingColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  pingLabel,
                  style: TextStyle(
                    color: pingColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 8),
            ],
            if (!isActive) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.redAccent.withValues(alpha: 0.2)),
                ),
                child: const Text(
                  'Offline',
                  style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(width: 8),
              Icon(Icons.cloud_off_rounded, color: Colors.grey[700], size: 16),
            ],
            if (isSelected)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                margin: const EdgeInsets.only(left: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Live', style: TextStyle(color: AppTheme.primary, fontSize: 10, fontWeight: FontWeight.w700)),
              ),
          ],
        ),
      ),
    );
  }
}
