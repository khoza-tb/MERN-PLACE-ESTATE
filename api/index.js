import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.route.js";
import listingRoutes from "./routes/listing.route.js";

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// =========================
// DATABASE
// =========================

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// =========================
// ROUTES
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "PrimePlaceEstate API is running",
  });
});

// Fixed route prefix from /api/users to /api/user
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listing", listingRoutes);

// =========================
// ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("❌ Error:", err);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// =========================
// START SERVER
// =========================

app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});