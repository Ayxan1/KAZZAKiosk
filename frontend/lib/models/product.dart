class Product {
  final String productId;
  final String name;
  final String? productCode;
  final String? barcode;

  Product({
    required this.productId,
    required this.name,
    this.productCode,
    this.barcode,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id'],
      name: json['name'],
      productCode: json['product_code'],
      barcode: json['barcode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'name': name,
      'product_code': productCode,
      'barcode': barcode,
    };
  }
}

class KioskProduct {
  final String kioskProductId;
  final String kioskId;
  final String productId;
  final double price;
  final int stockQuantity;
  final Product product;

  KioskProduct({
    required this.kioskProductId,
    required this.kioskId,
    required this.productId,
    required this.price,
    required this.stockQuantity,
    required this.product,
  });

  factory KioskProduct.fromJson(Map<String, dynamic> json) {
    return KioskProduct(
      kioskProductId: json['kiosk_product_id'],
      kioskId: json['kiosk_id'],
      productId: json['product_id'],
      price: double.parse(json['price'].toString()),
      stockQuantity: json['stock_quantity'],
      product: Product.fromJson(json['product']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'kiosk_product_id': kioskProductId,
      'kiosk_id': kioskId,
      'product_id': productId,
      'price': price,
      'stock_quantity': stockQuantity,
      'product': product.toJson(),
    };
  }

  bool get isLowStock => stockQuantity <= 10;
}
