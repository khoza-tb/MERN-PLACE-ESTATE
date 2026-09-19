
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.models.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO);

    console.log("MongoDB connected successfully.");

    const email = "admin@primeplaceestate.com";
    const newPassword = "Admin@12345";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Admin account not found.");
      console.log("Email searched:", email);

      await mongoose.connection.close();
      process.exit(1);
    }

    console.log("Admin account found.");
    console.log("Email:", user.email);
    console.log("Current role:", user.role);

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.role = "admin";

    await user.save();

    console.log("");
    console.log("======================================");
    console.log("✅ ADMIN PASSWORD UPDATED SUCCESSFULLY");
    console.log("======================================");
    console.log("Email:", email);
    console.log("Password:", newPassword);
    console.log("Role:", user.role);
    console.log("======================================");
    console.log("");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR RESETTING ADMIN PASSWORD:");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error(closeError);
    }

    process.exit(1);
  }
};

resetAdminPassword();

