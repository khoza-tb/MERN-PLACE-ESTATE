import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
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
  // Make sure the logged-in user is updating their own account
  if (req.user.id !== req.params.id) {
    return next(
      errorHandler(403, "You can update only your account!")
    );
  }

  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    // Only change the password if a new password was provided
    if (req.body.password) {
      updateData.password = await bcrypt.hash(
        req.body.password,
        10
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // User doesn't exist
    if (!updatedUser) {
      return next(
        errorHandler(404, "User not found")
      );
    }

    // Don't send password back to frontend
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
export const deleteuser = async (req, res, next) => {
  // Make sure the logged-in user is deleting their own account
  if (req.user.id !== req.params.id) {
    return next(
      errorHandler(
        401,
        "You can only delete your own account!"
      )
    );
  }

  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User has been deleted!",
    });
  } catch (error) {
    next(error);
  }
};