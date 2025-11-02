# livebustracking Project Setup Guide

## Overview
livebustracking is a ride-sharing application consisting of multiple components:
- **Driver App**: React Native app for drivers (using Expo)
- **User App**: React Native app for users (using Expo)
- **Server**: Node.js/Express backend with TypeScript, Prisma ORM, and MongoDB
- **Socket Server**: WebSocket server for real-time communication (driver locations and ride requests)

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo CLI (`npm install -g @expo/cli`)
- Git

## Project Structure
```
livebustracking-main/
├── driver/          # Driver React Native app
├── user/            # User React Native app
├── server/          # Backend API server
├── socket/          # WebSocket server
├── TODO.md          # Completed tasks for user features
├── TODO2.md         # Completed tasks for driver features
└── setup.md         # This file
```

## Environment Variables
Create a `.env` file in the `server/` directory with the following variables:
```
DATABASE_URL="mongodb://localhost:27017/livebustracking"  # Or your MongoDB connection string
NYLAS_API_KEY=your_nylas_api_key_here
PORT=8000  # Or your preferred port
```

For the mobile apps, create `.env` files in `driver/` and `user/` directories:
```
EXPO_PUBLIC_SERVER_URI=http://localhost:8000/api/v1
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd livebustracking-main
```

### 2. Install Dependencies

#### Server
```bash
cd server
npm install
```

#### Socket Server
```bash
cd ../socket
npm install
```

#### Driver App
```bash
cd ../driver
npm install
```

#### User App
```bash
cd ../user
npm install
```

### 3. Database Setup
```bash
cd server
npx prisma generate
npx prisma db push  # This will create the database schema
```

### 4. Running the Application

#### Start the Backend Server
```bash
cd server
npm run dev  # For development with hot reload
# or
npm run start  # For production build
```

#### Start the Socket Server
```bash
cd socket
npm start
```

#### Start the Driver App
```bash
cd driver
npm start
# Then press 'a' for Android emulator, 'i' for iOS simulator, or 'w' for web
```

#### Start the User App
```bash
cd user
npm start
# Then press 'a' for Android emulator, 'i' for iOS simulator, or 'w' for web
```

## API Endpoints
- Base URL: `http://localhost:8000/api/v1`
- User routes: `/api/v1/...`
- Driver routes: `/api/v1/driver/...`
- Test endpoint: `GET /test`

## WebSocket
- Server runs on port 8080
- Handles driver location updates and ride requests

## Notes
- The project has email verification features commented out as per TODO files
- Uses MongoDB as the database
- Integrates with Google Maps API for location services
- Uses Twilio for SMS OTP (though email OTP is disabled)
- Nylas integration is configured but may not be fully utilized

## Troubleshooting
- Ensure MongoDB is running locally or update DATABASE_URL for cloud instance
- Check that all environment variables are set correctly
- For mobile apps, ensure Expo CLI is installed and configured
- If ports are in use, update them in respective files (server.ts, server.js)
