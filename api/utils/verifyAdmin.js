import { errorHandler } from "./error.js";

export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return next(
      errorHandler(401, "You are not authenticated!")
    );
  }

  if (req.user.role !== "admin") {
    return next(
      errorHandler(403, "Admin access required!")
    );
  }

  next();
};