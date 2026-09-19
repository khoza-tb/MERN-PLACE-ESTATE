
import express from "express";

import {
  getDashboardStats,
  getRecentActivity,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllListings,
  deleteListing,
  getAllInquiries,
  updateInquiryStatusAdmin,
  deleteInquiry,
} from "../controllers/admin.controller.js";

import {
  adminSignin,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../utils/VerifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

// =====================================================
// ADMIN AUTHENTICATION
// =====================================================

// POST /api/admin/signin
router.post(
  "/signin",
  adminSignin
);

// =====================================================
// DASHBOARD
// =====================================================

router.get(
  "/stats",
  verifyToken,
  verifyAdmin,
  getDashboardStats
);

router.get(
  "/activity",
  verifyToken,
  verifyAdmin,
  getRecentActivity
);

// =====================================================
// USERS
// =====================================================

router.get(
  "/users",
  verifyToken,
  verifyAdmin,
  getAllUsers
);

router.patch(
  "/users/:userId/role",
  verifyToken,
  verifyAdmin,
  updateUserRole
);

router.delete(
  "/users/:userId",
  verifyToken,
  verifyAdmin,
  deleteUser
);

// =====================================================
// LISTINGS
// =====================================================

router.get(
  "/listings",
  verifyToken,
  verifyAdmin,
  getAllListings
);

router.delete(
  "/listings/:listingId",
  verifyToken,
  verifyAdmin,
  deleteListing
);

// =====================================================
// INQUIRIES
// =====================================================

router.get(
  "/inquiries",
  verifyToken,
  verifyAdmin,
  getAllInquiries
);

router.patch(
  "/inquiries/:inquiryId/status",
  verifyToken,
  verifyAdmin,
  updateInquiryStatusAdmin
);

router.delete(
  "/inquiries/:inquiryId",
  verifyToken,
  verifyAdmin,
  deleteInquiry
);

export default router;

