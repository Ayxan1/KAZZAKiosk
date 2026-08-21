#!/bin/bash

echo "🚀 KAZZAKIOSK - Local Development Setup"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Copy env file if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env file created from .env.example"
    echo "    Please update DATABASE_URL and JWT_SECRET"
else
    echo "✅ .env file exists"
fi

echo ""
echo "📦 Setting up Frontend..."
cd ../frontend
flutter pub get
echo "✅ Flutter dependencies installed"

echo ""
echo "🎉 Setup completed!"
echo ""
echo "To start the project:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && flutter run -d chrome"
echo ""
echo "Default credentials (after seed):"
echo "  Admin:  username: admin, password: admin123"
echo "  Seller: username: seller, password: seller123"
echo ""
