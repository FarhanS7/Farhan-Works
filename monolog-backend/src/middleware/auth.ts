import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Validate JWT_SECRET is configured - required for security
if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is required but not configured. " +
      "Set JWT_SECRET in .env with a cryptographically secure value (min 32 chars).",
  );
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};
