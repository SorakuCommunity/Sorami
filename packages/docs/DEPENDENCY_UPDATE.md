Updated apps/mobile/pubspec.yaml to match the agreed tech stack for Sorami mobile app.

Dependencies now include:
- flutter_riverpod: ^2.3.0 (state management)
- go_router: ^12.0.0 (navigation)
- better_player_plus: ^0.0.7 (video player)
- dio: ^5.0.0 (networking)
- hive_flutter: ^1.1.0 (local storage)
- cached_network_image: ^3.2.0 (image loading)
- firebase_core: ^2.0.0 & firebase_messaging: ^14.0.0 (Firebase)
- google_sign_in: ^6.0.0 (authentication)
- shared_preferences: ^2.0.0 & intl: ^0.18.0 (utilities)
- flutter_svg: ^2.0.0 (SVG support)
- flutter_staggered_animations: ^1.0.0 & flutter_shimmer: ^2.0.0 (UI enhancements)

The main.dart file is already configured to use Riverpod and GoRouter.
The theme and router files have been created in the core directory.

Next steps for development:
1. Install Flutter SDK if not already installed
2. Run 'flutter pub get' in the apps/mobile directory
3. Connect to backend API (once implemented)
4. Begin implementing features according to TODO.md

The Sorami monorepo structure is complete and ready for development.