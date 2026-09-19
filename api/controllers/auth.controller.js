import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { errorHandler } from "../utils/error.js";

// =====================================================
// COOKIE OPTIONS
// =====================================================

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // localhost development
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// =====================================================
// CREATE JWT TOKEN
// =====================================================

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured in the environment."
    );
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      _id: user._id.toString(),
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

// =====================================================
// REMOVE PASSWORD FROM USER
// =====================================================

const removePassword = (user) => {
  if (!user) {
    return null;
  }

  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  const {
    password,
    ...userData
  } = userObject;

  return userData;
};

// =====================================================
// SET AUTH COOKIE
// =====================================================

const setAuthCookie = (res, token) => {
  res.cookie(
    "access_token",
    token,
    COOKIE_OPTIONS
  );

  return res;
};

// =====================================================
// TEST AUTH ROUTE
// =====================================================

export const test = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Auth route is working!",
  });
};

// =====================================================
// SIGN UP
// =====================================================

export const signup = async (
  req,
  res,
  next
) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    console.log(
      "================================="
    );

    console.log(
      "USER SIGNUP REQUEST:"
    );

    console.log({
      username,
      email,
      passwordProvided:
        Boolean(password),
    });

    console.log(
      "================================="
    );

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return next(
        errorHandler(
          400,
          "Please provide username, email and password."
        )
      );
    }

    const normalizedUsername =
      username.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password.trim();

    if (
      !normalizedUsername ||
      !normalizedEmail ||
      !cleanPassword
    ) {
      return next(
        errorHandler(
          400,
          "Please provide valid username, email and password."
        )
      );
    }

    if (cleanPassword.length < 6) {
      return next(
        errorHandler(
          400,
          "Password must be at least 6 characters."
        )
      );
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser =
      await User.findOne({
        $or: [
          {
            username:
              normalizedUsername,
          },
          {
            email:
              normalizedEmail,
          },
        ],
      });

    if (existingUser) {
      if (
        existingUser.email ===
        normalizedEmail
      ) {
        return next(
          errorHandler(
            400,
            "Email already exists."
          )
        );
      }

      return next(
        errorHandler(
          400,
          "Username already exists."
        )
      );
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        cleanPassword,
        10
      );

    console.log(
      "PASSWORD HASH CREATED:",
      hashedPassword.substring(0, 10) + "..."
    );

    // =================================================
    // CREATE NORMAL USER
    // =================================================

    const newUser = new User({
      username:
        normalizedUsername,

      email:
        normalizedEmail,

      password:
        hashedPassword,

      role: "user",
    });

    await newUser.save();

    console.log(
      "USER CREATED SUCCESSFULLY:",
      {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    );

    console.log(
      "================================="
    );

    return res.status(201).json({
      success: true,
      message:
        "User created successfully.",
    });
  } catch (error) {
    console.error(
      "❌ SIGNUP ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// USER SIGN IN
// =====================================================

export const signin = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    console.log(
      "================================="
    );

    console.log(
      "USER SIGNIN REQUEST"
    );

    console.log({
      email,
      passwordProvided:
        Boolean(password),
    });

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return next(
        errorHandler(
          400,
          "Please provide email and password."
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password.trim();

    if (
      !normalizedEmail ||
      !cleanPassword
    ) {
      return next(
        errorHandler(
          400,
          "Please provide email and password."
        )
      );
    }

    // =================================================
    // FIND USER
    // =================================================

    const validUser =
      await User.findOne({
        email: normalizedEmail,
      });

    console.log(
      "USER FOUND:",
      Boolean(validUser)
    );

    // =================================================
    // USER NOT FOUND
    // =================================================

    if (!validUser) {
      console.log(
        "❌ NO USER FOUND FOR:",
        normalizedEmail
      );

      console.log(
        "================================="
      );

      return next(
        errorHandler(
          401,
          "Wrong credentials."
        )
      );
    }

    console.log(
      "USER DETAILS:",
      {
        id: validUser._id.toString(),
        email: validUser.email,
        username: validUser.username,
        role:
          validUser.role || "user",
        hasPassword:
          Boolean(validUser.password),
      }
    );

    // =================================================
    // ADMIN PROTECTION
    // =================================================

    if (
      validUser.role === "admin"
    ) {
      console.log(
        "❌ ADMIN ATTEMPTED USER LOGIN"
      );

      return next(
        errorHandler(
          403,
          "Admin accounts must use the admin sign-in option."
        )
      );
    }

    // =================================================
    // CHECK PASSWORD EXISTS
    // =================================================

    if (!validUser.password) {
      console.log(
        "❌ USER HAS NO PASSWORD"
      );

      return next(
        errorHandler(
          400,
          "This account does not have a password. Please use Google Sign In."
        )
      );
    }

    // =================================================
    // CHECK PASSWORD HASH FORMAT
    // =================================================

    console.log(
      "PASSWORD HASH:",
      validUser.password.substring(
        0,
        10
      ) + "..."
    );

    // =================================================
    // COMPARE PASSWORD
    // =================================================

    const validPassword =
      await bcrypt.compare(
        cleanPassword,
        validUser.password
      );

    console.log(
      "PASSWORD MATCH:",
      validPassword
    );

    // =================================================
    // WRONG PASSWORD
    // =================================================

    if (!validPassword) {
      console.log(
        "❌ PASSWORD DOES NOT MATCH"
      );

      console.log(
        "================================="
      );

      return next(
        errorHandler(
          401,
          "Wrong credentials."
        )
      );
    }

    // =================================================
    // CREATE JWT
    // =================================================

    const token =
      createToken(validUser);

    console.log(
      "✅ JWT CREATED"
    );

    // =================================================
    // REMOVE PASSWORD
    // =================================================

    const userData =
      removePassword(validUser);

    console.log(
      "USER LOGIN SUCCESS:",
      {
        id: validUser._id.toString(),
        email: validUser.email,
        username: validUser.username,
        role:
          validUser.role || "user",
      }
    );

    console.log(
      "================================="
    );

    // =================================================
    // SEND COOKIE + USER
    // =================================================

    return setAuthCookie(
      res,
      token
    )
      .status(200)
      .json({
        success: true,
        message:
          "Signed in successfully.",
        user: userData,
      });
  } catch (error) {
    console.error(
      "❌ USER SIGNIN ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// ADMIN SIGN IN
// =====================================================

export const adminSignin = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    console.log(
      "================================="
    );

    console.log(
      "ADMIN SIGNIN REQUEST"
    );

    // =================================================
    // VALIDATE INPUT
    // =================================================

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return next(
        errorHandler(
          400,
          "Please provide admin email and password."
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password.trim();

    if (
      !normalizedEmail ||
      !cleanPassword
    ) {
      return next(
        errorHandler(
          400,
          "Please provide admin email and password."
        )
      );
    }

    // =================================================
    // FIND ADMIN
    // =================================================

    const admin =
      await User.findOne({
        email: normalizedEmail,
      });

    if (!admin) {
      return next(
        errorHandler(
          401,
          "Wrong admin credentials."
        )
      );
    }

    console.log(
      "ADMIN ACCOUNT FOUND:",
      {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        hasPassword:
          Boolean(admin.password),
      }
    );

    // =================================================
    // VERIFY ADMIN ROLE
    // =================================================

    if (
      admin.role !== "admin"
    ) {
      return next(
        errorHandler(
          403,
          "You do not have administrator access."
        )
      );
    }

    // =================================================
    // VERIFY PASSWORD EXISTS
    // =================================================

    if (!admin.password) {
      return next(
        errorHandler(
          400,
          "Admin account does not have a password."
        )
      );
    }

    // =================================================
    // VERIFY PASSWORD
    // =================================================

    const validPassword =
      await bcrypt.compare(
        cleanPassword,
        admin.password
      );

    console.log(
      "ADMIN PASSWORD MATCH:",
      validPassword
    );

    if (!validPassword) {
      return next(
        errorHandler(
          401,
          "Wrong admin credentials."
        )
      );
    }

    // =================================================
    // CREATE JWT
    // =================================================

    const token =
      createToken(admin);

    const adminData =
      removePassword(admin);

    console.log(
      "✅ ADMIN LOGIN SUCCESS:",
      admin.email
    );

    console.log(
      "================================="
    );

    return setAuthCookie(
      res,
      token
    )
      .status(200)
      .json({
        success: true,
        message:
          "Admin signed in successfully.",
        user: adminData,
      });
  } catch (error) {
    console.error(
      "❌ ADMIN SIGNIN ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GOOGLE SIGN IN
// =====================================================

export const google = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
      name,
      photo,
    } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return next(
        errorHandler(
          400,
          "Google email is required."
        )
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // =================================================
    // FIND EXISTING USER
    // =================================================

    let user =
      await User.findOne({
        email: normalizedEmail,
      });

    // =================================================
    // EXISTING USER
    // =================================================

    if (user) {
      // Admin cannot use Google login
      if (
        user.role === "admin"
      ) {
        return next(
          errorHandler(
            403,
            "Admin accounts must use the admin sign-in option."
          )
        );
      }

      // Update avatar if changed
      if (
        photo &&
        photo !== user.avatar
      ) {
        user.avatar = photo;

        await user.save();
      }

      const token =
        createToken(user);

      const userData =
        removePassword(user);

      return setAuthCookie(
        res,
        token
      )
        .status(200)
        .json({
          success: true,
          message:
            "Google sign in successful.",
          user: userData,
        });
    }

    // =================================================
    // CREATE NEW GOOGLE USER
    // =================================================

    let baseUsername = name
      ? name
          .trim()
          .replace(/\s+/g, "")
          .toLowerCase()
      : "googleuser";

    baseUsername =
      baseUsername.replace(
        /[^a-zA-Z0-9]/g,
        ""
      );

    if (!baseUsername) {
      baseUsername =
        "googleuser";
    }

    // =================================================
    // UNIQUE USERNAME
    // =================================================

    let username = "";
    let usernameExists = true;

    while (usernameExists) {
      const randomNumber =
        Math.floor(
          10000 +
            Math.random() *
              90000
        );

      username =
        `${baseUsername}${randomNumber}`;

      const existingUsername =
        await User.findOne({
          username,
        });

      usernameExists =
        Boolean(existingUsername);
    }

    // =================================================
    // RANDOM PASSWORD
    // =================================================

    const generatedPassword =
      crypto
        .randomBytes(32)
        .toString("hex");

    const hashedPassword =
      await bcrypt.hash(
        generatedPassword,
        10
      );

    // =================================================
    // CREATE USER
    // =================================================

    user = new User({
      username,

      email:
        normalizedEmail,

      password:
        hashedPassword,

      avatar:
        photo ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",

      role: "user",
    });

    await user.save();

    console.log(
      "NEW GOOGLE USER CREATED:",
      user.email
    );

    // =================================================
    // CREATE JWT
    // =================================================

    const token =
      createToken(user);

    const userData =
      removePassword(user);

    return setAuthCookie(
      res,
      token
    )
      .status(200)
      .json({
        success: true,
        message:
          "Google sign in successful.",
        user: userData,
      });
  } catch (error) {
    console.error(
      "❌ GOOGLE SIGN IN ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// SIGN OUT
// =====================================================

export const signOut = async (
  req,
  res,
  next
) => {
  try {
    return res
      .clearCookie(
        "access_token",
        {
          httpOnly:
            COOKIE_OPTIONS.httpOnly,

          sameSite:
            COOKIE_OPTIONS.sameSite,

          secure:
            COOKIE_OPTIONS.secure,
        }
      )
      .status(200)
      .json({
        success: true,
        message:
          "User has been logged out!",
      });
  } catch (error) {
    console.error(
      "❌ SIGNOUT ERROR:",
      error
    );

    next(error);
  }
};