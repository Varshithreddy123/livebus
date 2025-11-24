import express from "express";
import {
  createRide,
  getAllRides,
  getLoggedInUserData,
  registerUser,
  resendOtp,
  updateUserProfile,
  verifyOtp,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const userRouter = express.Router();

userRouter.post("/send-otp", registerUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/resend-otp", resendOtp);

// userRouter.post("/email-otp-request", sendingOtpToEmail);

// userRouter.put("/email-otp-verify", verifyingEmail);

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

userRouter.post("/create-ride", isAuthenticated, createRide);

userRouter.get("/get-rides", isAuthenticated, getAllRides);

userRouter.put("/update-profile", isAuthenticated, updateUserProfile);

export default userRouter;
