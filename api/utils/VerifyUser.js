import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  try {
    console.log("COOKIES:", req.cookies);

    const token = req.cookies?.access_token;

    console.log("ACCESS TOKEN:", token);

    if (!token) {
      return next(
        errorHandler(401, "You are not authenticated!")
      );
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          console.error("JWT VERIFY ERROR:", err);

          return next(
            errorHandler(403, "Token is not valid!")
          );
        }

        req.user = decoded;

        console.log("AUTHENTICATED USER:", {
          id: decoded.id,
          role: decoded.role,
        });

        next();
      }
    );
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);
    next(error);
  }
};
