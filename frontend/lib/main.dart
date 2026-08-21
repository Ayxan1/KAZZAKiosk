import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/kiosk_provider.dart';
import 'providers/product_provider.dart';
import 'providers/sales_provider.dart';
import 'screens/login_screen.dart';
import 'screens/admin/admin_home_screen.dart';
import 'screens/seller/seller_home_screen.dart';
import 'utils/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => KioskProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => SalesProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp(
            title: 'KAZZAKIOSK',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: _buildHome(authProvider),
          );
        },
      ),
    );
  }

  Widget _buildHome(AuthProvider authProvider) {
    if (authProvider.isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Yüklənir...'),
            ],
          ),
        ),
      );
    }

    if (!authProvider.isAuthenticated) {
      return const LoginScreen();
    }

    if (authProvider.isAdmin) {
      return const AdminHomeScreen();
    }

    return const SellerHomeScreen();
  }
}
