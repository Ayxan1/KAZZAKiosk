#!/bin/bash

echo "🚀 Railway Backend URL Setup"
echo ""

if [ -z "$1" ]; then
    echo "❌ Backend URL verilməyib!"
    echo ""
    echo "İstifadə:"
    echo "  ./update-backend-url.sh https://your-backend.up.railway.app"
    echo ""
    exit 1
fi

BACKEND_URL="$1"

echo "Backend URL: $BACKEND_URL"
echo ""

# Update api_config.dart
cat > frontend/lib/config/api_config.dart << EOF
class ApiConfig {
  // Railway Backend URL
  static const String baseUrl = '${BACKEND_URL}/api';
  
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
EOF

echo "✅ api_config.dart yeniləndi!"
echo ""
echo "İndi git push et:"
echo "  git add ."
echo "  git commit -m 'Update backend URL for Railway'"
echo "  git push"
echo ""
