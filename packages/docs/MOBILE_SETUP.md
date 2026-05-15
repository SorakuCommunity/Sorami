The Sorami mobile app's pubspec.yaml has been updated to match the agreed tech stack.

Dependencies:
- flutter_riverpod: ^2.3.0
- go_router: ^12.0.0
- better_player_plus: ^0.0.7
- dio: ^5.0.0
- hive_flutter: ^1.1.0
- cached_network_image: ^3.2.0
- firebase_core: ^2.0.0
- firebase_messaging: ^14.0.0
- google_sign_in: ^6.0.0
- shared_preferences: ^2.0.0
- intl: ^0.18.0
- flutter_svg: ^2.0.0
- flutter_staggered_animations: ^1.0.0
- flutter_shimmer: ^2.0.0

The main.dart is configured to use Riverpod and GoRouter.

Next steps:
1. Install Flutter SDK if not already installed.
2. Run 'flutter pub get' in the apps/mobile directory.
3. Implement the backend API (apps/api) to connect with the mobile app.
4. Begin feature implementation as per TODO.md.

The Sorami monorepo is ready for development.