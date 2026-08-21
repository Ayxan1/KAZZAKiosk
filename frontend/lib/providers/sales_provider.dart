import 'package:flutter/material.dart';
import '../models/sale.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class SalesProvider with ChangeNotifier {
  List<Sale> _sales = [];
  List<SaleItem> _cartItems = [];
  bool _isLoading = false;
  String? _error;

  List<Sale> get sales => _sales;
  List<SaleItem> get cartItems => _cartItems;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get cartTotal =>
      _cartItems.fold(0, (sum, item) => sum + item.subtotal);
  int get cartCount => _cartItems.fold(0, (sum, item) => sum + item.quantity);

  void addToCart(KioskProduct product, int quantity) {
    final existingIndex = _cartItems.indexWhere(
      (item) => item.productId == product.productId,
    );

    if (existingIndex != -1) {
      _cartItems[existingIndex] = SaleItem(
        productId: product.productId,
        quantity: _cartItems[existingIndex].quantity + quantity,
        unitPrice: product.price,
        subtotal:
            product.price * (_cartItems[existingIndex].quantity + quantity),
        product: product.product,
      );
    } else {
      _cartItems.add(SaleItem(
        productId: product.productId,
        quantity: quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
        product: product.product,
      ));
    }

    notifyListeners();
  }

  void removeFromCart(int index) {
    _cartItems.removeAt(index);
    notifyListeners();
  }

  void updateQuantity(int index, int quantity) {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    final item = _cartItems[index];
    _cartItems[index] = SaleItem(
      productId: item.productId,
      quantity: quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * quantity,
      product: item.product,
    );
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }

  Future<bool> completeSale(String kioskId, String paymentMethod) async {
    if (_cartItems.isEmpty) return false;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiService.post('/sales', {
        'kiosk_id': kioskId,
        'payment_method': paymentMethod,
        'items': _cartItems.map((item) => item.toJson()).toList(),
      });

      clearCart();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadSales(String kioskId,
      {DateTime? startDate, DateTime? endDate}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      String endpoint = '/sales/kiosk/$kioskId?';
      if (startDate != null) {
        endpoint += 'startDate=${startDate.toIso8601String()}&';
      }
      if (endDate != null) {
        endpoint += 'endDate=${endDate.toIso8601String()}';
      }

      final response = await ApiService.get(endpoint);
      _sales = (response['sales'] as List)
          .map((json) => Sale.fromJson(json))
          .toList();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
