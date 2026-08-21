import 'kiosk.dart';

class User {
  final String userId;
  final String username;
  final String fullName;
  final String role;
  final String? assignedKioskId;
  final bool isActive;
  final Kiosk? assignedKiosk;

  User({
    required this.userId,
    required this.username,
    required this.fullName,
    required this.role,
    this.assignedKioskId,
    this.isActive = true,
    this.assignedKiosk,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['user_id'],
      username: json['username'],
      fullName: json['full_name'],
      role: json['role'],
      assignedKioskId: json['assigned_kiosk_id'],
      isActive: json['is_active'] ?? true,
      assignedKiosk: json['assignedKiosk'] != null
          ? Kiosk.fromJson(json['assignedKiosk'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'username': username,
      'full_name': fullName,
      'role': role,
      'assigned_kiosk_id': assignedKioskId,
      'is_active': isActive,
    };
  }

  bool get isAdmin => role == 'admin';
  bool get isSeller => role == 'seller';
}
