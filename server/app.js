import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connect_DB from "./db/index.js"; // write this next

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import { healthcheck } from "./controllers/healthCheck.controller.js";
import healthcheckRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
export { app };
