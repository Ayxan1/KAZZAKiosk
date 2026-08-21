import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/kiosk.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  Kiosk? _selectedKiosk;
  bool _isLoading = false; // Start false, check token manually if needed
  String? _error;

  AuthProvider() {
    // Don't auto-init, let UI trigger it
    _checkToken();
  }

  void _checkToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');

    if (_token != null) {
      ApiService.setToken(_token);
      try {
        await loadProfile();
      } catch (e) {
        // Silently fail and show login
        _token = null;
      }
    }
    notifyListeners();
  }

  User? get user => _user;
  String? get token => _token;
  Kiosk? get selectedKiosk => _selectedKiosk;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null && _token != null;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isSeller => _user?.isSeller ?? false;

  Future<bool> login(String username, String password, String? kioskId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.post(
        '/auth/login',
        {
          'username': username,
          'password': password,
          if (kioskId != null) 'kiosk_id': kioskId,
        },
        auth: false,
      );

      _token = response['token'];
      _user = User.fromJson(response['user']);

      ApiService.setToken(_token);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadProfile() async {
    try {
      final response = await ApiService.get('/auth/profile');
      _user = User.fromJson(response['user']);
      notifyListeners();
    } catch (e) {
      throw Exception('Profil yüklənmədi: $e');
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    _selectedKiosk = null;
    ApiService.setToken(null);

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');

    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
