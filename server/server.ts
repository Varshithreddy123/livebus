import http from "http";
import { app } from "./app";
import { WebSocketServer } from "ws";
import geolib from "geolib";
import axios from "axios";

const server = http.createServer(app);

// WebSocket server attached to the same HTTP server
const wss = new WebSocketServer({ server });

const SERVER_URI = process.env.SERVER_URI || "http://localhost:8080";

wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received message:", data);

      if (data.type === "locationUpdate" && data.role === "driver") {
        // Persist latest driver location to DB
        axios
          .put(
            `${SERVER_URI}/driver/update-location`,
            {
              latitude: data.data.latitude,
              longitude: data.data.longitude,
            },
            {
              headers: { Authorization: `Bearer ${data.token}` },
            }
          )
          .catch((error) => {
            console.log("Error updating location in DB:", error.message);
          });
      }

      if (data.type === "requestRide" && data.role === "user") {
        console.log("Requesting ride...");
        const nearbyDrivers = await findNearbyDrivers(
          data.latitude,
          data.longitude
        );
        ws.send(JSON.stringify({ type: "nearbyDrivers", drivers: nearbyDrivers }));
      }

      if (data.type === "acceptRide" && data.role === "driver") {
        console.log("Driver accepting ride:", data.rideId);
        // Broadcast to all connected clients that ride was accepted
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(
              JSON.stringify({
                type: "rideAccepted",
                rideId: data.rideId,
                driverId: data.driverId,
              })
            );
          }
        });
      }

      if (data.type === "rejectRide" && data.role === "driver") {
        console.log("Driver rejecting ride:", data.rideId);
        // Broadcast to all connected clients that ride was rejected
        wss.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(
              JSON.stringify({
                type: "rideRejected",
                rideId: data.rideId,
                driverId: data.driverId,
              })
            );
          }
        });
      }
    } catch (error) {
      console.log("Failed to handle WebSocket message:", error);
    }
  });
});

const findNearbyDrivers = async (userLat: number, userLon: number) => {
  try {
    // Fetch active drivers with their locations from API (no auth required for this route)
    const resp = await axios.get(`${SERVER_URI}/driver/get-drivers-data`);
    const activeDrivers = (resp.data?.drivers || []).filter(
      (d: any) => d.latitude != null && d.longitude != null && d.status === "active"
    );

    console.log(`Found ${activeDrivers.length} active drivers from API`);

    // Filter drivers within 5km radius
    const nearbyDrivers = activeDrivers.filter((driver: any) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        { latitude: driver.latitude, longitude: driver.longitude }
      );
      return distance <= 5000; // 5 kilometers
    });

    console.log(`Found ${nearbyDrivers.length} nearby drivers within 5km`);
    return nearbyDrivers.map((driver: any) => ({
      id: driver.id,
      latitude: driver.latitude,
      longitude: driver.longitude,
      vehicle_type: driver.vehicle_type,
      rate: driver.rate,
    }));
  } catch (error: any) {
    console.error("Error finding nearby drivers via API:", error.message);
    return [];
  }
};

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
});
