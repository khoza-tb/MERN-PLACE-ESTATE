import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// Cookie options for dev consistency
const COOKIE_OPTIONS = {
  httpOnly: true,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
};

// =========================
// SIGN UP
// =========================
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(
        errorHandler(400, "Please provide username, email and password")
      );
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return next(errorHandler(400, "Username or email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// SIGN IN
// =========================
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(errorHandler(400, "Please provide email and password"));
    }

    const validUser = await User.findOne({ email });

    if (!validUser) {
      return next(errorHandler(404, "User not found"));
    }

    const validPassword = await bcrypt.compare(password, validUser.password);

    if (!validPassword) {
      return next(errorHandler(401, "Wrong credentials"));
    }

    // Standardized token payload to include both id and _id
    const token = jwt.sign(
      { id: validUser._id, _id: validUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: hashedPassword, ...userData } = validUser._doc;

    res
      .cookie("access_token", token, COOKIE_OPTIONS)
      .status(200)
      .json(userData); // Sending user object directly to match Redux currentUser
  } catch (error) {
    next(error);
  }
};

// =========================
// GOOGLE SIGN IN
// =========================
export const google = async (req, res, next) => {
  try {
    const { email, name, photo } = req.body;

    if (!email) {
      return next(errorHandler(400, "Google email is required"));
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const { password, ...rest } = user._doc;

      return res
        .cookie("access_token", token, COOKIE_OPTIONS)
        .status(200)
        .json(rest);
    }

    const baseUsername = name
      ? name.split(" ").join("").toLowerCase()
      : "user";

    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const username = `${baseUsername}${randomNumber}`;

    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: photo,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, _id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password, ...rest } = newUser._doc;

    return res
      .cookie("access_token", token, COOKIE_OPTIONS)
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// =========================
// SIGN OUT
// =========================
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie("access_token");

    return res.status(200).json({
      success: true,
      message: "User has been logged out!",
    });
  } catch (error) {
    next(error);
  }
};