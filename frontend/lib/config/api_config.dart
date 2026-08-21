class ApiConfig {
  // Railway deployment URL - Bu URL Railway-də deploy edəndən sonra dəyişdiriləcək
  static const String baseUrl = 'https://your-app.up.railway.app/api';

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
