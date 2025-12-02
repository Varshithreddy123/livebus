# Driver Visibility to Users - Complete Guide

## ✅ How Drivers Become Visible to Users

### Requirements for Driver Visibility:
1. **Status must be "active"** ✅
2. **Must have location (latitude & longitude)** ✅
3. **Must be within 5km radius of user** ✅

## 🔄 Current Flow

### 1. Driver Registration
- When driver registers, status is automatically set to `"active"` ✅
- Location is not set initially (driver needs to update it)

### 2. Driver Location Updates
- Driver app sends location updates via WebSocket (`locationUpdate`)
- WebSocket server updates location in database via `/driver/update-location` API
- Location is updated every time driver moves >200 meters

### 3. Driver Status Toggle
- Driver can toggle status between "active" and "inactive" in home screen
- Endpoint: `/driver/update-status`
- Only "active" drivers are visible to users

### 4. User Requests Nearby Drivers
- User sends WebSocket message: `{ type: "requestRide", role: "user", latitude, longitude }`
- Server calls `findNearbyDrivers()` which:
  1. Fetches all active drivers from `/driver/get-drivers-data`
  2. Filters by: `status === "active"` AND has `latitude` AND `longitude`
  3. Filters by distance: within 5km radius
  4. Returns nearby drivers to user

## ⚠️ Potential Issues & Fixes

### Issue 1: Driver Status After Registration
**Status:** ✅ FIXED
- Driver status is set to "active" during registration
- No action needed

### Issue 2: Driver Location Not Updated
**Status:** ⚠️ NEEDS ATTENTION
- Driver must have location permissions enabled
- Driver must be on home screen to send location updates
- If WebSocket connection fails, location won't update

**Solution:**
- Ensure driver grants location permissions
- Check WebSocket connection status
- Driver should see location updates in console logs

### Issue 3: Driver Not Visible Even When Active
**Possible Causes:**
1. **No Location Set:**
   - Driver hasn't opened home screen yet
   - Location permissions not granted
   - WebSocket not connected

2. **Status Not Active:**
   - Driver toggled status to "inactive"
   - Check driver status in database

3. **Too Far from User:**
   - Driver is more than 5km away from user
   - This is expected behavior

4. **Database Connection Issues:**
   - If MongoDB is down, drivers won't be fetched
   - Check database connection

## 🧪 Testing Driver Visibility

### Step 1: Register a Driver
```bash
# Driver should be created with status="active"
POST /driver/verify-otp
```

### Step 2: Driver Opens Home Screen
- Location permissions should be requested
- WebSocket should connect
- Location updates should be sent

### Step 3: Check Driver in Database
```javascript
// Should have:
{
  status: "active",
  latitude: <some value>,
  longitude: <some value>
}
```

### Step 4: User Requests Nearby Drivers
```javascript
// WebSocket message from user:
{
  type: "requestRide",
  role: "user",
  latitude: 28.6139,
  longitude: 77.2090
}
```

### Step 5: Check Server Logs
```
Found X active drivers from API
Found Y nearby drivers within 5km
```

## 📋 API Endpoints

### Get All Active Drivers
```
GET /driver/get-drivers-data
Response: { drivers: [...] }
```

### Get Specific Drivers
```
GET /driver/get-drivers-data?ids=id1,id2,id3
Response: { drivers: [...] }
```

### Update Driver Status
```
PUT /driver/update-status
Body: { status: "active" | "inactive" }
Headers: Authorization: Bearer <token>
```

### Update Driver Location
```
PUT /driver/update-location
Body: { latitude: number, longitude: number }
Headers: Authorization: Bearer <token>
```

## 🔍 Debugging Steps

### If Driver Not Visible:

1. **Check Driver Status:**
   ```bash
   # Query database
   db.driver.find({ phone_number: "+919182548149" })
   # Should show: status: "active"
   ```

2. **Check Driver Location:**
   ```bash
   # Should have latitude and longitude
   db.driver.find({ phone_number: "+919182548149" })
   # Should show: latitude: <number>, longitude: <number>
   ```

3. **Check WebSocket Connection:**
   - Driver app should show WebSocket connected
   - Check server logs for location updates

4. **Check Distance:**
   - Driver and user must be within 5km
   - Use distance calculator to verify

5. **Check Server Logs:**
   ```
   Found X active drivers from API
   Found Y nearby drivers within 5km
   ```

## ✅ Current Implementation Status

- ✅ Driver registration sets status to "active"
- ✅ Location updates via WebSocket
- ✅ Status toggle functionality
- ✅ Nearby driver filtering (5km radius)
- ✅ Active driver filtering
- ✅ Location-based filtering

## 🎯 Summary

**Drivers ARE visible to users IF:**
1. ✅ Status is "active" (set during registration)
2. ✅ Location is set (via WebSocket from home screen)
3. ✅ Within 5km of user (automatic filtering)

**Common Issues:**
- Driver hasn't opened home screen → No location set
- Driver toggled status to "inactive" → Not visible
- Driver too far from user → Not in results (expected)
- WebSocket not connected → Location not updating

