# MongoDB Import Guide

## Files Created
- `mongodb-seed-driver.json` - Driver collection data with phone +919182548149
- `mongodb-seed-user.json` - User collection data with phone +919182548149

## Import Commands

### Import Driver Data
```bash
mongoimport --uri="mongodb://localhost:27017/your_database_name" --collection=driver --file=mongodb-seed-driver.json --jsonArray
```

### Import User Data
```bash
mongoimport --uri="mongodb://localhost:27017/your_database_name" --collection=user --file=mongodb-seed-user.json --jsonArray
```

## Using MongoDB Compass or MongoDB Shell

### MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Select the `driver` or `user` collection
4. Click "Add Data" → "Import File"
5. Select the JSON file
6. Click "Import"

### MongoDB Shell (mongosh)
```javascript
// Connect to your database
use your_database_name

// Import driver
db.driver.insertMany([
  {
    "name": "Test Driver",
    "country": "India",
    "phone_number": "+919182548149",
    "email": "driver9182548149@example.com",
    "vehicle_type": "Sedan",
    "vehicle_color": "White",
    "vehicleNumber": "DL01AB1234",
    "registration_number": "DL01AB1234",
    "registration_date": "2024-01-15",
    "driving_license": "DL1234567890123",
    "rate": "50",
    "rating": 4.5,
    "ratings": 4.5,
    "totalEarning": 0,
    "totalRides": 0,
    "pendingRides": 0,
    "cancelRides": 0,
    "status": "active",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
])

// Import user
db.user.insertMany([
  {
    "name": "Test User",
    "email": "user9182548149@example.com",
    "phone_number": "+919182548149",
    "ratings": 4.0,
    "totalRides": 0
  }
])
```

## Using Prisma Studio
1. Run `npx prisma studio`
2. Navigate to the driver or user table
3. Click "Add record"
4. Copy the data from the JSON file (without the _id field)
5. Paste and save

## Notes
- Phone number format: `+919182548149` (with country code)
- Driver status is set to "active" for immediate use
- Location is set to Delhi, India (latitude: 28.6139, longitude: 77.2090)
- All required fields are included
- Optional fields have sample values

