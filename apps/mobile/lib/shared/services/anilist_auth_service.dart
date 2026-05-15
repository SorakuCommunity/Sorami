import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AniListAuthService {
  static const String _clientId = '20788';
  static const String _authUrl =
      'https://anilist.co/api/v2/oauth/authorize?client_id=$_clientId&redirect_uri=https://anilist.co/api/v2/oauth/pin&response_type=token';
  static const String _tokenUrl = 'https://anilist.co/api/v2/oauth/token';
  static const String _apiUrl = 'https://graphql.anilist.co';
  static const String _tokenKey = 'JCFj4WWT0205b3CXKR63UijefdTWPT01mFgLZbVa';

  final FlutterSecureStorage _storage;
  final Dio _dio;

  AniListAuthService({
    FlutterSecureStorage? storage,
    Dio? dio,
  })  : _storage = storage ?? const FlutterSecureStorage(),
        _dio = dio ?? Dio();

  String get authUrl => _authUrl;

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<String?> exchangePinForToken(String pin) async {
    try {
      final response = await _dio.post(
        _tokenUrl,
        data: {
          'grant_type': 'authorization_code',
          'client_id': _clientId,
          'code': pin,
          'redirect_uri': 'https://anilist.co/api/v2/oauth/pin',
        },
        options: Options(
          contentType: Headers.formUrlEncodedContentType,
        ),
      );

      final data = response.data as Map<String, dynamic>;
      final accessToken = data['access_token'] as String?;
      if (accessToken != null && accessToken.isNotEmpty) {
        await _storage.write(key: _tokenKey, value: accessToken);
        return accessToken;
      }
      return null;
    } on DioException {
      return null;
    }
  }

  Future<void> setToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<Map<String, dynamic>?> getCurrentUser(String accessToken) async {
    const query = '''
      query {
        Viewer {
          id
          name
          avatar { large }
          about
        }
      }
    ''';

    try {
      final response = await _dio.post(
        _apiUrl,
        data: {'query': query},
        options: Options(
          headers: {
            'Authorization': 'Bearer $accessToken',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );

      final data = response.data as Map<String, dynamic>;
      return data['data']?['Viewer'] as Map<String, dynamic>?;
    } on DioException {
      return null;
    }
  }
}
