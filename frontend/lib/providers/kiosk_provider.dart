import 'package:flutter/material.dart';
import '../models/kiosk.dart';
import '../services/api_service.dart';

class KioskProvider with ChangeNotifier {
  List<Kiosk> _kiosks = [];
  Kiosk? _selectedKiosk;
  bool _isLoading = false;
  String? _error;

  List<Kiosk> get kiosks => _kiosks;
  Kiosk? get selectedKiosk => _selectedKiosk;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadKiosks() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/kiosks');
      _kiosks = (response['kiosks'] as List)
          .map((json) => Kiosk.fromJson(json))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectKiosk(Kiosk kiosk) {
    _selectedKiosk = kiosk;
    notifyListeners();
  }

  Future<bool> createKiosk(String kioskName) async {
    try {
      final response =
          await ApiService.post('/kiosks', {'kiosk_name': kioskName});
      final newKiosk = Kiosk.fromJson(response['kiosk']);
      _kiosks.add(newKiosk);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
