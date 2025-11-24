import express from "express";
import {
  acceptRide,
  checkVehicleAvailability,
  getAllRides,
  getDriversById,
  getLoggedInDriverData,
  newRide,
  registerDriverDirectly,
  rejectRide,
  sendingOtpToPhone,
  updateDriverLocation,
  updateDriverStatus,
  updatingRideStatus,
  updateDriverProfile,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
} from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/verify-otp", verifyPhoneOtpForRegistration)

driverRouter.post("/register-driver", registerDriverDirectly);

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);

driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
  updatingRideStatus
);

driverRouter.post("/accept-ride", isAuthenticatedDriver, acceptRide);

driverRouter.post("/reject-ride", isAuthenticatedDriver, rejectRide);

driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);

driverRouter.put("/update-location", isAuthenticatedDriver, updateDriverLocation);

driverRouter.put("/update-profile", isAuthenticatedDriver, updateDriverProfile);

driverRouter.get("/check-availability", checkVehicleAvailability);

export default driverRouter;
