import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/anilist_auth_service.dart';

final anilistAuthServiceProvider = Provider<AniListAuthService>((ref) {
  return AniListAuthService();
});

final authStateProvider = StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  return AuthStateNotifier(ref.read(anilistAuthServiceProvider));
});

class AuthState {
  final bool isLoggedIn;
  final String? username;
  final String? avatarUrl;
  final String? accessToken;

  const AuthState({
    this.isLoggedIn = false,
    this.username,
    this.avatarUrl,
    this.accessToken,
  });

  AuthState copyWith({
    bool? isLoggedIn,
    String? username,
    String? avatarUrl,
    String? accessToken,
  }) {
    return AuthState(
      isLoggedIn: isLoggedIn ?? this.isLoggedIn,
      username: username ?? this.username,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      accessToken: accessToken ?? this.accessToken,
    );
  }
}

class AuthStateNotifier extends StateNotifier<AuthState> {
  final AniListAuthService _authService;

  AuthStateNotifier(this._authService) : super(const AuthState());

  Future<void> checkLoginStatus() async {
    final token = await _authService.getToken();
    if (token != null && token.isNotEmpty) {
      final user = await _authService.getCurrentUser(token);
      if (user != null) {
        state = AuthState(
          isLoggedIn: true,
          accessToken: token,
          username: user['name'] as String?,
          avatarUrl: (user['avatar'] as Map<String, dynamic>?)?['large'] as String?,
        );
        return;
      }
    }
    state = const AuthState();
  }

  Future<bool> loginWithPin(String pin) async {
    final token = await _authService.exchangePinForToken(pin);
    if (token != null) {
      await checkLoginStatus();
      return true;
    }
    return false;
  }

  Future<void> setToken(String token) async {
    await _authService.setToken(token);
    await checkLoginStatus();
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }

  String get authUrl => _authService.authUrl;
}
