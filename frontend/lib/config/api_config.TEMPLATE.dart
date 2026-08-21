class ApiConfig {
  // 🚨 BACKEND URL-Nİ BURA YAZIŞ! 🚨
  // Railway-də backend deploy etdikdən sonra URL buraya əlavə et:
  // Məsələn: https://kazzakiosk-backend-production-xxxx.up.railway.app

  static const String baseUrl = 'YOUR_RAILWAY_BACKEND_URL_HERE/api';

  // ⚠️ NÜMUNƏ (işləməz, öz URL-ni yaz):
  // static const String baseUrl = 'https://kazzakiosk-backend-production-1a2b.up.railway.app/api';

  // 💡 Local development (test üçün):
  // static const String baseUrl = 'http://localhost:3000/api';

  // Endpoints
  static const String login = '/auth/login';
  static const String profile = '/auth/profile';
  static const String kiosks = '/kiosks';
  static const String products = '/products';
  static const String sales = '/sales';
  static const String users = '/users';
  static const String reports = '/reports';

  // Timeout
  static const Duration timeout = Duration(seconds: 30);
}
