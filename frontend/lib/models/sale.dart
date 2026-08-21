import 'product.dart';

class Sale {
  final String saleId;
  final String kioskId;
  final String sellerId;
  final double totalAmount;
  final String paymentMethod;
  final DateTime saleDate;
  final List<SaleItem> items;

  Sale({
    required this.saleId,
    required this.kioskId,
    required this.sellerId,
    required this.totalAmount,
    required this.paymentMethod,
    required this.saleDate,
    required this.items,
  });

  factory Sale.fromJson(Map<String, dynamic> json) {
    return Sale(
      saleId: json['sale_id'],
      kioskId: json['kiosk_id'],
      sellerId: json['seller_id'],
      totalAmount: double.parse(json['total_amount'].toString()),
      paymentMethod: json['payment_method'],
      saleDate: DateTime.parse(json['sale_date']),
      items: json['items'] != null
          ? (json['items'] as List).map((i) => SaleItem.fromJson(i)).toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'kiosk_id': kioskId,
      'payment_method': paymentMethod,
      'items': items.map((item) => item.toJson()).toList(),
    };
  }
}

class SaleItem {
  final String? saleItemId;
  final String productId;
  final int quantity;
  final double unitPrice;
  final double subtotal;
  final Product? product;

  SaleItem({
    this.saleItemId,
    required this.productId,
    required this.quantity,
    required this.unitPrice,
    required this.subtotal,
    this.product,
  });

  factory SaleItem.fromJson(Map<String, dynamic> json) {
    return SaleItem(
      saleItemId: json['sale_item_id'],
      productId: json['product_id'],
      quantity: json['quantity'],
      unitPrice: double.parse(json['unit_price'].toString()),
      subtotal: double.parse(json['subtotal'].toString()),
      product:
          json['product'] != null ? Product.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'quantity': quantity,
    };
  }
}
