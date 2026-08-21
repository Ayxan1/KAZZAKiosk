import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductProvider with ChangeNotifier {
  List<KioskProduct> _products = [];
  bool _isLoading = false;
  String? _error;

  List<KioskProduct> get products => _products;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProducts(String kioskId, {String? search}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String endpoint = '/products/kiosk/$kioskId';
      if (search != null && search.isNotEmpty) {
        endpoint += '?search=$search';
      }

      final response = await ApiService.get(endpoint);
      _products = (response['products'] as List)
          .map((json) => KioskProduct.fromJson(json))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addProduct(
    String kioskId, {
    required String name,
    String? productCode,
    String? barcode,
    required double price,
    required int stockQuantity,
  }) async {
    try {
      await ApiService.post('/products/kiosk/$kioskId', {
        'name': name,
        'product_code': productCode,
        'barcode': barcode,
        'price': price,
        'stock_quantity': stockQuantity,
      });
      await loadProducts(kioskId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProduct(
    String kioskId,
    String productId, {
    String? name,
    String? productCode,
    String? barcode,
    double? price,
    int? stockQuantity,
  }) async {
    try {
      await ApiService.put('/products/kiosk/$kioskId/product/$productId', {
        if (name != null) 'name': name,
        if (productCode != null) 'product_code': productCode,
        if (barcode != null) 'barcode': barcode,
        if (price != null) 'price': price,
        if (stockQuantity != null) 'stock_quantity': stockQuantity,
      });
      await loadProducts(kioskId);
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  KioskProduct? findByBarcode(String barcode) {
    try {
      return _products.firstWhere(
        (p) => p.product.barcode == barcode,
      );
    } catch (e) {
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
