const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");

const app = express();

// Ports (configurable via env)
const HTTP_PORT = process.env.SOCKET_HTTP_PORT ? parseInt(process.env.SOCKET_HTTP_PORT, 10) : 4000;
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 8081;

// Store driver locations
let drivers = {};

// Store user subscriptions: { ws, latitude, longitude, timestamp }
let subscribers = [];

// Cleanup settings
const SUBSCRIPTION_TTL_MS = 2 * 60 * 1000; // 2 minutes
const SUBSCRIPTION_CLEANUP_INTERVAL_MS = 60 * 1000; // every 1 minute

//------------------------------------------
// CLEANUP JOB (removes dead/expired users)
//------------------------------------------
setInterval(() => {
  try {
    const now = Date.now();
    const before = subscribers.length;

    subscribers = subscribers.filter((s) => {
      const fresh = now - (s.timestamp || 0) <= SUBSCRIPTION_TTL_MS;
      const connected = s.ws && s.ws.readyState === 1;
      return fresh && connected;
    });

    const removed = before - subscribers.length;
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} stale subscriber(s)`);
    }
  } catch (e) {
    console.log("Cleanup error:", e);
  }
}, SUBSCRIPTION_CLEANUP_INTERVAL_MS);

//------------------------------------------
// CREATE WEBSOCKET SERVER (0.0.0.0)
//------------------------------------------
const wss = new WebSocketServer({ host: "0.0.0.0", port: WS_PORT });

wss.on("listening", () => {
  console.log(`✅ WebSocket Server LISTENING on ws://0.0.0.0:${WS_PORT}`);
  console.log(`ℹ️  To connect from a device on the same network use ws://<your-laptop-ip>:${WS_PORT}`);
});

wss.on("error", (error) => {
  console.error(`❌ WebSocket Server Error:`, error && error.message ? error.message : error);
  if (error && error.code === "EADDRINUSE") {
    console.error(`⚠️  Port ${WS_PORT} already in use. Run 'netstat -ano | findstr :${WS_PORT}' to find the PID, then 'taskkill /PID <pid> /F' to free it, or set WS_PORT to a free port.`);
  }
});

wss.on("connection", (ws) => {

  // remove subscription if socket closes
  ws.on("close", () => {
    subscribers = subscribers.filter((s) => s.ws !== ws);
    console.log("❌ Client disconnected");
  });

  ws.on("message", (message) => {
    let data = null;
    try {
      data = JSON.parse(message);
      console.log("📩 Received:", data);
    } catch (e) {
      console.log("❌ Failed to parse msg:", e);
      return;
    }

    //------------------------------------------------
    // DRIVER LOCATION UPDATE
    //------------------------------------------------
    if (data.type === "locationUpdate" && data.role === "driver") {
      drivers[data.driver] = {
        latitude: data.data.latitude,
        longitude: data.data.longitude,
      };

      console.log("📍 Updated Driver:", data.driver, drivers[data.driver]);

      // payload for users
      const payload = JSON.stringify({
        type: "driverLocation",
        driver: data.driver,
        latitude: data.data.latitude,
        longitude: data.data.longitude,
      });

      console.log("🔎 Checking subscribers within radius...");

      const RADIUS_METERS = 5000;

      subscribers.forEach((sub) => {
        try {
          const dist = geolib.getDistance(
            { latitude: data.data.latitude, longitude: data.data.longitude },
            { latitude: sub.latitude, longitude: sub.longitude }
          );

          if (dist <= RADIUS_METERS && sub.ws.readyState === 1) {
            sub.ws.send(payload);
          }
        } catch (e) {
          console.log("❌ Failed to send to subscriber:", e);
        }
      });
    }

    //------------------------------------------------
    // USER REQUESTING NEARBY DRIVERS
    //------------------------------------------------
    if (data.type === "requestRide" && data.role === "user") {
      console.log("🚗 User requesting ride…");

      // Update or Add subscriber
      const existing = subscribers.find((s) => s.ws === ws);
      if (existing) {
        existing.latitude = data.latitude;
        existing.longitude = data.longitude;
        existing.timestamp = Date.now();
      } else {
        subscribers.push({
          ws,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: Date.now(),
        });
      }

      const nearbyDrivers = findNearbyDrivers(data.latitude, data.longitude);
      ws.send(
        JSON.stringify({
          type: "nearbyDrivers",
          drivers: nearbyDrivers,
        })
      );
    }
  });
});

//------------------------------------------
// FIND NEARBY DRIVERS
//------------------------------------------
const findNearbyDrivers = (userLat, userLon) => {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        location
      );
      return distance <= 5000; // 5km radius
    })
    .map(([id, location]) => ({
      id,
      ...location,
    }));
};

//------------------------------------------
// EXPRESS SERVER (0.0.0.0)
//------------------------------------------
app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`🌐 HTTP API running on http://0.0.0.0:${HTTP_PORT}`);
});

//------------------------------------------
// STARTUP CONFIRMATION
//------------------------------------------
console.log(`
╔════════════════════════════════════════╗
║  🚀 RIDEWAVE SOCKET SERVER STARTED     ║
╠════════════════════════════════════════╣
║  WebSocket: ws://0.0.0.0:${WS_PORT}          ║
║  HTTP API:  http://0.0.0.0:${HTTP_PORT}         ║
║  Waiting for connections...            ║
╚════════════════════════════════════════╝
`);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Shutting down server...");
  wss.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});
