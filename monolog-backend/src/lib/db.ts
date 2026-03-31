import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

// Configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
const maxConnections = parseInt(
  process.env.MAX_POOL_SIZE || (isProduction ? "20" : "10"),
);
const minConnections = parseInt(
  process.env.MIN_POOL_SIZE || (isProduction ? "5" : "2"),
);
const idleTimeout = parseInt(process.env.IDLE_TIMEOUT_MS || "60000");
const connectionTimeout = parseInt(
  process.env.CONNECTION_TIMEOUT_MS || "10000",
);
const statementTimeout = parseInt(process.env.STATEMENT_TIMEOUT_MS || "30000");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enforce SSL certificate validation in production
  ssl: isProduction ? true : { rejectUnauthorized: false }, // Allow self-signed in dev

  // Connection pool sizing
  max: maxConnections,
  min: minConnections,

  // Connection timing
  idleTimeoutMillis: idleTimeout, // Release idle after N ms
  connectionTimeoutMillis: connectionTimeout, // Fail if can't get connection

  // Per-connection settings
  application_name: "monolog-backend",
  statement_timeout: statementTimeout, // Kill slow queries
});

// Event handlers for monitoring
pool.on("error", (err: Error) => {
  console.error(
    "[db] Idle client error:",
    JSON.stringify({
      timestamp: new Date().toISOString(),
      type: "POOL_ERROR",
      message: err.message,
      code: (err as any).code,
    }),
  );
});

pool.on("connect", () => {
  console.debug("[db] New connection established");
});

pool.on("remove", () => {
  console.debug("[db] Connection removed from pool");
});

// Periodic health check to validate pool connectivity
const healthCheckInterval = setInterval(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("[db] Health check failed:", (err as Error).message);
  }
}, 60_000); // Every 60 seconds

// Cleanup on process exit
process.on("exit", () => {
  clearInterval(healthCheckInterval);
});

/**
 * Execute query with built-in timeout
 * Queries will fail if they take longer than statement_timeout
 */
export const query = (text: string, params?: any[]) => pool.query(text, params);

/**
 * Get pool statistics for monitoring/debugging
 */
export const getPoolStats = () => ({
  totalConnections: pool.totalCount,
  availableConnections: pool.idleCount,
  waitingRequests: pool.waitingCount,
  config: {
    maxConnections,
    minConnections,
    idleTimeoutMs: idleTimeout,
    connectionTimeoutMs: connectionTimeout,
    statementTimeoutMs: statementTimeout,
  },
});

/**
 * Test database connectivity - used for health checks
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

/** Exported for health-check and graceful shutdown. */
export default pool;
