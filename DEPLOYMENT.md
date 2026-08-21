# KAZZAKIOSK - Railway Deployment Guide

## 🚀 Railway-də Deploy Edilməsi

### 1️⃣ **Railway Hesabı Yaradın**
- [Railway.app](https://railway.app/) saytına daxil olun
- GitHub hesabınızla qeydiyyatdan keçin

### 2️⃣ **PostgreSQL Database Yaradın**

1. Railway Dashboard-da **"New Project"** → **"Provision PostgreSQL"** seçin
2. Database yaradıldıqdan sonra **CONNECTION STRING** kopyalayın
3. Bu format olacaq:
   ```
   postgresql://username:password@hostname:port/database
   ```

### 3️⃣ **Backend Deploy**

#### GitHub vasitəsilə:
1. Railway Dashboard-da **"New Project"** → **"Deploy from GitHub repo"**
2. `KAZZAKiosk` repo-nu seçin
3. **Root Directory** olaraq `/backend` təyin edin
4. **Environment Variables** əlavə edin:
   ```
   DATABASE_URL=<PostgreSQL connection string>
   JWT_SECRET=your-super-secret-key-here
   JWT_EXPIRE=7d
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=<frontend URL>
   ```
5. Deploy başlayacaq (avtomatik)

#### Backend URL:
Deploy edildikdən sonra backend URL əldə edəcəksiniz:
```
https://your-backend.up.railway.app
```

### 4️⃣ **Frontend Deploy**

1. Railway Dashboard-da **"New Project"** → **"Deploy from GitHub repo"**
2. Eyni `KAZZAKiosk` repo-nu seçin
3. **Root Directory** olaraq `/frontend` təyin edin
4. **Build Command** (avtomatik tapılacaq):
   ```
   flutter build web
   ```
5. Deploy başlayacaq

**ƏHƏMYƏTLI:** Frontend deploy edildikdən sonra `lib/config/api_config.dart` faylında backend URL-ni dəyişdirin:

```dart
static const String baseUrl = 'https://your-backend.up.railway.app/api';
```

Git push edin:
```bash
git add .
git commit -m "Update backend URL"
git push
```

### 5️⃣ **Database Migration (İlk Dəfə)**

Backend deploy edildikdən sonra, database-i avtomatik yaradacaq (development mode).

Production üçün migration script yazmaq lazımdır:

Backend konteynerinə daxil olun (Railway CLI):
```bash
railway shell
node migrations/runMigrations.js
```

### 6️⃣ **İlk Admin İstifadəçisi Yaratmaq**

Database-ə birbaşa SQL ilə ilk admin əlavə edin:

```sql
INSERT INTO users (user_id, username, password, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$XXXXX', -- bcrypt hash
  'Admin',
  'admin',
  true,
  NOW(),
  NOW()
);
```

Və ya backend-ə POST request göndərin (registration endpoint yarada bilərsiniz).

---

## 📦 **PostgreSQL Backup**

Railway-də PostgreSQL backup çox rahatdır:

### Avtomatik Snapshot:
- Railway avtomatik olaraq database snapshot alır
- Settings → Database → Backups

### Manual Backup:
```bash
# Railway CLI ilə
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

### Scheduled Backups:
Railway Pro planında scheduled backups var.

---

## 🔧 **Environment Variables**

### Backend:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend.up.railway.app
```

### Frontend:
Frontend-də env variable yoxdur, API URL kodda hardcode olunub.

---

## 🎯 **Deployment Workflow**

1. **Kod yazın** (local)
2. **Git push** edin
3. **Railway avtomatik deploy edir**
4. **URL-ləri yoxlayın**

```bash
# Local development
cd backend && npm run dev
cd frontend && flutter run -d chrome

# Git push
git add .
git commit -m "New feature"
git push origin main

# Railway avtomatik build edəcək
```

---

## 🐛 **Troubleshooting**

### Backend logs:
Railway Dashboard → Backend Service → Logs

### Frontend logs:
Railway Dashboard → Frontend Service → Logs

### Database bağlantı xətası:
- `DATABASE_URL` düzgün təyin edildiyini yoxlayın
- SSL connection: Railway PostgreSQL SSL istəyir

### CORS xətası:
- Backend-də `CORS_ORIGIN` environment variable təyin edin
- Frontend URL-ni dəqiq yazın

---

## 💰 **Qiymətləndirmə**

- **PostgreSQL**: $5/ay
- **Backend + Frontend**: $5/ay (hər biri)
- **Yekun**: ~$10-15/ay

Railway-in **Free Tier** var:
- $5 credit hər ay
- 500 saat execution time

---

## ✅ **Final Checklist**

- [ ] PostgreSQL database yaradıldı
- [ ] Backend deploy edildi
- [ ] Backend environment variables təyin edildi
- [ ] Frontend deploy edildi
- [ ] Frontend-də backend URL dəyişdirildi
- [ ] Database migration edildi
- [ ] İlk admin user yaradıldı
- [ ] Test edildi

---

**Deploy edildikdən sonra sistemə daxil ola bilərsiniz!** 🎉

Backend: `https://your-backend.up.railway.app`
Frontend: `https://your-frontend.up.railway.app`
