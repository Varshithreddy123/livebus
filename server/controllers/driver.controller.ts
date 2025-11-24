require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/send-token";
import { nylas } from "../app";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

// Helper function to check Twilio configuration
const checkTwilioConfig = (res: Response) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_SERVICE_SID) {
    console.error("Twilio environment variables are not set properly");
    res.status(500).json({
      success: false,
      message: "Server configuration error: Twilio not configured"
    });
    return false;
  }
  return true;
};

// Helper function to verify OTP with Twilio
const verifyOtp = async (phone_number: string, otp: string) => {
  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID!)
    .verificationChecks.create({
      to: phone_number,
      code: otp,
    });
  return verificationCheck;
};

// Helper function to create driver data object
const createDriverData = (data: {
  name: string;
  country: string;
  phone_number: string;
  email: string;
  vehicle_type: any;
  registration_number: string;
  registration_date: string;
  driving_license: string;
  vehicle_color: string;
  rate: any;
}) => {
  return {
    name: data.name,
    country: data.country,
    phone_number: data.phone_number,
    email: data.email,
    vehicle_type: data.vehicle_type,
    registration_number: data.registration_number,
    registration_date: data.registration_date,
    driving_license: data.driving_license,
    vehicle_color: data.vehicle_color,
    rate: data.rate.toString(),
  };
};

