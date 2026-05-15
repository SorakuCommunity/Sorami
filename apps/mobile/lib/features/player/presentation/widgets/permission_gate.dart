import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../shared/providers/permission_provider.dart';
import 'permission_dialog.dart';

class PermissionGate extends ConsumerStatefulWidget {
  final Widget child;

  const PermissionGate({super.key, required this.child});

  @override
  ConsumerState<PermissionGate> createState() => _PermissionGateState();
}

class _PermissionGateState extends ConsumerState<PermissionGate> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _check());
  }

  Future<void> _check() async {
    final notifier = ref.read(permissionStateProvider.notifier);
    final state = ref.read(permissionStateProvider);

    if (!state.initialized) {
      await notifier.init();
    }

    if (!state.granted && mounted) {
      PermissionRequestDialog.show(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(permissionStateProvider);

    if (!state.initialized || state.loading) {
      return Scaffold(
        backgroundColor: const Color(0xFF070707),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 40, height: 40,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: AppTheme.primary.withValues(alpha: 0.8),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Preparing...',
                style: TextStyle(color: Colors.white54, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return widget.child;
  }
}
