import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import pool from "./lib/db.js";
import analyticsRoutes from "./routes/analytics.js";
import authRoutes from "./routes/auth.js";
import commentRoutes from "./routes/comments.js";
import postRoutes from "./routes/posts.js";
import reactionRoutes from "./routes/reactions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

// ── Security & parsing middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "256kb" }));

// ── Rate limiters ─────────────────────────────────────────────────────────────

// Strict limiter for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

// Moderate limiter for public write endpoints (comments, reactions)
const publicWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

// General limiter for all other API traffic
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Rate limit exceeded." },
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res
      .status(503)
      .json({
        status: "degraded",
        db: "unreachable",
        timestamp: new Date().toISOString(),
      });
  }
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", apiLimiter, postRoutes);
app.use("/api/comments", publicWriteLimiter, commentRoutes);
app.use("/api/reactions", publicWriteLimiter, reactionRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err.message);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`MonoLog Backend running on port ${PORT}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
// On SIGTERM / SIGINT: stop accepting new requests, drain in-flight work,
// then close the DB pool before exiting.
const shutdown = (signal: string) => {
  console.log(`[shutdown] ${signal} received — closing server...`);
  server.close(async () => {
    console.log("[shutdown] HTTP server closed. Draining DB pool...");
    await pool.end().catch(console.error);
    console.log("[shutdown] Done.");
    process.exit(0);
  });
  // Force exit if drain takes too long (e.g. stuck query)
  setTimeout(() => {
    console.error("[shutdown] Drain timeout — forcing exit.");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
