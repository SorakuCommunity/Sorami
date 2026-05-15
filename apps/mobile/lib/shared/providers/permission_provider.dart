import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/services/permission_service.dart';

final permissionServiceProvider = Provider<PermissionService>((ref) {
  return PermissionService();
});

final permissionStateProvider = StateNotifierProvider<PermissionStateNotifier, PermissionState>((ref) {
  return PermissionStateNotifier(ref.read(permissionServiceProvider));
});

class PermissionState {
  final bool initialized;
  final bool granted;
  final bool firstLaunchDialogShown;
  final bool loading;

  const PermissionState({
    this.initialized = false,
    this.granted = false,
    this.firstLaunchDialogShown = false,
    this.loading = false,
  });

  PermissionState copyWith({
    bool? initialized,
    bool? granted,
    bool? firstLaunchDialogShown,
    bool? loading,
  }) {
    return PermissionState(
      initialized: initialized ?? this.initialized,
      granted: granted ?? this.granted,
      firstLaunchDialogShown: firstLaunchDialogShown ?? this.firstLaunchDialogShown,
      loading: loading ?? this.loading,
    );
  }
}

class PermissionStateNotifier extends StateNotifier<PermissionState> {
  final PermissionService _service;

  PermissionStateNotifier(this._service) : super(const PermissionState());

  Future<void> init() async {
    state = state.copyWith(loading: true);
    await _service.ensureInitialized();
    final granted = await _service.areAllGranted();
    final prefs = await SharedPreferences.getInstance();
    final dialogShown = prefs.getBool('permission_dialog_shown') ?? false;
    state = state.copyWith(
      initialized: true,
      granted: granted,
      firstLaunchDialogShown: dialogShown,
      loading: false,
    );
  }

  Future<bool> requestPermissions() async {
    state = state.copyWith(loading: true);
    final granted = await _service.requestAndCheck();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('permission_dialog_shown', true);
    state = state.copyWith(
      granted: granted,
      firstLaunchDialogShown: true,
      loading: false,
    );
    return granted;
  }

  Future<void> markDialogShown() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('permission_dialog_shown', true);
    state = state.copyWith(firstLaunchDialogShown: true);
  }
}
