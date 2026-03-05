Project Management App Monorepo


cd backend
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve


cd frontend
copy .env.example .env
npm install
npm run dev
