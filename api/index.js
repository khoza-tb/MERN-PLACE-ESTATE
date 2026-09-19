
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// =====================================================
// LOAD ENVIRONMENT VARIABLES
// =====================================================

dotenv.config({
  path: "./api/.env",
});

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

console.log("=================================");
console.log("ENVIRONMENT CHECK");
console.log("=================================");

console.log(
  "MONGO:",
  process.env.MONGO ? "LOADED" : "NOT LOADED"
);

console.log(
  "RESEND API KEY:",
  process.env.RESEND_API_KEY
    ? "LOADED"
    : "NOT LOADED"
);

console.log(
  "RESEND FROM:",
  process.env.RESEND_FROM_EMAIL || "NOT SET"
);

console.log(
  "INQUIRY RECEIVER:",
  process.env.INQUIRY_RECEIVER_EMAIL || "NOT SET"
);

console.log("=================================");

// =====================================================
// ROUTES
// =====================================================

import authRoutes from "./routes/auth.route.js";
import listingRoutes from "./routes/listing.route.js";
import userRoutes from "./routes/user.route.js";
import favoriteRoutes from "./routes/favorite.route.js";
import inquiryRoutes from "./routes/inquiry.route.js";
import adminRoutes from "./routes/admin.route.js";


// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

// Parse JSON requests
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/listing", listingRoutes);

app.use("/api/user", userRoutes);

app.use("/api/favorite", favoriteRoutes);

// FIXED: inquiry route is singular
app.use("/api/inquiry", inquiryRoutes);

app.use("/api/admin", adminRoutes);

// =====================================================
// ROOT TEST
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PrimePlaceEstate API is running",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  const statusCode =
    err.statusCode || 500;

  const message =
    err.message ||
    "Internal Server Error";

  console.error(
    "SERVER ERROR:",
    err
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// =====================================================
// MONGODB CONNECTION + SERVER
// =====================================================

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log(
      "✅ Connected to MongoDB"
    );

    app.listen(3000, () => {
      console.log(
        "🚀 Server running on port 3000"
      );
    });
  })
  .catch((error) => {
    console.error(
      "❌ MongoDB connection error:",
      error
    );
  });

