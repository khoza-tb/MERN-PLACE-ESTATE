import express from "express";

import {
  addFavorite,
  removeFavorite,
  checkFavorite,
  getFavorites,
} from "../controllers/favorite.controller.js";

import { verifyToken } from "../utils/VerifyUser.js";

const router = express.Router();

router.post(
  "/add/:listingId",
  verifyToken,
  addFavorite
);

router.delete(
  "/remove/:listingId",
  verifyToken,
  removeFavorite
);

router.get(
  "/check/:listingId",
  checkFavorite
);

router.get(
  "/get",
  verifyToken,
  getFavorites
);

export default router;