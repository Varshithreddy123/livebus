# MongoDB Connection Troubleshooting Guide

## ✅ Current Status
- **Twilio OTP**: ✅ Working perfectly (phone normalization fixed)
- **MongoDB Connection**: ❌ Failing with DNS resolution error

## 🔍 Error Analysis
```
Error: Error creating a database connection
Kind: An error occurred during DNS resolution
os error: A socket operation was attempted to an unreachable network (10051)
```

This error means MongoDB server is **not reachable** at the address specified in `DATABASE_URL`.

## 🛠️ Fix Steps

### Step 1: Check DATABASE_URL Format
Your `DATABASE_URL` in `server/.env` should be in one of these formats:

**Local MongoDB:**
```env
DATABASE_URL="mongodb://localhost:27017/ridewave"
```

**MongoDB with Authentication:**
```env
DATABASE_URL="mongodb://username:password@localhost:27017/ridewave"
```

**MongoDB Atlas (Cloud):**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ridewave?retryWrites=true&w=majority"
```

**MongoDB on Different Host:**
```env
DATABASE_URL="mongodb://192.168.1.100:27017/ridewave"
```

### Step 2: Verify MongoDB is Running

**Windows:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service if not running
Start-Service MongoDB

# Or check if mongod.exe is running
Get-Process mongod
```

**Manual Start (if installed locally):**
```bash
# Navigate to MongoDB bin directory (usually)
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod.exe
```

### Step 3: Test MongoDB Connection

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Try connecting with your `DATABASE_URL`
3. If it fails, the URL is incorrect

**Using Command Line:**
```bash
# Test connection
mongosh "mongodb://localhost:27017/ridewave"

# Or if using MongoDB Atlas
mongosh "mongodb+srv://your-connection-string"
```

### Step 4: Check Firewall/Network

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Check if MongoDB port (27017) is allowed
3. Add exception if needed

**Network Issues:**
- If using cloud MongoDB (Atlas), check your IP is whitelisted
- If using local network, ensure MongoDB host is reachable
- Check VPN connection if required

### Step 5: Verify DATABASE_URL in .env

**Check your `server/.env` file:**
```env
# Should be something like:
DATABASE_URL="mongodb://localhost:27017/ridewave"
PORT=8080
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_SERVICE_SID=your_twilio_service_sid
```

**Common Mistakes:**
- ❌ `DATABASE_URL="localhost:27017"` (missing `mongodb://`)
- ❌ `DATABASE_URL="mongodb://localhost"` (missing database name)
- ❌ `DATABASE_URL="mongodb://localhost:27017"` (missing database name)
- ✅ `DATABASE_URL="mongodb://localhost:27017/ridewave"` (correct)

### Step 6: Test Connection with Node.js Script

Create `server/test-db-connection.js`:
```javascript
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function test() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
    await prisma.$connect();
    console.log("✅ Connected to MongoDB!");
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

test();
```

Run it:
```bash
cd server
node test-db-connection.js
```

## 🚀 Quick Fixes

### Option 1: Use MongoDB Atlas (Cloud - Easiest)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `DATABASE_URL` in `.env`
5. Whitelist your IP address in Atlas dashboard

### Option 2: Install MongoDB Locally
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use: `DATABASE_URL="mongodb://localhost:27017/ridewave"`

### Option 3: Use Docker (Recommended for Development)
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Use connection string
DATABASE_URL="mongodb://localhost:27017/ridewave"
```

## 📝 Current Error Response

The backend is correctly handling the error and returning:
```json
{
  "success": false,
  "message": "Database connection error. Please check your database configuration and ensure the database server is running.",
  "error": "DATABASE_CONNECTION_ERROR"
}
```

This is the expected behavior when MongoDB is not available.

## ✅ Once Fixed

After fixing the MongoDB connection:
1. Restart your server
2. You should see: `✅ Database: Connected` in startup logs
3. OTP verification will work end-to-end
4. Driver login/registration will complete successfully

