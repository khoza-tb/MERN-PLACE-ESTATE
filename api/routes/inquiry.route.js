
import express from "express";

import {
  createInquiry,
  getReceivedInquiries,
  getSentInquiries,
  updateInquiryStatus,
  replyToInquiry,
} from "../controllers/inquiry.controller.js";

import { verifyToken } from "../utils/VerifyUser.js";

const router = express.Router();

router.post(
  "/create/:listingId",
  verifyToken,
  createInquiry
);

router.get(
  "/received",
  verifyToken,
  getReceivedInquiries
);

router.get(
  "/sent",
  verifyToken,
  getSentInquiries
);

router.patch(
  "/status/:inquiryId",
  verifyToken,
  updateInquiryStatus
);

router.post(
  "/reply/:inquiryId",
  verifyToken,
  replyToInquiry
);

export default router;

