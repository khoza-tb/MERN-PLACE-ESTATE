import User from "../models/user.models.js";
import Listing from "../models/listing.models.js";
import Inquiry from "../models/inquiry.models.js";
import { errorHandler } from "../utils/error.js";

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalInquiries,
      newInquiries,
      adminUsers,
      agentUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Listing.countDocuments(),

      Inquiry.countDocuments(),

      Inquiry.countDocuments({
        status: "new",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments({
        role: "agent",
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalListings,
        totalInquiries,
        newInquiries,
        adminUsers,
        agentUsers,
      },
    });
  } catch (error) {
    console.error(
      "GET ADMIN DASHBOARD ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET ALL USERS
// =====================================================

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error(
      "GET ALL USERS ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE USER ROLE
// =====================================================

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "user",
      "agent",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return next(
        errorHandler(
          400,
          "Invalid role. Allowed roles: user, agent, admin."
        )
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(
        errorHandler(
          404,
          "User not found."
        )
      );
    }

    // Prevent admin from removing their own admin role
    const currentAdminId =
      req.user?.id || req.user?._id;

    if (
      currentAdminId?.toString() ===
        user._id.toString() &&
      role !== "admin"
    ) {
      return next(
        errorHandler(
          400,
          "You cannot remove your own admin role."
        )
      );
    }

    user.role = role;

    await user.save();

    const {
      password,
      ...userData
    } = user._doc;

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully.",
      user: userData,
    });
  } catch (error) {
    console.error(
      "UPDATE USER ROLE ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// DELETE USER
// =====================================================

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user =
      await User.findById(userId);

    if (!user) {
      return next(
        errorHandler(
          404,
          "User not found."
        )
      );
    }

    const currentAdminId =
      req.user?.id || req.user?._id;

    // Prevent deleting yourself
    if (
      currentAdminId?.toString() ===
      user._id.toString()
    ) {
      return next(
        errorHandler(
          400,
          "You cannot delete your own admin account."
        )
      );
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET ALL LISTINGS
// =====================================================

export const getAllListings = async (
  req,
  res,
  next
) => {
  try {
    const listings =
      await Listing.find()
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      listings,
      totalListings:
        listings.length,
    });
  } catch (error) {
    console.error(
      "GET ALL ADMIN LISTINGS ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// DELETE LISTING
// =====================================================

export const deleteListing = async (
  req,
  res,
  next
) => {
  try {
    const { listingId } = req.params;

    const listing =
      await Listing.findById(
        listingId
      );

    if (!listing) {
      return next(
        errorHandler(
          404,
          "Listing not found."
        )
      );
    }

    await Listing.findByIdAndDelete(
      listingId
    );

    return res.status(200).json({
      success: true,
      message:
        "Listing deleted successfully.",
    });
  } catch (error) {
    console.error(
      "ADMIN DELETE LISTING ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET ALL INQUIRIES
// =====================================================

export const getAllInquiries = async (
  req,
  res,
  next
) => {
  try {
    const inquiries =
      await Inquiry.find()
        .populate(
          "senderId",
          "username email avatar"
        )
        .populate(
          "ownerId",
          "username email avatar"
        )
        .populate(
          "listingId",
          "name address regularPrice discountPrice imageUrls"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      inquiries,
      totalInquiries:
        inquiries.length,
    });
  } catch (error) {
    console.error(
      "GET ALL INQUIRIES ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE INQUIRY STATUS - ADMIN
// =====================================================

export const updateInquiryStatusAdmin =
  async (req, res, next) => {
    try {
      const { inquiryId } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses = [
        "new",
        "read",
        "replied",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return next(
          errorHandler(
            400,
            "Invalid inquiry status."
          )
        );
      }

      const inquiry =
        await Inquiry.findById(
          inquiryId
        );

      if (!inquiry) {
        return next(
          errorHandler(
            404,
            "Inquiry not found."
          )
        );
      }

      inquiry.status = status;

      await inquiry.save();

      return res.status(200).json({
        success: true,
        message:
          "Inquiry status updated successfully.",
        inquiry,
      });
    } catch (error) {
      console.error(
        "ADMIN UPDATE INQUIRY STATUS ERROR:",
        error
      );

      next(error);
    }
  };

// =====================================================
// DELETE INQUIRY - ADMIN
// =====================================================

export const deleteInquiry = async (
  req,
  res,
  next
) => {
  try {
    const { inquiryId } =
      req.params;

    if (!inquiryId) {
      return next(
        errorHandler(
          400,
          "Inquiry ID is required."
        )
      );
    }

    const inquiry =
      await Inquiry.findByIdAndDelete(
        inquiryId
      );

    if (!inquiry) {
      return next(
        errorHandler(
          404,
          "Inquiry not found."
        )
      );
    }

    console.log(
      "🗑️ Inquiry deleted:",
      inquiry._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Inquiry deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE INQUIRY ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET RECENT ACTIVITY
// =====================================================

export const getRecentActivity = async (
  req,
  res,
  next
) => {
  try {
    const [
      recentInquiries,
      recentListings,
      recentUsers,
    ] = await Promise.all([
      // -----------------------------------------------
      // RECENT INQUIRIES
      // -----------------------------------------------

      Inquiry.find()
        .populate(
          "senderId",
          "username email avatar"
        )
        .populate(
          "listingId",
          "name address regularPrice discountPrice imageUrls"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5),

      // -----------------------------------------------
      // RECENT LISTINGS
      // -----------------------------------------------

      Listing.find()
        .sort({
          createdAt: -1,
        })
        .limit(5),

      // -----------------------------------------------
      // RECENT USERS
      // -----------------------------------------------

      User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .limit(5),
    ]);

    return res.status(200).json({
      success: true,

      activity: {
        recentInquiries,
        recentListings,
        recentUsers,
      },
    });
  } catch (error) {
    console.error(
      "GET RECENT ACTIVITY ERROR:",
      error
    );

    next(error);
  }
};