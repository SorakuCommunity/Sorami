import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/auth_screen.dart';
import '../../features/home/home_screen.dart';

// GoRouter configuration
final GoRouter _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      redirect: (context, state) => '/auth', // Redirect to auth by default
    ),
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    // Add more routes as needed
  ],
  // Optional: redirect logic based on authentication state
  redirect: (context, state) {
    // In a real app, you would check authentication state from a provider
    // For now, we'll allow all routes
    return null;
  },
);

// Provider for the router
final appRouterProvider = Provider<GoRouter>((ref) => _router);