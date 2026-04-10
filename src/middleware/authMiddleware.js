import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Company } from "../models/index.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const company = await Company.findByPk(decoded.id);

      if (!company) {
        res.status(401);
        throw new Error("Not authorized");
      }

      req.company = company;
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("No token provided");
  }
});

export const adminOnly = (req, res, next) => {
  if (req.company.role !== "ADMIN") {
    res.status(403);
    throw new Error("Admin access required");
  }
  next();
};
