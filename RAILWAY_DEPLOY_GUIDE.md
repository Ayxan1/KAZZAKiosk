# 🚀 RAILWAY DEPLOYMENT - Addım-Addım Təlimat

## ⚠️ ÖNƏMLİ: İlk olaraq backend URL lazımdır!

Railway-də deployment ardıcıllığı:
1. PostgreSQL Database
2. Backend (Node.js)
3. Frontend (Flutter Web) - Backend URL-i əvvəl almalısan

---

## 1️⃣ RAILWAY HESABI YARAT

1. [railway.app](https://railway.app) aç
2. **"Login with GitHub"** → GitHub hesabınla giriş et
3. ✅ Hazır!

---

## 2️⃣ POSTGRESQL DATABASE YARAT

1. Railway Dashboard → **"+ New Project"**
2. **"Provision PostgreSQL"** seç
3. Database yaradılacaq
4. Database-ə klik et → **"Connect"** tab
5. **"Postgres Connection URL"** kopyala və saxla

Məsələn:
```
postgresql://postgres:password123@containers-us-west-123.railway.app:5432/railway
```

---

## 3️⃣ BACKEND DEPLOY ET

### A. Service Yarat:
1. Dashboard → **"+ New"** → **"GitHub Repo"**
2. **"Configure GitHub App"** → **KAZZAKiosk** repo-na icazə ver
3. Repo-nu seç

### B. Backend Service Konfiqur Et:

**Settings → Service:**
- **Service Name**: `kazzakiosk-backend`

**Settings → Build:**
- **Root Directory**: `/backend`
- **Builder**: Nixpacks (avtomatik)

**Settings → Deploy:**
- **Start Command**: `node server.js` (avtomatik tapacaq)

**Settings → Variables (ƏHƏMYƏTLİ):**
```
DATABASE_URL = <PostgreSQL URL-ni bura yapışdır>
JWT_SECRET = super-secret-jwt-key-change-this-in-production
JWT_EXPIRE = 7d
NODE_ENV = production
PORT = 3000
```

**Settings → Networking:**
- **Generate Domain** klik et

Backend URL alacaqsan:
```
https://kazzakiosk-backend-production-xxxx.up.railway.app
```

### C. Deploy Başlayacaq:
- Logs-a bax: **"View Logs"**
- Deploy ~3-5 dəqiqə çəkər
- ✅ işarəsi görəndə hazırdır

---

## 4️⃣ DATABASE MIGRATION (ÇOX ƏHƏMYƏTLİ)

Backend deploy olundu, amma database boşdur. Migration lazımdır.

### Variant A: Railway CLI (Tövsiyə olunur):

```bash
# Railway CLI quraşdır (Mac)
brew install railway

# Login
railway login

# Project bağla
cd /Users/kamranhajili/Desktop/KAZZAKiosk/backend
railway link

# Backend service seç
railway service kazzakiosk-backend

# Migration işlət
railway run npm run setup
```

Bu komanda:
1. Database tables yaradacaq
2. İlk admin və seller user yaradacaq

### Variant B: Manual (Railway Web Dashboard):

**QISA YOL**: Backend service-də **server.js** artıq database sync edir:
```javascript
await sequelize.sync({ alter: false });
```

Amma ilk admin user yaratmaq lazımdır.

**PostgreSQL CLI-dan birbaşa:**

1. Railway Dashboard → PostgreSQL Database
2. **"Data"** tab → **"Query"** 
3. Bu SQL-i işlət:

```sql
-- Admin user yarat
INSERT INTO users (user_id, username, password, full_name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$YourBcryptHashHere', -- Mən aşağıda hash verəcəm
  'Admin',
  'admin',
  true,
  NOW(),
  NOW()
);
```

**Bcrypt hash üçün:**
```bash
# Local-da hash yarat:
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

Və ya Railway CLI:
```bash
railway connect postgres
# SQL-i ora yapışdır
```

---

## 5️⃣ FRONTEND DEPLOY ET

### ⚠️ ÖNƏMLİ: Əvvəl backend URL-ni frontend-ə əlavə et!

**A. Backend URL-ni əvvəl al:**
```
https://kazzakiosk-backend-production-xxxx.up.railway.app
```

**B. Local-da frontend kodunu dəyiş:**

Mən indi TEMPLATE fayl yaradıram, sən backend URL-ni oraya əlavə edəcəksən.

**C. Git push et:**
```bash
cd /Users/kamranhajili/Desktop/KAZZAKiosk
git add .
git commit -m "Update backend URL for Railway"
git push
```

**D. Frontend service yarat:**

1. Dashboard → **"+ New"** → **"GitHub Repo"** → **KAZZAKiosk**
2. **Settings → Service:**
   - **Service Name**: `kazzakiosk-frontend`

3. **Settings → Build:**
   - **Root Directory**: `/frontend`
   - **Builder**: Dockerfile (avtomatik tapacaq)

4. **Settings → Networking:**
   - **Generate Domain** klik et

Frontend URL:
```
https://kazzakiosk-frontend-production-xxxx.up.railway.app
```

**E. CORS Düzəlt:**

Backend-də CORS_ORIGIN əlavə et:

Railway Backend → **Variables** → Əlavə et:
```
CORS_ORIGIN = https://kazzakiosk-frontend-production-xxxx.up.railway.app
```

---

## 6️⃣ TEST ET

1. Frontend URL-ə daxil ol
2. Login:
   - **Username**: `admin`
   - **Password**: `admin123`

3. Əgər login işləmirsə:
   - Backend logs yoxla
   - Network tab-da API request yoxla
   - CORS xətası varsa, CORS_ORIGIN düzgün təyin edilib?

---

## ✅ FINAL CHECKLIST

- [ ] PostgreSQL database yaratdım
- [ ] Backend deploy etdim
- [ ] Backend URL aldım
- [ ] Database migration etdim (CLI və ya SQL)
- [ ] Admin user yaratdım
- [ ] Frontend kodunda backend URL dəyişdirdim
- [ ] Frontend deploy etdim
- [ ] CORS_ORIGIN təyin etdim
- [ ] Login test etdim

---

## 🐛 PROBLEM HALLARİ

### Backend deploy xətası:
```
Logs: "Error: getaddrinfo ENOTFOUND"
→ DATABASE_URL düzgündürmü? Yoxla.
```

### Frontend boş səhifə:
```
Browser Console → Network tab
→ API request gedirmi? 
→ Backend URL düzgündürmü?
```

### CORS xətası:
```
Backend Variables-da CORS_ORIGIN təyin et:
CORS_ORIGIN = https://your-frontend.up.railway.app
```

### Database connection xətası:
```
Railway PostgreSQL SSL tələb edir.
Backend config/database.js-də artıq SSL konfiqurasiya var.
```

---

## 💰 QİYMƏT

**Free Tier:**
- $5 credit/ay
- 500 saat execution
- PostgreSQL: Unlimited queries

**Starter Plan:**
- $5/ay (hər xidmət üçün)
- Backend + Frontend + PostgreSQL = ~$15/ay

---

## 📞 HELP

Hər hansı problem yaranarsa:
1. Railway Logs-a bax
2. Browser Console-a bax
3. Mənə yaz, kömək edərəm!

---

**Uğurlar! Deployment başlasın! 🚀**
