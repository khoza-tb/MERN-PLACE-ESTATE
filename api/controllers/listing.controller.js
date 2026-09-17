import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js"; // Optional: custom error handler helper

export const createListing = async (req, res, next) => {
  try {
    const userRef = req.user?.id || req.user?._id;

    if (!userRef) {
      return next(errorHandler(401, "Unauthorized: User identification missing"));
    }

    const listing = await Listing.create({
      ...req.body,
      userRef,
    });

    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};