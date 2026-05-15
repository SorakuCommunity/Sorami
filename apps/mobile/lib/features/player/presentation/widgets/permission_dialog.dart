import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/permission_provider.dart';

class PermissionRequestDialog extends ConsumerStatefulWidget {
  final bool isFirstLaunch;

  const PermissionRequestDialog({super.key, this.isFirstLaunch = false});

  static Future<bool> show(BuildContext context, {bool isFirstLaunch = false}) async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => PermissionRequestDialog(isFirstLaunch: isFirstLaunch),
    );
    return result ?? false;
  }

  @override
  ConsumerState<PermissionRequestDialog> createState() => _PermissionRequestDialogState();
}

class _PermissionRequestDialogState extends ConsumerState<PermissionRequestDialog> {
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: widget.isFirstLaunch,
      child: Dialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shield_outlined, color: AppTheme.primary, size: 32),
              ),
              const SizedBox(height: 20),
              const Text(
                'Permissions Required',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Sorami needs the following permissions to provide the best streaming experience.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey[400], fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 24),
              _PermissionItem(
                icon: Icons.notifications_outlined,
                title: 'Notifications',
                subtitle: 'For playback controls and episode alerts',
              ),
              const SizedBox(height: 12),
              _PermissionItem(
                icon: Icons.wifi_outlined,
                title: 'Internet',
                subtitle: 'Required for streaming anime',
                granted: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _onRequest,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _loading
                      ? const SizedBox(
                          width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Allow & Continue', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
              if (!widget.isFirstLaunch) ...[
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(false),
                  child: Text(
                    'Not Now',
                    style: TextStyle(color: Colors.grey[500], fontSize: 14),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _onRequest() async {
    setState(() => _loading = true);
    final granted = await ref.read(permissionStateProvider.notifier).requestPermissions();
    if (mounted) Navigator.of(context).pop(granted);
  }
}

class _PermissionItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool granted;

  const _PermissionItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.granted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: granted
                  ? Colors.greenAccent.withValues(alpha: 0.15)
                  : AppTheme.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              color: granted ? Colors.greenAccent : AppTheme.primary,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500),
                    ),
                    if (granted) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: Colors.greenAccent.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('Granted', style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(color: Colors.grey[500], fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
