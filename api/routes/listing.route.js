
import express from "express";

import {
  createListing,
  deleteListing,
  updateListing,
  getListing,
  getListings,
  getMyListings,
} from "../controllers/listing.controller.js";

import { verifyToken } from "../utils/VerifyUser.js";

const router = express.Router();

// ========================================
// CREATE LISTING
// ========================================
router.post(
  "/create",
  verifyToken,
  createListing
);

// ========================================
// DELETE LISTING
// ========================================
router.delete(
  "/delete/:id",
  verifyToken,
  deleteListing
);

// ========================================
// UPDATE LISTING
// ========================================
router.post(
  "/update/:id",
  verifyToken,
  updateListing
);

// ========================================
// GET MY LISTINGS
// ========================================
router.get(
  "/my-listings",
  verifyToken,
  getMyListings
);

// ========================================
// GET SINGLE LISTING
// ========================================
router.get(
  "/get/:id",
  getListing
);

// ========================================
// GET ALL LISTINGS
// ========================================
router.get(
  "/get",
  getListings
);

export default router;
