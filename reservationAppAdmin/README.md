# Restaurant Reservation Platform

A comprehensive restaurant reservation system with an admin dashboard that enables customers to book tables and restaurants to manage their reservations efficiently.

## Features

- 🔍 Advanced restaurant search and filtering
- 📅 Real-time reservation management
- 📊 Admin dashboard with analytics
- 💳 Secure payment processing
- 📱 Push notifications
- ⭐ Review and rating system
- 📈 Restaurant analytics and reporting

## Tech Stack

- **Frontend:** React.js, expo,
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Caching:** sessions
- **Real-time:** WebSocket

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-org/restaurant-reservation-app.git
cd restaurant-reservation-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

4. Start development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in a new terminal)
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

## Environment Variables

```env
# Backend
DATABASE_URL=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
_URL=//localhost:6379

# Frontend
REACT_APP_API_URL=http://localhost:3000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```



## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Reservations
- `GET /api/reservations` - List reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Cancel reservation

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Add restaurant (admin)
- `PUT /api/restaurants/:id` - Update restaurant (admin)

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## Deployment

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

## Documentation Link
 - https://docs.google.com/document/d/1y7V0_tuXOCXYUv_m7voCTDQahZjnEQ4idSkSJh-SZKg/edit?usp=sharing
 