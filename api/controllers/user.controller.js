import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import Listing from "../models/listing.models.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({
    message: "API is running",
  });
};

// =========================
// UPDATE USER
// =========================
export const updateUser = async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  if (userId !== req.params.id) {
    return next(
      errorHandler(403, "You can update only your account!")
    );
  }

  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    if (req.body.avatar) {
      updateData.avatar = req.body.avatar;
    }

    if (req.body.password) {
      updateData.password = await bcrypt.hash(
        req.body.password,
        10
      );
    }

    // Updated 'new: true' to 'returnDocument: "after"' to resolve Mongoose deprecation warning
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return next(
        errorHandler(404, "User not found")
      );
    }

    const { password, ...rest } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: rest,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// DELETE USER
// =========================
// Renamed export from deleteuser -> deleteUser to fix route import crash
export const deleteUser = async (req, res, next) => {
  const userId = req.user.id || req.user._id;

  if (userId !== req.params.id) {
    return next(
      errorHandler(
        401,
        "You can only delete your own account!"
      )
    );
  }

  try {
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
  const userId = req.user.id || req.user._id;

  if (userId !== req.params.id) {
    return next(
      errorHandler(401, "You can only view your own listings!")
    );
  }

  try {
    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};