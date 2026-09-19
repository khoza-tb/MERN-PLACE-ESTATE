import User from "../models/user.models.js";
import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";

// =========================
// TEST
// =========================
export const test = (req, res) => {
  res.json({
    message: "User route is working!",
  });
};

// =========================
// UPDATE USER
// =========================
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(
        errorHandler(401, "You can only update your own account!")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          photo: req.body.photo,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found!"));
    }

    const { password, ...userWithoutPassword } =
      updatedUser._doc;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// =========================
// DELETE USER
// =========================
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(
        errorHandler(401, "You can only delete your own account!")
      );
    }

    await User.findByIdAndDelete(req.params.id);

    res.clearCookie("access_token");

    res.status(200).json({
      success: true,
      message: "User has been deleted!",
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// GET USER LISTINGS
// =========================
export const getUserListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({
      userRef: req.params.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("GET USER LISTINGS ERROR:", error);
    next(error);
  }
};