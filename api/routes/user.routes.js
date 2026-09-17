import express from "express";

import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
} from "../controllers/user.controller.js";

import { verifyToken } from "../utils/verify.user.js";

const router = express.Router();

// Test route
router.get("/test", test);

// Update user
router.post(
  "/update/:id",
  verifyToken,
  updateUser
);

// Delete user
router.delete(
  "/delete/:id",
  verifyToken,
  deleteUser // 👈 Capitalized 'U' here
);

router.get('/listings/:id', verifyToken, getUserListings);

export default router;