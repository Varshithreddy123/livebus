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
  let ip = "";
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ip = net.address;
      }
    }
  }
  res.json({ ip });
});

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    succcess: true,
    message: "API is working",
  });
});