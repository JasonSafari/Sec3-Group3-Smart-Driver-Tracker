# Driver Analytics Backend API

Backend REST API for tracking and analyzing teen driving behavior with parent oversight.

## Tech Stack

- Node.js + Express.js
- MySQL + Sequelize ORM
- JWT Authentication
- bcrypt for password hashing

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment

Create `.env` file:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=DriverAnalytics
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DIALECT=mysql
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=15m
CORS_ORIGIN=*
```

### 3. Create Database
Run `DriverAnalyticsDatabase.sql` in MySQL.

### 4. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Main API Endpoints

### Authentication
- `POST /api/auth/register` - Register user (parent or teen)
- `POST /api/auth/login` - Login and get JWT token

### Family Management
- `POST /api/families` - Create family (returns invite code)
- `POST /api/families/join` - Join family with invite code
- `GET /api/families/members` - View family members

### Trip Recording
- `POST /api/trips/start` - Start trip with coordinates
- `POST /api/trips/:trip_id/datapoints` - Upload GPS data
- `POST /api/trips/:trip_id/stop` - Stop trip (auto-calculates score)

### Viewing Results
- `GET /api/trips` - Get trips (supports `?userId=X` for parents)
- `GET /api/trips/family` - Get all family trips
- `GET /api/analytics/user/:userId?` - Get statistics

### Other Endpoints
- `GET /api/scores` - Get scores
- `GET /api/analytics/trips/summary` - Trip summary
- `GET /health` - Health check

## Quick Test

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"parent"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token from login for protected routes
curl -X GET http://localhost:3000/api/trips \
  -H "Authorization: Bearer <token>"
```

## Database Schema

- **users**: user_id, name, email, password, role, family_id
- **family_accounts**: family_id, family_name, invite_code
- **trips**: trip_id, user_id, start_time, end_time, distance_km, avg_speed, score_id
- **scores**: score_id, overall_score, speed_score, brake_score, created_at
- **datapoints**: point_id, trip_id, timestamp, latitude, longitude, speed, acceleration

## Features

- User authentication (JWT)
- Family account management with invite codes
- Trip recording (start, upload GPS data, stop)
- Automatic score calculation (65 mph algorithm)
- Parent/teen permission system
- Trip history and analytics

## License

ISC
