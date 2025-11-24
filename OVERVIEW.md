# Ridewave - Complete Ride-Sharing Application Overview

## Project Architecture

Ridewave is a comprehensive ride-sharing platform consisting of four main components:

### 1. **User Mobile App** (React Native with Expo)
- Location: `/user/`
- Target: Passengers seeking rides
- Features: Ride booking, real-time tracking, payment, history

### 2. **Driver Mobile App** (React Native with Expo)
- Location: `/driver/`
- Target: Drivers providing transportation services
- Features: Ride acceptance, location sharing, earnings tracking

### 3. **Backend Server** (Node.js/Express with TypeScript)
- Location: `/server/`
- Technologies: Express.js, Prisma ORM, MongoDB, JWT authentication
- Features: API endpoints, user/driver management, ride coordination

### 4. **WebSocket Server** (Node.js)
- Location: `/socket/`
- Purpose: Real-time communication between users, drivers, and server
- Features: Live location updates, ride requests/responses

## Database Schema (MongoDB with Prisma)

```prisma
model User {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  email             String   @unique
  phone_number      String   @unique
  country_code      String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  rides             Ride[]
  otp               String?
  otp_expires_at    DateTime?
}

model Driver {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  email             String   @unique
  phone_number      String   @unique
  country_code      String
  vehicle_type      String
  vehicle_number    String
  vehicle_model     String
  license_number    String
  rate              String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  rides             Ride[]
  otp               String?
  otp_expires_at    DateTime?
}

model Ride {
  id                        String   @id @default(auto()) @map("_id") @db.ObjectId
  driverId                  String   @db.ObjectId
  userId                    String   @db.ObjectId
  charge                    String
  currentLocationName       String
  destinationLocationName   String
  distance                  String
  status                    String   @default("pending")
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  driver                    Driver   @relation(fields: [driverId], references: [id])
  user                      User     @relation(fields: [userId], references: [id])
}
```

## User App Flow

### 1. **Onboarding & Registration**
- **Screen**: `user/screens/onboarding/onboarding.screen.tsx`
- **Flow**: Welcome screens → Registration → Phone verification → Email verification (disabled)
- **Features**: Country selection, phone number input, OTP verification

### 2. **Authentication**
- **Login**: `user/screens/login/login.screen.tsx`
- **Phone Verification**: `user/screens/verification/otp-verification.screen.tsx`
- **Flow**: Phone number → OTP → Home screen

### 3. **Home Screen**
- **Screen**: `user/screens/home/home.screen.tsx`
- **Features**:
  - Location search bar (navigates to ride planning)
  - Recent rides display
  - Navigation to services, history, profile tabs

### 4. **Ride Planning**
- **Screen**: `user/screens/rideplan/rideplan.screen.tsx`
- **Features**:
  - Google Places Autocomplete for destination input
  - Current location detection
  - Map view with route visualization
  - Real-time driver availability via WebSocket
  - Vehicle type selection (Car, Motorcycle)
  - Distance and fare calculation
  - Travel time estimation

### 5. **Ride Booking Process**
1. User enters destination using Google Places API
2. System fetches nearby drivers via WebSocket
3. User selects vehicle type and driver
4. Booking confirmation with fare details
5. Push notification to driver
6. Driver acceptance/rejection handling

### 6. **Ride Tracking**
- **Screen**: `user/screens/ride-details/ride-details.screen.tsx`
- **Features**: Real-time driver location, route tracking, driver details

### 7. **Additional Features**
- **Services Tab**: `user/app/(tabs)/services/index.tsx` - Service map view
- **History Tab**: `user/app/(tabs)/history/index.tsx` - Ride history
- **Profile Tab**: `user/app/(tabs)/profile/index.tsx` - User profile management

## Driver App Flow

### 1. **Registration Process**
- **Phone Verification**: `driver/screens/verifications/phone-number.screen.tsx`
- **Signup**: `driver/screens/signup/signup.screen.tsx` - Personal details
- **Document Verification**: `driver/screens/document-verification/document.verification.screen.tsx` - Vehicle documents
- **Email Verification**: Disabled (commented out)

### 2. **Authentication**
- **Login**: `driver/screens/login/login.screen.tsx`
- **OTP Verification**: Phone-based authentication

### 3. **Driver Dashboard**
- **Home Screen**: `driver/screens/home/home.screen.tsx`
- **Features**:
  - Real-time location sharing
  - Ride request notifications
  - Earnings tracking
  - Online/offline status

### 4. **Ride Management**
- **Ride Details**: `driver/screens/ride-details/ride-details.screen.tsx`
- **Features**:
  - Accept/reject ride requests
  - Navigate to pickup location
  - Real-time location updates to user
  - Ride completion

### 5. **Additional Features**
- **Profile**: Driver profile management
- **Services**: Service area management

## Backend Architecture

### API Endpoints

#### User Routes (`/api/v1/user/`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-otp` - OTP verification
- `GET /get-rides` - Get user's ride history
- `POST /create-ride` - Create new ride booking

#### Driver Routes (`/api/v1/driver/`)
- `POST /register` - Driver registration
- `POST /login` - Driver login
- `POST /verify-otp` - OTP verification
- `GET /get-drivers-data` - Get driver information
- `POST /register-direct` - Direct driver registration

### Key Controllers
- **User Controller**: `server/controllers/user.controller.ts`
- **Driver Controller**: `server/controllers/driver.controller.ts`
- **Authentication**: JWT-based with phone OTP verification

## Real-time Features (WebSocket)

### Server: `socket/server.js`
- **Port**: 8080
- **Events**:
  - `requestRide`: User requests nearby drivers
  - `nearbyDrivers`: Server responds with available drivers
  - `rideAccepted`: Driver accepts ride
  - `rideRejected`: Driver rejects ride
  - `locationUpdate`: Real-time driver location updates

### Integration Points
- **User App**: Connects to WebSocket for ride requests and driver locations
- **Driver App**: Shares location updates and responds to ride requests
- **Server**: Coordinates communication between users and drivers

## Key Technologies & Integrations

### Mobile Apps
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Maps**: React Native Maps with MapViewDirections
- **Location**: Expo Location API
- **Places**: Google Places API for autocomplete
- **Notifications**: Expo Notifications API
- **Storage**: AsyncStorage for local data

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens
- **SMS**: Twilio for OTP (email disabled)
- **Real-time**: WebSocket for live updates

### External Services
- **Google Maps API**: Places autocomplete, geocoding, directions
- **Twilio**: SMS OTP verification
- **Expo Push Notifications**: Cross-platform notifications

## Security Features
- JWT authentication for API access
- Phone number OTP verification
- Secure WebSocket connections
- Environment variable configuration
- Input validation and sanitization

## Deployment Considerations
- **Mobile Apps**: Expo Application Services (EAS) for build and distribution
- **Backend**: Containerized deployment (Docker) recommended
- **Database**: MongoDB Atlas for cloud hosting
- **WebSocket**: Separate server instance for real-time features

## Current Status
- **User App**: Fully functional with ride booking and tracking
- **Driver App**: Complete registration and ride acceptance flow
- **Backend**: All core APIs implemented
- **Real-time**: WebSocket integration working
- **Testing**: Basic functionality verified, production testing recommended

This comprehensive ride-sharing platform provides a complete solution for connecting passengers with drivers through real-time location sharing, secure payments, and seamless user experiences across both mobile applications.
