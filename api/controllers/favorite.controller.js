import Favorite from "../models/favorite.models.js";
import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";

// ADD FAVORITE
export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { listingId } = req.params;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in to save properties."
        )
      );
    }

    if (!listingId) {
      return next(
        errorHandler(400, "Listing ID is required.")
      );
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return next(
        errorHandler(404, "Property not found.")
      );
    }

    // Check if already saved
    const existingFavorite = await Favorite.findOne({
      userRef: userId,
      listingId,
    });

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: "Property is already saved.",
        favorite: existingFavorite,
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userRef: userId,
      listingId,
    });

    return res.status(201).json({
      success: true,
      message: "Property saved successfully!",
      favorite,
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);
    next(error);
  }
};

// REMOVE FAVORITE
export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { listingId } = req.params;

    if (!userId) {
      return next(
        errorHandler(401, "You must be signed in.")
      );
    }

    const favorite = await Favorite.findOneAndDelete({
      userRef: userId,
      listingId,
    });

    if (!favorite) {
      return next(
        errorHandler(
          404,
          "Saved property not found."
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Property removed from saved properties.",
    });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);
    next(error);
  }
};

// CHECK FAVORITE
export const checkFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { listingId } = req.params;

    // Guest users are allowed to view the property
    if (!userId) {
      return res.status(200).json({
        success: true,
        isFavorite: false,
      });
    }

    const favorite = await Favorite.findOne({
      userRef: userId,
      listingId,
    });

    return res.status(200).json({
      success: true,
      isFavorite: Boolean(favorite),
    });
  } catch (error) {
    console.error("CHECK FAVORITE ERROR:", error);
    next(error);
  }
};

// GET ALL USER FAVORITES
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return next(
        errorHandler(401, "You must be signed in.")
      );
    }

    const favorites = await Favorite.find({
      userRef: userId,
    })
      .populate("listingId")
      .sort({
        createdAt: -1,
      });

    const listings = favorites
      .filter((favorite) => favorite.listingId)
      .map((favorite) => favorite.listingId);

    return res.status(200).json({
      success: true,
      listings,
      totalFavorites: listings.length,
    });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);
    next(error);
  }
};