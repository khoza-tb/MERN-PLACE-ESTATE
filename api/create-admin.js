import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.models.js";

dotenv.config({
  path: "./api/.env",
});

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO
    );

    console.log(
      "MongoDB connected"
    );

    const email =
      "admin@primeplaceestate.com";

    const password =
      "Admin@12345";

    const existingAdmin =
      await User.findOne({
        email,
      });

    if (existingAdmin) {
      console.log(
        "Admin account already exists."
      );

      console.log(
        "Current role:",
        existingAdmin.role
      );

      await mongoose.disconnect();

      return;
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const admin = new User({
      username: "admin",
      email,
      password: hashedPassword,
      avatar:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      role: "admin",
    });

    await admin.save();

    console.log(
      "================================"
    );

    console.log(
      "ADMIN CREATED SUCCESSFULLY"
    );

    console.log(
      "Email:",
      email
    );

    console.log(
      "Password:",
      password
    );

    console.log(
      "Role:",
      admin.role
    );

    console.log(
      "================================"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "CREATE ADMIN ERROR:",
      error
    );

    process.exit(1);
  }
};

createAdmin();