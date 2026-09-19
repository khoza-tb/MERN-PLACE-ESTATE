import mongoose from "mongoose";
import User from "./models/user.models.js";

const makeAdmin = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");

    if (!process.env.MONGO) {
      console.error(
        "❌ MONGO is not loaded."
      );

      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO);

    console.log("✅ Connected to MongoDB");

    // PUT THE EMAIL OF YOUR EXISTING ACCOUNT HERE
    const email = "tsepokhoza266@gmail.com";

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      console.error(
        `❌ No user found with email: ${email}`
      );

      await mongoose.disconnect();
      process.exit(1);
    }

    user.role = "admin";

    await user.save();

    console.log("");
    console.log("==============================");
    console.log("✅ ADMIN CREATED SUCCESSFULLY");
    console.log("==============================");
    console.log("Username:", user.username);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("==============================");
    console.log("");

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

makeAdmin();