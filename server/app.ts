require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import Nylas from "nylas";
import driverRouter from "./routes/driver.route";
import os from "os";

export const app = express();

export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: "https://api.eu.nylas.com",
});

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parserv
app.use(cookieParser());

// routes
app.use("/api/v1", userRouter);
app.use("/api/v1/driver", driverRouter);

// dynamic server IP endpoint
app.get("/api/v1/server-ip", (req: Request, res: Response) => {
  const nets = os.networkInterfaces();
  let realIp: string | null = null;

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (
        net.family === "IPv4" &&
        !net.internal &&

        // ignore virtual adapters
        !name.toLowerCase().includes("virtual") &&
        !name.toLowerCase().includes("vm") &&
        !name.toLowerCase().includes("hyper") &&
        !name.toLowerCase().includes("vbox") &&
        !name.toLowerCase().includes("docker") &&
        !name.toLowerCase().includes("loopback") &&
        !name.toLowerCase().includes("bridge") &&

        // ignore link-local APIPA addresses
        !net.address.startsWith("169.254.")
      ) {
        realIp = net.address;
      }
    }
  }

  // fallback for Android emulator
  if (!realIp) {
    realIp = "10.0.2.2";
  }

  res.json({ ip: realIp });
});

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    succcess: true,
    message: "API is working",
  });
});