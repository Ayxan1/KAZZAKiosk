class ApiConfig {
  // Railway deployment URL
  static const String baseUrl = 'https://kazzakiosk-production.up.railway.app/api';

  // Local development
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
