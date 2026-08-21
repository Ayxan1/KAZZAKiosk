import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import '../screens/seller/seller_home_screen.dart';
import '../screens/admin/admin_home_screen.dart';

class AppRouter {
  static GoRouter router(AuthProvider authProvider) {
    return GoRouter(
      initialLocation: '/login',
      refreshListenable: authProvider,
      redirect: (context, state) {
        final isLoading = authProvider.isLoading;
        final isLoggedIn = authProvider.isAuthenticated;
        final isLoggingIn = state.matchedLocation == '/login';

        // Wait for auth check to complete
        if (isLoading) {
          return null;
        }

        if (!isLoggedIn && !isLoggingIn) {
          return '/login';
        }

        if (isLoggedIn && isLoggingIn) {
          if (authProvider.isAdmin) {
            return '/admin';
          } else {
            return '/seller';
          }
        }

        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/seller',
          builder: (context, state) => const SellerHomeScreen(),
        ),
        GoRoute(
          path: '/admin',
          builder: (context, state) => const AdminHomeScreen(),
        ),
      ],
    );
  }
}
