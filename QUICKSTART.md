# 🚀 Quick Start Guide

## Local Development (5 dəqiqə)

### 1️⃣ Tələblər:
```bash
✅ Node.js 18+ 
✅ PostgreSQL
✅ Flutter 3.0+
```

### 2️⃣ Database Yaratma:
```bash
# PostgreSQL-də database yaradın
createdb kazzakiosk

# və ya psql ilə:
psql -U postgres
CREATE DATABASE kazzakiosk;
```

### 3️⃣ Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
```

**.env** faylını redaktə edin:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/kazzakiosk
JWT_SECRET=super-secret-key-change-me
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

Database migration:
```bash
npm run migrate
```

İlk data əlavə et (admin və seller):
```bash
node migrations/seed.js
```

Backend başlat:
```bash
npm run dev
```

✅ Backend: http://localhost:3000

### 4️⃣ Frontend Setup:
```bash
cd frontend
flutter pub get
flutter run -d chrome
```

✅ Frontend: http://localhost:8080

---

## 🔐 Default Login:

### Admin:
```
Username: admin
Password: admin123
```

### Seller:
```
Username: seller
Password: seller123
Kiosk: Kiosk A
```

---

## 📦 Test Məlumatları:

Login etdikdən sonra:

1. **Seller** olaraq giriş edin
2. **Anbar** bölməsinə keçin
3. Məhsul əlavə edin:
   - Ad: Coca-Cola 0.5L
   - Kod: CC05
   - Barcode: 1234567890
   - Qiymət: 2.50
   - Stok: 100

4. **Satış** bölməsinə keçin
5. Məhsul axtarın və səbətə əlavə edin
6. Satışı tamamlayın

7. **Admin** olaraq giriş edin və **Məhsul Tarixçəsi**nə baxın

---

## 🐳 Docker ilə (opsional):

```bash
# Backend
cd backend
docker build -t kazzakiosk-backend .
docker run -p 3000:3000 --env-file .env kazzakiosk-backend

# Frontend
cd frontend
docker build -t kazzakiosk-frontend .
docker run -p 80:80 kazzakiosk-frontend
```

---

## 🚀 Railway Deploy:

Detallı təlimat: [DEPLOYMENT.md](./DEPLOYMENT.md)

Qısa yol:
1. Railway.app-da PostgreSQL yarat
2. GitHub repo-nu Railway-ə connect et
3. Backend deploy et (root: `/backend`)
4. Frontend deploy et (root: `/frontend`)
5. Environment variables təyin et
6. Database migrate et
7. İlk admin yaradın

---

## 🔧 Troubleshooting:

### Backend işləmir:
```bash
# Database connection yoxla
psql -U postgres -d kazzakiosk -c "SELECT 1;"

# Port məşğuldur?
lsof -ti:3000 | xargs kill -9

# Logs yoxla
npm run dev
```

### Frontend build xətası:
```bash
flutter clean
flutter pub get
flutter run -d chrome
```

### Database migration xətası:
```bash
# Drop və yenidən yarat
dropdb kazzakiosk
createdb kazzakiosk
npm run migrate
node migrations/seed.js
```

---

## 📞 Support:

Problem yaşayırsınızsa:
1. Logs-a baxın
2. `.env` faylını yoxlayın
3. Database bağlantısını test edin

---

Uğurlar! 🎉
