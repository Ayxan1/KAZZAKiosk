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
  print('=== KAZZAKIOSK APP STARTING ===');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    print('=== MyApp build called ===');
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
    print('=== _buildHome called ===');
    print('isLoading: ${authProvider.isLoading}');
    print('isAuthenticated: ${authProvider.isAuthenticated}');
    
    if (authProvider.isLoading) {
      print('Showing loading screen');
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
      print('Showing login screen');
      return const LoginScreen();
    }

    if (authProvider.isAdmin) {
      print('Showing admin screen');
      return const AdminHomeScreen();
    }

    print('Showing seller screen');    }

    if (authProvider.isAdmin) {
      return const AdminHomeScreen();
    }

    return const SellerHomeScreen();
  }
}
