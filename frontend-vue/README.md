# KAZZAKIOSK Vue Frontend

Modern Vue.js 3 frontend for KAZZAKIOSK.

## Tech Stack
- Vue 3 + Composition API
- Vite
- Vue Router
- Pinia (State Management)
- Axios
- Tailwind CSS

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy to Railway

1. Push to GitHub
2. Railway Dashboard → New Project → Deploy from GitHub
3. Select repository and set root directory to `/frontend-vue`
4. Railway will auto-detect and deploy

## Features

### Admin Panel
- Dashboard with statistics
- Kiosks management
- Product change history
- User management

### Seller Panel
- POS (Point of Sale) system
- Product inventory management
- Sales history
- Shopping cart

## Login Credentials

**Admin:**
- Username: admin
- Password: admin123

**Seller:**
- Username: seller
- Password: seller123
- Kiosk: Kiosk A

## API Configuration

Backend URL is configured in `src/api/client.js`:
```javascript
const API_BASE_URL = 'https://kazzakiosk-production.up.railway.app/api'
```
