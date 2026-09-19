
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

app.use(express.json());
app.use(cookieParser());

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://prime-place-estates-web.vercel.app",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS BLOCKED:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },
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
  console.error("SERVER ERROR:", err);

  const statusCode = err.statusCode || 500;

  const message =
    err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// =====================================================
// MONGODB CONNECTION
// =====================================================

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGO) {
    throw new Error(
      "MONGO environment variable is not configured"
    );
  }

  try {
    await mongoose.connect(process.env.MONGO);

    isConnected = true;

    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error
    );

    throw error;
  }
};

// =====================================================
// VERCEL HANDLER
// =====================================================

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    return app(req, res);
  } catch (error) {
    console.error(
      "❌ API HANDLER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error.message || "Internal Server Error",
    });
  }
}

