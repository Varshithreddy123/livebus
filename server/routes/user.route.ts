import express from "express";
import {
  getAllRides,
  getLoggedInUserData,
  registerUser,
  verifyOtp,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const userRouter = express.Router();

userRouter.post("/send-otp", registerUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/resend-otp", registerUser);

// userRouter.post("/email-otp-request", sendingOtpToEmail);

// userRouter.put("/email-otp-verify", verifyingEmail);

userRouter.get("/me", isAuthenticated, getLoggedInUserData);

userRouter.get("/get-rides", isAuthenticated, getAllRides);

export default userRouter;
