import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index(
  {
    userRef: 1,
    listingId: 1,
  },
  {
    unique: true,
  }
);

const Favorite = mongoose.model(
  "Favorite",
  favoriteSchema
);

export default Favorite;