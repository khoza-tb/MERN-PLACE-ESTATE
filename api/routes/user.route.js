import express from "express";

import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
} from "../controllers/user.controller.js";

import { verifyToken } from "../utils/VerifyUser.js";

const router = express.Router();

// TEST
router.get("/test", test);

// UPDATE USER
router.post("/update/:id", verifyToken, updateUser);

// DELETE USER
router.delete("/delete/:id", verifyToken, deleteUser);

// GET USER LISTINGS
router.get("/listings/:id", verifyToken, getUserListings);

export default router;