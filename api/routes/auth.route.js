import express from "express";

import {
  signup,
  signin,
  adminSignin,
  google,
  signOut,
  test,
} from "../controllers/auth.controller.js";

const router = express.Router();

// =========================
// TEST
// =========================
router.get("/test", test);

// =========================
// USER AUTH
// =========================
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google", google);

// =========================
// ADMIN AUTH
// =========================
router.post("/admin/signin", adminSignin);

// =========================
// SIGN OUT
// =========================
router.get("/signout", signOut);

export default router;