# KAZZAKIOSK 🏪

Modern Kiosk İdarəetmə Sistemi - Kiçik kiosklar üçün satış proqramı

## 📋 Xüsusiyyətlər

### ✅ Əsas Funksionallıq:
- **Satış İdarəetməsi**: Sürətli POS sistemi, barcode scanner dəstəyi
- **Anbar İdarəetməsi**: Məhsul əlavəsi, stok idarəetməsi, az stok xəbərdarlıqları
- **Məhsul Tarixçəsi**: Bütün məhsul dəyişikliklərinin qeydiyyatı (admin üçün)
- **Multi-Kiosk**: Bir sistemdə bir neçə kiosk idarə edin
- **İstifadəçi İdarəsi**: Admin və Satıcı rolları
- **Hesabatlar**: Satış statistikası, gəlir hesabatları, satıcı performansı
- **Ödəniş Üsulları**: Nağd və Kart

### 👥 İstifadəçi Rolları:
- **Admin**: Bütün kioskları idarə edir, hesabatlar görür, məhsul tarixçəsinə baxır
- **Satıcı**: Təyin olunduğu kioskda satış aparır, məhsul əlavə edib redaktə edə bilir

---

## 🛠️ Texnologiyalar

### Backend:
- **Node.js** + **Express.js**
- **PostgreSQL** (Sequelize ORM)
- **JWT** Authentication
- **RESTful API**

### Frontend:
- **Flutter Web** (responsive, modern UI)
- **Provider** (state management)
- **Google Fonts** (Inter)

### Deployment:
- **Railway** (Backend + PostgreSQL)
- **Railway** (Frontend - Nginx)

---

## 🚀 Quraşdırma

### 1. Backend:

```bash
cd backend
npm install
cp .env.example .env
# .env faylında DATABASE_URL və JWT_SECRET təyin edin
npm run dev
```

Backend `http://localhost:3000` ünvanında işləyəcək.

### 2. Frontend:

```bash
cd frontend
flutter pub get
flutter run -d chrome
```

Frontend `http://localhost:8080` ünvanında işləyəcək.

---

## 📊 Database Schema

### Tables:
- `kiosks` - Kiosklar
- `users` - İstifadəçilər (Admin və Satıcılar)
- `products` - Məhsullar
- `kiosk_products` - Hər kioskun məhsulları və qiymətləri
- `product_history` - Məhsul dəyişiklik tarixçəsi ⭐
- `sales` - Satışlar
- `sale_items` - Satış məhsulları

---

## 🎯 API Endpoints

### Authentication:
```
POST   /api/auth/login       - Login
GET    /api/auth/profile     - Get user profile
```

### Kiosks:
```
GET    /api/kiosks           - Get all kiosks (Admin)
POST   /api/kiosks           - Create kiosk (Admin)
GET    /api/kiosks/:id       - Get single kiosk
PUT    /api/kiosks/:id       - Update kiosk (Admin)
DELETE /api/kiosks/:id       - Delete kiosk (Admin)
```

### Products:
```
GET    /api/products/kiosk/:kioskId                      - Get products for kiosk
POST   /api/products/kiosk/:kioskId                      - Add product to kiosk
PUT    /api/products/kiosk/:kioskId/product/:productId   - Update product
DELETE /api/products/kiosk/:kioskId/product/:productId   - Delete product
GET    /api/products/history                              - Get product history (Admin)
```

### Sales:
```
POST   /api/sales                  - Create sale
GET    /api/sales/kiosk/:kioskId   - Get kiosk sales
GET    /api/sales                  - Get all sales (Admin)
GET    /api/sales/:id              - Get single sale
```

### Users:
```
GET    /api/users          - Get all users (Admin)
POST   /api/users          - Create user (Admin)
PUT    /api/users/:id      - Update user (Admin)
DELETE /api/users/:id      - Delete user (Admin)
```

### Reports:
```
GET    /api/reports/dashboard           - Dashboard stats
GET    /api/reports/sales               - Sales report
GET    /api/reports/low-stock           - Low stock products
GET    /api/reports/seller-performance  - Seller performance (Admin)
```

---

## 📱 Ekran Görüntüləri

### Login Ekranı:
- İstifadəçi adı və şifrə ilə giriş
- Satıcılar üçün kiosk seçimi

### Satıcı Paneli:
- **Satış**: Məhsul axtarışı, səbət, ödəniş
- **Anbar**: Məhsul siyahısı, məhsul əlavəsi
- **Tarixçə**: Satış tarixçəsi

### Admin Paneli:
- **Dashboard**: Statistika və hesabatlar
- **Kiosklar**: Kiosk idarəetməsi
- **Məhsul Tarixçəsi**: Bütün məhsul dəyişiklikləri ⭐
- **İstifadəçilər**: İstifadəçi idarəetməsi

---

## 🚀 Railway-də Deploy

Detallı deployment təlimatı üçün [DEPLOYMENT.md](./DEPLOYMENT.md) faylına baxın.

### Qısa təlimat:
1. Railway-də PostgreSQL yaradın
2. Backend deploy edin (GitHub repo)
3. Frontend deploy edin
4. Environment variables təyin edin
5. Database migration edin

---

## 🔐 Təhlükəsizlik

- JWT token authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- CORS protection
- SQL injection prevention (Sequelize ORM)

---

## 📝 Lisenziya

MIT License

---

## 👨‍💻 Müəllif

**Ayxan**

---

## 🙏 Təşəkkürlər

Bu layihə Railway, Flutter və Node.js istifadə edərək hazırlanıb.

---

**Uğurlar! 🎉**
