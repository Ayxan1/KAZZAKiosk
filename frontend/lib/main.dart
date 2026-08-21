import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/kiosk_provider.dart';
import 'providers/product_provider.dart';
import 'providers/sales_provider.dart';
import 'screens/login_screen.dart';
import 'router/app_router.dart';
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
          // Debug: Bypass router temporarily to test
          return MaterialApp(
            title: 'KAZZAKIOSK',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            home: authProvider.isLoading
                ? const Scaffold(
                    body: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text('Loading...'),
                        ],
                      ),
                    ),
                  )
                : const LoginScreen(),
          );
        },
      ),
    );
  }
}
