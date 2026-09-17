import Listing from "../models/listing.models.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id || req.user._id, // Assign logged-in user ID from verifyToken
    });
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};