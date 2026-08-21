class Kiosk {
  final String kioskId;
  final String kioskName;
  final bool isActive;
  final DateTime createdAt;

  Kiosk({
    required this.kioskId,
    required this.kioskName,
    required this.isActive,
    required this.createdAt,
  });

  factory Kiosk.fromJson(Map<String, dynamic> json) {
    return Kiosk(
      kioskId: json['kiosk_id'],
      kioskName: json['kiosk_name'],
      isActive: json['is_active'] ?? true,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'kiosk_id': kioskId,
      'kiosk_name': kioskName,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
