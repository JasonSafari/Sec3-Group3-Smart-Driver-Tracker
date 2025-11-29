# Driver Analytics Backend API

Backend REST API for the Driver Analytics application - a system for tracking and analyzing teen driving behavior with parent oversight.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** express-validator

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=DriverAnalytics
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_DIALECT=mysql
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=15m
CORS_ORIGIN=*
```

**Important:** 
- Replace `your_database_user` and `your_database_password` with your MySQL credentials
- Generate a secure `JWT_SECRET` (minimum 32 characters, recommended 64+):
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

### 3. Create Database

Run the SQL script to create the database schema:

```bash
mysql -u your_user -p < ../DriverAnalyticsDatabase.sql
```

Or execute `DriverAnalyticsDatabase.sql` in your MySQL client.

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Access:** Public
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "parent"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "parent",
      "family_id": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "parent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Protected Routes

#### Test Protected Route
- **GET** `/api/test/protected`
- **Access:** Private (requires JWT token)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):**
  ```json
  {
    "message": "Protected route accessed successfully",
    "user": {
      "userId": 1,
      "email": "john@example.com",
      "role": "parent"
    }
  }
  ```

### Health Check

#### Server Status
- **GET** `/health`
- **Access:** Public
- **Response (200):**
  ```json
  {
    "status": "ok",
    "message": "Driver Analytics API is running",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

## Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"parent"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Protected Route:**
```bash
curl -X GET http://localhost:3000/api/test/protected \
  -H "Authorization: Bearer <your_token>"
```

### Using Thunder Client / Postman

1. Set method to `POST` or `GET`
2. Enter the URL: `http://localhost:3000/api/auth/register` (or other endpoint)
3. Add header: `Content-Type: application/json`
4. Add JSON body (for POST requests)
5. For protected routes, add: `Authorization: Bearer <token>`

## Database Schema

The database includes the following tables:

- **users**: User accounts (parents and teens)
  - `user_id`, `name`, `email`, `password`, `role`, `family_id`
- **family_accounts**: Family groups with invite codes
  - `family_id`, `family_name`, `invite_code`
- **trips**: Driving trip records
  - `trip_id`, `user_id`, `start_time`, `end_time`, `distance_km`, `avg_speed`, `score_id`
- **scores**: Driving performance scores
  - `score_id`, `overall_score`, `speed_score`, `brake_score`, `created_at`
- **datapoints**: GPS and sensor data points
  - `point_id`, `trip_id`, `timestamp`, `latitude`, `longitude`, `speed`, `acceleration`

See `DriverAnalyticsDatabase.sql` for the complete schema.

## Sprint 2 API Examples

### Create Family
```bash
curl -X POST http://localhost:3000/api/families \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"family_name":"Smith Family"}'
```

### Join Family
```bash
curl -X POST http://localhost:3000/api/families/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"invite_code":"A1B2C3"}'
```

### Create Data Points (Batch)
```bash
curl -X POST http://localhost:3000/api/datapoints/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "trip_id": 1,
    "datapoints": [
      {"latitude": 43.4516, "longitude": -80.4925, "speed": 48.5, "acceleration": 0.8},
      {"latitude": 43.4520, "longitude": -80.4950, "speed": 52.0, "acceleration": -0.5}
    ]
  }'
```

### Calculate Score from Trip
```bash
curl -X POST http://localhost:3000/api/scores/calculate/1 \
  -H "Authorization: Bearer <token>"
```

### Get Analytics
```bash
curl -X GET "http://localhost:3000/api/analytics/trips/summary" \
  -H "Authorization: Bearer <token>"
```

## Sprint 1 Completed Features

✅ **Environment Configuration**
- `.env` file structure defined
- All required environment variables documented

✅ **Database Connection**
- Sequelize configured for MySQL
- Connection testing implemented
- Proper error handling

✅ **User Model**
- Complete Sequelize model matching database schema
- Password hashing with bcrypt (10 rounds)
- Password comparison method
- Input validation
- Email normalization (lowercase)

✅ **JWT Authentication**
- Token generation utility
- Token verification utility
- Configurable expiration time

✅ **Authentication Middleware**
- JWT token extraction from headers
- Token validation
- User context attachment to requests

✅ **Auth Controller**
- User registration with validation
- User login with password verification
- Proper error handling and status codes

✅ **Auth Routes**
- POST `/api/auth/register` with validation
- POST `/api/auth/login` with validation
- Express-validator middleware

✅ **Test Route**
- GET `/api/test/protected` for testing authentication

✅ **Express Server**
- CORS enabled
- JSON body parsing
- Route mounting
- Error handling middleware
- Health check endpoint

## Security Features

- **Password Hashing:** All passwords are hashed using bcrypt (10 salt rounds)
- **JWT Tokens:** Secure token-based authentication
- **Input Validation:** All user inputs validated using express-validator
- **SQL Injection Protection:** Sequelize ORM with parameterized queries
- **CORS:** Configured for cross-origin requests

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid token)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Sprint 2 Features (✅ COMPLETE)

### Family Account Management
- **POST** `/api/families` - Create a new family account
- **GET** `/api/families/me` - Get current user's family
- **GET** `/api/families/:id` - Get family by ID
- **GET** `/api/families/:id/members` - Get all family members
- **POST** `/api/families/join` - Join a family using invite code
- **POST** `/api/families/leave` - Leave current family

### Score Management
- **GET** `/api/scores` - Get all scores for user's trips
- **GET** `/api/scores/:id` - Get score by ID
- **POST** `/api/scores` - Create score manually
- **POST** `/api/scores/calculate/:tripId` - Calculate score from trip data points

### Data Point Collection
- **GET** `/api/datapoints/trip/:tripId` - Get all data points for a trip
- **GET** `/api/datapoints/:id` - Get single data point
- **POST** `/api/datapoints` - Create single data point
- **POST** `/api/datapoints/batch` - Create multiple data points (batch)
- **DELETE** `/api/datapoints/:id` - Delete data point

### Analytics & Reporting
- **GET** `/api/analytics/trips/summary` - Get trip summary statistics
- **GET** `/api/analytics/performance/trends?days=30` - Get performance trends
- **GET** `/api/analytics/safety` - Get safety metrics
- **GET** `/api/analytics/family` - Get family analytics (for parents)

### Role-Based Access Control
- Middleware for role verification (`requireParent`, `requireTeen`)
- Family-scoped access control
- User-scoped data access

## Next Steps (Sprint 3)

- [ ] Real-time trip tracking (WebSocket support)
- [ ] Push notifications for parents
- [ ] Advanced analytics (heat maps, route analysis)
- [ ] Export trip data (CSV, PDF reports)
- [ ] Trip sharing between family members
- [ ] Customizable score calculation parameters

## Troubleshooting

### Database Connection Issues
- Verify MySQL server is running
- Check `.env` file has correct database credentials
- Ensure database exists: `CREATE DATABASE DriverAnalytics;`
- Verify user has proper permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process: `npx kill-port 3000`

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random secret (64+ characters recommended)
- Restart server after changing `.env`

### Validation Errors
- Check request body matches expected format
- Verify all required fields are present
- Ensure email format is valid
- Password must be at least 8 characters

## License

ISC
