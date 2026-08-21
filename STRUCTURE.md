# KAZZAKIOSK - Layihə Strukturu

```
KAZZAKiosk/
│
├── backend/                          # Node.js Backend
│   ├── config/
│   │   └── database.js              # PostgreSQL konfiqurasiya
│   ├── controllers/
│   │   ├── authController.js        # Login, JWT
│   │   ├── kioskController.js       # Kiosk CRUD
│   │   ├── productController.js     # Məhsul idarəsi + Tarixçə
│   │   ├── salesController.js       # Satış əməliyyatları
│   │   ├── userController.js        # İstifadəçi idarəsi
│   │   └── reportController.js      # Hesabatlar
│   ├── middleware/
│   │   └── auth.js                  # JWT auth, role check
│   ├── migrations/
│   │   ├── runMigrations.js         # Database migration
│   │   └── seed.js                  # İlk data (admin, seller)
│   ├── models/
│   │   ├── Kiosk.js                 # Kiosk model
│   │   ├── User.js                  # İstifadəçi model
│   │   ├── Product.js               # Məhsul model
│   │   ├── KioskProduct.js          # Kiosk məhsul relation
│   │   ├── ProductHistory.js        # ⭐ Məhsul tarixçəsi
│   │   ├── Sale.js                  # Satış model
│   │   ├── SaleItem.js              # Satış items
│   │   └── index.js                 # Model associations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── kioskRoutes.js
│   │   ├── productRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── userRoutes.js
│   │   └── reportRoutes.js
│   ├── .env.example                 # Environment template
│   ├── .gitignore
│   ├── Dockerfile                   # Docker config
│   ├── package.json
│   ├── railway.json                 # Railway config
│   └── server.js                    # Entry point
│
├── frontend/                         # Flutter Web
│   ├── lib/
│   │   ├── config/
│   │   │   └── api_config.dart      # API URL konfiqurasiya
│   │   ├── models/
│   │   │   ├── user.dart
│   │   │   ├── kiosk.dart
│   │   │   ├── product.dart
│   │   │   └── sale.dart
│   │   ├── providers/               # State management
│   │   │   ├── auth_provider.dart
│   │   │   ├── kiosk_provider.dart
│   │   │   ├── product_provider.dart
│   │   │   └── sales_provider.dart
│   │   ├── router/
│   │   │   └── app_router.dart      # GoRouter konfiqurasiya
│   │   ├── screens/
│   │   │   ├── login_screen.dart
│   │   │   ├── seller/
│   │   │   │   └── seller_home_screen.dart
│   │   │   └── admin/
│   │   │       └── admin_home_screen.dart
│   │   ├── services/
│   │   │   └── api_service.dart     # HTTP client
│   │   ├── utils/
│   │   │   └── theme.dart           # App theme
│   │   └── main.dart                # Entry point
│   ├── web/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── .gitignore
│   ├── Dockerfile
│   ├── nginx.conf                   # Nginx konfiqurasiya
│   ├── pubspec.yaml
│   └── railway.json
│
├── .gitignore
├── DEPLOYMENT.md                    # Railway deploy təlimatı
├── QUICKSTART.md                    # Sürətli başlanğıc
├── README.md                        # Əsas sənədləşmə
└── setup.sh                         # Setup script

```

## 📊 Database Schema

```sql
kiosks
├─ kiosk_id (UUID, PK)
├─ kiosk_name (STRING)
├─ is_active (BOOLEAN)
└─ timestamps

users
├─ user_id (UUID, PK)
├─ username (STRING, UNIQUE)
├─ password (STRING, HASHED)
├─ full_name (STRING)
├─ role (ENUM: admin, seller)
├─ assigned_kiosk_id (UUID, FK → kiosks)
├─ is_active (BOOLEAN)
└─ timestamps

products
├─ product_id (UUID, PK)
├─ name (STRING)
├─ product_code (STRING, UNIQUE)
├─ barcode (STRING)
└─ timestamps

kiosk_products (Kiosk + Product relation)
├─ kiosk_product_id (UUID, PK)
├─ kiosk_id (UUID, FK → kiosks)
├─ product_id (UUID, FK → products)
├─ price (DECIMAL)
├─ stock_quantity (INTEGER)
└─ timestamps

product_history ⭐ (Audit log)
├─ history_id (UUID, PK)
├─ kiosk_id (UUID, FK → kiosks)
├─ product_id (UUID, FK → products)
├─ user_id (UUID, FK → users)
├─ action_type (ENUM: ADD, EDIT_NAME, EDIT_PRICE, EDIT_STOCK, ...)
├─ old_value (TEXT)
├─ new_value (TEXT)
├─ description (STRING)
└─ created_at

sales
├─ sale_id (UUID, PK)
├─ kiosk_id (UUID, FK → kiosks)
├─ seller_id (UUID, FK → users)
├─ total_amount (DECIMAL)
├─ payment_method (ENUM: CASH, CARD)
├─ sale_date (DATETIME)
└─ created_at

sale_items
├─ sale_item_id (UUID, PK)
├─ sale_id (UUID, FK → sales)
├─ product_id (UUID, FK → products)
├─ quantity (INTEGER)
├─ unit_price (DECIMAL)
└─ subtotal (DECIMAL)
```

## 🔄 Data Flow

### Satış prosesi:
```
1. Seller login → JWT token
2. Məhsul axtar (barcode/ad/kod)
3. Səbətə əlavə et
4. Ödəniş üsulu seç
5. Satışı tamamla
   → Sale record yarat
   → SaleItems yarat
   → Stock_quantity azalt
   → Success!
```

### Məhsul dəyişiklik tarixçəsi:
```
1. Seller məhsul əlavə edir
   → ProductHistory: action_type = "ADD"
   
2. Seller qiymət dəyişir
   → ProductHistory: action_type = "EDIT_PRICE"
   → old_value = "2.50"
   → new_value = "2.80"
   
3. Admin tarixçəyə baxır
   → Bütün dəyişikliklər görsənir
```

---

Bu strukturda hər şey aydın və təmizdir! 🎯
