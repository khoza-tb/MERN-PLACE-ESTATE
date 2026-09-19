
import express from "express";

import {
  test,
  signup,
  adminSignup,
  signin,
  adminSignin,
  google,
  signOut,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/test", test);

router.post("/signup", signup);
router.post("/admin-signup", adminSignup);

router.post("/signin", signin);
router.post("/admin-signin", adminSignin);

router.post("/google", google);

router.post("/signout", signOut);

export default router;

