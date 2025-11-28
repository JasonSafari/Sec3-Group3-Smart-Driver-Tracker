# Sec3-Group3-Smart-Driver-Tracker

A comprehensive driver analytics application that tracks and analyzes driving behavior for parents and teens, featuring real-time trip monitoring, scoring, and family account management.

## 📋 Project Overview

This project consists of multiple components:
- **Backend API**: Node.js/Express REST API with MySQL database
- **Mobile App**: React Native/Expo application (DriverAnalyticsApp)
- **Database**: MySQL database with driver analytics schema

## 🏗️ Project Structure

```
Sec3-Group3-Smart-Driver-Tracker-1/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Configuration files (database, JWT)
│   ├── controllers/       # Request handlers
│   ├── middleware/         # Custom middleware (auth, etc.)
│   ├── models/            # Sequelize database models
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions
│   └── server.js          # Express server entry point
├── DriverAnalyticsApp/     # React Native/Expo mobile app
│   ├── app/               # App screens and navigation
│   ├── components/        # Reusable React components
│   ├── constants/         # App constants
│   └── hooks/             # Custom React hooks
├── src/                    # Additional source files (C#)
├── DriverAnalyticsDatabase.sql  # Database schema
└── README.md              # This file
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

### Mobile App
- **Framework**: React Native
- **Platform**: Expo
- **Navigation**: Expo Router
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn
- Expo CLI (for mobile app development)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
   # Database Configuration
   DB_NAME=DriverAnalytics
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   JWT_EXPIRES_IN=15m

   # Server Configuration
   PORT=3000
   ```

   **Generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Set up the database**
   - Run the SQL script to create the database schema:
     ```bash
     mysql -u your_user -p < ../DriverAnalyticsDatabase.sql
     ```
   - Or execute `DriverAnalyticsDatabase.sql` in your MySQL client

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`

### Mobile App Setup

1. **Navigate to app directory**
   ```bash
   cd DriverAnalyticsApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Expo development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for web

## 📡 API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "parent"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "parent"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Protected Routes

#### Test Protected Route
- **GET** `/api/test/protected`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
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
- **Response:**
  ```json
  {
    "status": "ok",
    "message": "Driver Analytics API is running",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, you'll receive a token that should be included in subsequent requests:

```
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

The database includes the following main tables:
- **users**: User accounts (parents and teens)
- **family_accounts**: Family groups with invite codes
- **trips**: Driving trip records
- **scores**: Driving performance scores
- **datapoints**: GPS and sensor data points

See `DriverAnalyticsDatabase.sql` for the complete schema.

## 🧪 Testing the API

### Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension in VS Code
2. Create a new request
3. Set method to `POST`
4. Enter URL: `http://localhost:3000/api/auth/register`
5. Add header: `Content-Type: application/json`
6. Add JSON body with user data
7. Click Send

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"parent"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Protected Route
curl -X GET http://localhost:3000/api/test/protected \
  -H "Authorization: Bearer <your_token>"
```

## 📝 Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon (auto-reload)

### Mobile App
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify MySQL server is running
- Check `.env` file has correct database credentials
- Ensure database exists: `CREATE DATABASE DriverAnalytics;`

**Port Already in Use**
- Change `PORT` in `.env` file
- Or kill the process: `npx kill-port 3000`

**JWT Errors**
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong, random secret (64+ characters recommended)

### Mobile App Issues

**Expo Not Starting**
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📄 License

ISC

## 👥 Contributors

Sec3 Group 3

---

For more detailed information about specific components, see:
- `backend/README.md` - Backend API documentation
- `DriverAnalyticsApp/README.md` - Mobile app documentation