// sending otp to driver phone number
export const sendingOtpToPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    console.log("=== DRIVER SEND OTP START ===");
    console.log("Phone number received:", phone_number);
    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET");
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET");
    console.log("TWILIO_SERVICE_SID:", process.env.TWILIO_SERVICE_SID ? "SET" : "NOT SET");

    if (!checkTwilioConfig(res)) return;

    // Check if driver exists in database
    const driver = await prisma.driver.findUnique({
      where: {
        phone_number,
      },
    });

    if (!driver) {
      console.log("Driver not found in database for phone:", phone_number);
      console.log("=== DRIVER SEND OTP END ===");
      return res.status(400).json({
        success: false,
        message: "Driver not found. Please register first.",
      });
    }

    try {
      console.log("Attempting to send OTP to driver phone:", phone_number);
      const verification = await client.verify.v2
        ?.services(process.env.TWILIO_SERVICE_SID!)
        .verifications.create({
          channel: "sms",
          to: phone_number,
        });

      console.log("Twilio verification response:", verification);
      console.log("OTP sent successfully to driver:", phone_number);
      console.log("=== DRIVER SEND OTP END ===");

      res.status(201).json({
        success: true,
        message: "OTP sent successfully"
      });
    } catch (error: any) {
      console.error("=== DRIVER TWILIO ERROR ===");
      console.error("Error sending OTP to driver:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END DRIVER TWILIO ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "Failed to send OTP",
        error: error.code || "UNKNOWN_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN DRIVER SEND OTP ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// verifying otp for login
export const verifyPhoneOtpForLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    console.log("=== DRIVER VERIFY OTP LOGIN START ===");
    console.log("Phone number:", phone_number);
    console.log("OTP received:", otp);

    if (!checkTwilioConfig(res)) return;

    try {
      console.log("Verifying OTP with Twilio for driver login...");
      const verificationCheck = await verifyOtp(phone_number, otp);

      console.log("Twilio verification check response:", verificationCheck);
      console.log("Verification status:", verificationCheck.status);

      if (verificationCheck.status !== 'approved') {
        console.log("OTP verification failed for driver login - status:", verificationCheck.status);
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      console.log("OTP verified successfully, checking if driver exists in database...");
      const driver = await prisma.driver.findUnique({
        where: {
          phone_number,
        },
      });

      if (driver) {
        console.log("Driver found in database, sending token...");
        console.log("Driver ID:", driver.id);
        console.log("=== DRIVER VERIFY OTP LOGIN END ===");
        await sendToken(driver, res);
      } else {
        console.log("Driver not found in database for phone:", phone_number);
        console.log("=== DRIVER VERIFY OTP LOGIN END ===");
        res.status(403).json({
          success: false,
          message: "Register first",
        });
      }
    } catch (error: any) {
      console.error("=== DRIVER TWILIO VERIFICATION ERROR ===");
      console.error("Error verifying OTP for driver login:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END DRIVER TWILIO VERIFICATION ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "OTP verification failed",
        error: error.code || "VERIFICATION_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN DRIVER VERIFY OTP LOGIN ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// verifying phone otp for registration
export const verifyPhoneOtpForRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      phone_number,
      otp,
      name,
      country,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = req.body;

    console.log("=== DRIVER VERIFY OTP REGISTRATION START ===");
    console.log("Phone number:", phone_number);
    console.log("OTP received:", otp);
    console.log("Driver details - Name:", name, "Country:", country, "Email:", email);
    console.log("Vehicle details - Type:", vehicle_type, "Reg Number:", registration_number);

    if (!checkTwilioConfig(res)) return;

    try {
      console.log("Verifying OTP with Twilio for driver registration...");
      const verificationCheck = await verifyOtp(phone_number, otp);

      console.log("Twilio verification check response:", verificationCheck);
      console.log("Verification status:", verificationCheck.status);

      if (verificationCheck.status !== 'approved') {
        console.log("OTP verification failed for driver registration - status:", verificationCheck.status);
        return res.status(400).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      console.log("OTP verified successfully, creating new driver account...");
      const driver = await prisma.driver.create({
        data: createDriverData({
          name,
          country,
          phone_number,
          email,
          vehicle_type,
          registration_number,
          registration_date,
          driving_license,
          vehicle_color,
          rate,
        }),
      });

      console.log("Driver created successfully with ID:", driver.id);
      console.log("=== DRIVER VERIFY OTP REGISTRATION END ===");
      await sendToken(driver, res);
    } catch (error: any) {
      console.error("=== DRIVER TWILIO VERIFICATION ERROR ===");
      console.error("Error verifying OTP for driver registration:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("=== END DRIVER TWILIO VERIFICATION ERROR ===");

      res.status(400).json({
        success: false,
        message: error.message || "OTP verification failed",
        error: error.code || "VERIFICATION_ERROR"
      });
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR IN DRIVER VERIFY OTP REGISTRATION ===");
    console.error("Error:", error);
    console.error("=== END GENERAL ERROR ===");

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



// register driver directly without OTP
export const registerDriverDirectly = async (req: Request, res: Response) => {
  try {
    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = req.body;

    const driver = await prisma.driver.create({
      data: createDriverData({
        name,
        country,
        phone_number,
        email,
        vehicle_type,
        registration_number,
        registration_date,
        driving_license,
        vehicle_color,
        rate,
      }),
    });

    // Immediately authenticate driver after registration (bypass email verification)
    await sendToken(driver, res);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// get logged in driver data
export const getLoggedInDriverData = async (req: any, res: Response) => {
  try {
    const driver = req.driver;

    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.log(error);
  }
};

// updating driver status
export const updateDriverStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'active' or 'inactive'.",
      });
    }

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.id!,
      },
      data: {
        status,
      },
    });
    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get drivers data with id or all active drivers if no ids
export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query as any;
    console.log(ids,'ids')

    let drivers;
    if (!ids) {
      // Return all active drivers
      drivers = await prisma.driver.findMany({
        where: {
          status: "active",
        },
      });
    } else {
      const driverIds = ids.split(",");

      // Fetch drivers from database
      drivers = await prisma.driver.findMany({
        where: {
          id: { in: driverIds },
        },
      });
    }

    res.json({ drivers });
  } catch (error) {
    console.error("Error fetching driver data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// creating new ride
export const newRide = async (req: any, res: Response) => {
  try {
    const {
      userId,
      charge,
      status,
      currentLocationName,
      destinationLocationName,
      distance,
    } = req.body;

    const newRide = await prisma.rides.create({
      data: {
        userId,
        driverId: req.driver.id,
        charge: parseFloat(charge),
        status,
        currentLocationName,
        destinationLocationName,
        distance,
      },
    });
    res.status(201).json({ success: true, newRide });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// updating ride status
export const updatingRideStatus = async (req: any, res: Response) => {
  try {
    const { rideId, rideStatus } = req.body;

    // Validate input
    if (!rideId || !rideStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const driverId = req.driver?.id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch the ride data to get the rideCharge
    const ride = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    const rideCharge = ride.charge;

    // Update ride status
    const updatedRide = await prisma.rides.update({
      where: {
        id: rideId,
        driverId,
      },
      data: {
        status: rideStatus,
      },
    });

    if (rideStatus === "Completed") {
      // Update driver stats if the ride is completed
      await prisma.driver.update({
        where: {
          id: driverId,
        },
        data: {
          totalEarning: {
            increment: rideCharge,
          },
          totalRides: {
            increment: 1,
          },
        },
      });
    }

    res.status(201).json({
      success: true,
      updatedRide,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// update driver location
export const updateDriverLocation = async (req: any, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.id,
      },
      data: {
        latitude,
        longitude,
      },
    });

    res.status(200).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// getting drivers rides
export const getAllRides = async (req: any, res: Response) => {
  const rides = await prisma.rides.findMany({
    where: {
      driverId: req.driver?.id,
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

// update driver profile
export const updateDriverProfile = async (req: any, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const driver = await prisma.driver.update({
      where: {
        id: req.driver.id,
      },
      data: {
        name: name.trim(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      driver,
    });
  } catch (error: any) {
    console.error("Error updating driver profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// accept ride request
export const acceptRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const driverId = req.driver?.id;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required",
      });
    }

    const ride = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this ride",
      });
    }

    const updatedRide = await prisma.rides.update({
      where: {
        id: rideId,
      },
      data: {
        status: "Accepted",
      },
    });

    res.status(200).json({
      success: true,
      ride: updatedRide,
      message: "Ride accepted successfully",
    });
  } catch (error: any) {
    console.error("Error accepting ride:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// reject ride request
export const rejectRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const driverId = req.driver?.id;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required",
      });
    }

    const ride = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this ride",
      });
    }

    const updatedRide = await prisma.rides.update({
      where: {
        id: rideId,
      },
      data: {
        status: "Rejected",
      },
    });

    res.status(200).json({
      success: true,
      ride: updatedRide,
      message: "Ride rejected successfully",
    });
  } catch (error: any) {
    console.error("Error rejecting ride:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// check vehicle availability for service
export const checkVehicleAvailability = async (req: Request, res: Response) => {
  try {
    const availableVehicles = await prisma.driver.count({
      where: {
        status: "active",
        vehicle_type: {
          not: null,
        },
        vehicleNumber: {
          not: null,
        },
      },
    });

    res.status(200).json({
      success: true,
      vehiclesAvailable: availableVehicles > 0,
      count: availableVehicles,
    });
  } catch (error: any) {
    console.error("Error checking vehicle availability:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
