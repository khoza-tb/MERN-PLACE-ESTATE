import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";

// =========================
// CREATE LISTING
// =========================
export const createListing = async (req, res, next) => {
  try {
    const userRef = req.user?.id || req.user?._id;

    if (!userRef) {
      return next(
        errorHandler(401, "Unauthorized: User identification missing")
      );
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

// =========================
// DELETE LISTING
// =========================
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    const userId = req.user?.id || req.user?._id;

    // Ensure the user trying to delete the listing is the owner
    if (userId !== listing.userRef.toString()) {
      return next(
        errorHandler(401, "You can only delete your own listings!")
      );
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Listing has been deleted!",
    });
  } catch (error) {
    next(error);
  }
};