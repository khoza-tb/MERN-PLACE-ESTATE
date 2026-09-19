
import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";
import { geocodeAddress } from "../utils/geocode.js";

// =====================================================
// CREATE LISTING
// =====================================================
export const createListing = async (req, res, next) => {
  try {
    const userRef = req.user?.id || req.user?._id;

    if (!userRef) {
      return next(
        errorHandler(
          401,
          "Unauthorized: User identification missing"
        )
      );
    }

    const listing = await Listing.create({
      ...req.body,
      userRef,
    });

    console.log("LISTING CREATED:", {
      listingId: listing._id,
      userRef: listing.userRef,
    });

    return res.status(201).json(listing);
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);
    next(error);
  }
};

// =====================================================
// DELETE LISTING
// =====================================================
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "Unauthorized: User identification missing"
        )
      );
    }

    if (userId.toString() !== listing.userRef.toString()) {
      return next(
        errorHandler(
          401,
          "You can only delete your own listings!"
        )
      );
    }

    await Listing.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Listing has been deleted!",
    });
  } catch (error) {
    console.error("DELETE LISTING ERROR:", error);
    next(error);
  }
};

// =====================================================
// UPDATE LISTING
// =====================================================
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "Unauthorized: User identification missing"
        )
      );
    }

    if (userId.toString() !== listing.userRef.toString()) {
      return next(
        errorHandler(
          401,
          "You can only update your own listings!"
        )
      );
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updatedListing);
  } catch (error) {
    console.error("UPDATE LISTING ERROR:", error);
    next(error);
  }
};

// =====================================================
// GET SINGLE LISTING
// =====================================================
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, "Listing not found!"));
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error("GET LISTING ERROR:", error);
    next(error);
  }
};

// =====================================================
// GET ALL LISTINGS
// =====================================================
export const getListings = async (req, res, next) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit) || 12,
      50
    );

    const startIndex =
      parseInt(req.query.startIndex) || 0;

    const searchTerm =
      req.query.searchTerm?.trim() || "";

    const filters = {};

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------
    if (searchTerm) {
      filters.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          address: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    // -------------------------------------------------
    // TYPE
    // -------------------------------------------------
    if (
      req.query.type === "sale" ||
      req.query.type === "rent"
    ) {
      filters.type = req.query.type;
    }

    // -------------------------------------------------
    // OFFER
    // -------------------------------------------------
    if (req.query.offer === "true") {
      filters.offer = true;
    }

    // -------------------------------------------------
    // FURNISHED
    // -------------------------------------------------
    if (req.query.furnished === "true") {
      filters.furnished = true;
    }

    // -------------------------------------------------
    // PARKING
    // -------------------------------------------------
    if (req.query.parking === "true") {
      filters.parking = true;
    }

    // -------------------------------------------------
    // BEDROOMS
    // -------------------------------------------------
    const bedrooms = Number(req.query.bedrooms);

    if (
      Number.isFinite(bedrooms) &&
      bedrooms > 0
    ) {
      filters.bedrooms = {
        $gte: bedrooms,
      };
    }

    // -------------------------------------------------
    // BATHROOMS
    // -------------------------------------------------
    const bathrooms = Number(req.query.bathrooms);

    if (
      Number.isFinite(bathrooms) &&
      bathrooms > 0
    ) {
      filters.bathrooms = {
        $gte: bathrooms,
      };
    }

    // -------------------------------------------------
    // PRICE
    // -------------------------------------------------
    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);

    if (
      Number.isFinite(minPrice) ||
      Number.isFinite(maxPrice)
    ) {
      filters.regularPrice = {};

      if (Number.isFinite(minPrice)) {
        filters.regularPrice.$gte = minPrice;
      }

      if (Number.isFinite(maxPrice)) {
        filters.regularPrice.$lte = maxPrice;
      }
    }

    // -------------------------------------------------
    // SORT
    // -------------------------------------------------
    const allowedSortFields = [
      "createdAt",
      "regularPrice",
      "name",
    ];

    const sort = allowedSortFields.includes(
      req.query.sort
    )
      ? req.query.sort
      : "createdAt";

    const order =
      req.query.order === "asc" ? 1 : -1;

    // -------------------------------------------------
    // FETCH LISTINGS
    // -------------------------------------------------
    const listings = await Listing.find(filters)
      .sort({
        [sort]: order,
      })
      .limit(limit)
      .skip(startIndex);

    // -------------------------------------------------
    // TOTAL
    // -------------------------------------------------
    const totalListings =
      await Listing.countDocuments(filters);

    return res.status(200).json({
      success: true,
      listings,
      totalListings,
      hasMore:
        startIndex + listings.length <
        totalListings,
    });
  } catch (error) {
    console.error(
      "GET LISTINGS ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET MY LISTINGS
// =====================================================
export const getMyListings = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id || req.user?._id;

    console.log(
      "MY LISTINGS USER ID:",
      userId
    );

    if (!userId) {
      return next(
        errorHandler(
          401,
          "Unauthorized: User identification missing"
        )
      );
    }

    const listings = await Listing.find({
      userRef: userId,
    }).sort({
      createdAt: -1,
    });

    console.log(
      "MY LISTINGS FOUND:",
      listings.length
    );

    return res.status(200).json({
      success: true,
      listings,
    });
  } catch (error) {
    console.error(
      "GET MY LISTINGS ERROR:",
      error
    );

    next(error);
  }
};

