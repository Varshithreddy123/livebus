require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/send-token";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

// register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    console.log("=== REGISTER USER START ===");
    console.log("Phone number received:", phone_number);
    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET");
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET");
    console.log("TWILIO_SERVICE_SID:", process.env.TWILIO_SERVICE_SID ? "SET" : "NOT SET");

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SERVICE_SID) {
      console.error("Twilio environment variables are not set properly");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Twilio not configured"
      });
    }

    try {
      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
      console.log("Attempting to send OTP to:", formattedPhoneNumber);
      const verification = await client.verify.v2
        ?.services(process.env.TWILIO_SERVICE_SID!)
        .verifications.create({
          channel: "sms",
          to: formattedPhoneNumber,
          codeLength: 4,
        });

      console.log("Twilio verification response:", verification);
      console.log("OTP sent successfully to:", phone_number);
      console.log("=== REGISTER USER END ===");

      res.status(201).json({
        success: true,
        message: "OTP sent successfully"
      });
    } catch (error: any) {
      console.error("=== TWILIO ERROR ===");
      console.error("Error sending OTP:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END TWILIO ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "Failed to send OTP",
        error: error.code || "UNKNOWN_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN REGISTER USER ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// resend otp
export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    console.log("=== RESEND OTP START ===");
    console.log("Phone number received:", phone_number);
    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET");
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET");
    console.log("TWILIO_SERVICE_SID:", process.env.TWILIO_SERVICE_SID ? "SET" : "NOT SET");

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SERVICE_SID) {
      console.error("Twilio environment variables are not set properly");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Twilio not configured"
      });
    }

    try {
      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
      console.log("Attempting to resend OTP to:", formattedPhoneNumber);
      const verification = await client.verify.v2
        ?.services(process.env.TWILIO_SERVICE_SID!)
        .verifications.create({
          channel: "sms",
          to: formattedPhoneNumber,
          codeLength: 4,
        });

      console.log("Twilio verification response:", verification);
      console.log("OTP resent successfully to:", phone_number);
      console.log("=== RESEND OTP END ===");

      res.status(201).json({
        success: true,
        message: "OTP resent successfully"
      });
    } catch (error: any) {
      console.error("=== TWILIO RESEND ERROR ===");
      console.error("Error resending OTP:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END TWILIO RESEND ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "Failed to resend OTP",
        error: error.code || "UNKNOWN_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN RESEND OTP ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// verify otp
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    console.log("=== VERIFY OTP START ===");
    console.log("Phone number:", phone_number);
    console.log("OTP received:", otp);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SERVICE_SID) {
      console.error("Twilio environment variables are not set properly");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Twilio not configured"
      });
    }

    try {
      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
      console.log("Verifying OTP with Twilio for:", formattedPhoneNumber);
      const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID!)
        .verificationChecks.create({
          to: formattedPhoneNumber,
          code: otp,
        });

      console.log("Twilio verification check response:", verificationCheck);
      console.log("Verification status:", verificationCheck.status);

      if (verificationCheck.status !== 'approved') {
        console.log("OTP verification failed - status:", verificationCheck.status);
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      console.log("OTP verified successfully, checking if user exists...");
      // is user exist
      const isUserExist = await prisma.user.findUnique({
        where: {
          phone_number,
        },
      });

      if (isUserExist) {
        console.log("Existing user found, sending token...");
        res.status(201).json({
          success: true,
          user: isUserExist,
          isNewUser: false,
        });
      } else {
        console.log("New user, creating account...");
        // create account
        const user = await prisma.user.create({
          data: {
            phone_number: phone_number,
            totalRides: 0,
            ratings: 0,
          },
        });
        console.log("New user created, sending token...");
        res.status(201).json({
          success: true,
          user: user,
          isNewUser: true,
        });
      }
      console.log("=== VERIFY OTP END ===");
    } catch (error: any) {
      console.error("=== TWILIO VERIFICATION ERROR ===");
      console.error("Error verifying OTP:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END TWILIO VERIFICATION ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "OTP verification failed",
        error: error.code || "VERIFICATION_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN VERIFY OTP ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// // sending otp to email
// export const sendingOtpToEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { email, name, userId } = req.body;

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const user = {
//       userId,
//       name,
//       email,
//     };
//     const token = jwt.sign(
//       {
//         user,
//         otp,
//       },
//       process.env.EMAIL_ACTIVATION_SECRET!,
//       {
//         expiresIn: "5m",
//       }
//     );
//     try {
//       await nylas.messages.send({
//         identifier: process.env.USER_GRANT_ID!,
//         requestBody: {
//           to: [{ name: name, email: email }],
//           subject: "Verify your email address!",
//           body: `
//           <p>Hi ${name},</p>
//       <p>Your livebustracking verification code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
//       <p>Thanks,<br>livebustracking Team</p>
//           `,
//         },
//       });
//       res.status(201).json({
//         success: true,
//         token,
//       });
//     } catch (error: any) {
//       res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//       console.log(error);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// // verifying email otp
// export const verifyingEmail = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { otp, token } = req.body;

//     const newUser: any = jwt.verify(
//       token,
//       process.env.EMAIL_ACTIVATION_SECRET!
//     );

//     if (newUser.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP is not correct or expired!",
//       });
//     }

//     const { name, email, userId } = newUser.user;

//     const user = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//     });
//     if (user?.email === null) {
//       const updatedUser = await prisma.user.update({
//         where: {
//           id: userId,
//         },
//         data: {
//           name: name,
//           email: email,
//         },
//       });
//       await sendToken(updatedUser, res);
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(400).json({
//       success: false,
//       message: "Your otp is expired!",
//     });
//   }
// };

// get logged in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

// getting user rides
export const getAllRides = async (req: any, res: Response) => {
  const rides = await prisma.rides.findMany({
    where: {
      userId: req.user?.id,
    },
    include: {
      driver: true,
      user: true,
    },
  });
  res.status(201).json({
    rides,
  });
};

// create new ride
export const createRide = async (req: any, res: Response) => {
  try {
    const {
      driverId,
      charge,
      currentLocationName,
      destinationLocationName,
      distance,
      currentLocation,
      destination,
    } = req.body;

    const userId = req.user?.id;

    if (!userId || !driverId || !charge || !currentLocationName || !destinationLocationName || !distance) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newRide = await prisma.rides.create({
      data: {
        userId,
        driverId,
        charge: parseFloat(charge),
        status: "Pending",
        currentLocationName,
        destinationLocationName,
        distance: parseFloat(distance),
      },
    });

    res.status(201).json({
      success: true,
      ride: newRide,
      message: "Ride created successfully",
    });
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ride",
    });
  }
};

// update user profile
export const updateUserProfile = async (req: any, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.trim(),
        id: {
          not: userId,
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name.trim(),
        email: email.trim(),
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
