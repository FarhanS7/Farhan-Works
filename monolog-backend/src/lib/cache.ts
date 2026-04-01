/**
 * Simple in-memory cache for development/small deployments
 * For production at scale, upgrade to Redis
 *
 * Usage:
 *   const cached = await getCache('key');
 *   await setCache('key', value, 300); // 5 minutes
 *   await invalidateCache('analytics:*'); // Wildcard pattern
 */

const cache = new Map<
  string,
  { value: any; expiresAt: number }
>();

/**
 * Get value from cache if exists and not expired
 */
export const getCache = async (key: string): Promise<any> => {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

/**
 * Set value in cache with TTL
 */
export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number,
): Promise<void> => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(key, { value, expiresAt });
};

/**
 * Invalidate cache entries by pattern
 * Pattern can be: exact key, or wildcard pattern with *
 * Example: 'analytics:*' matches 'analytics:public-stats', 'analytics:dashboard'
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  if (!pattern.includes('*')) {
    // Exact key match
    const deleted = cache.has(pattern);
    cache.delete(pattern);
    return deleted ? 1 : 0;
  }
  // Wildcard pattern matching
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  let count = 0;
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }
  return count;
};

/**
 * Clear all cache (useful for testing)
 */
export const clearCache = async (): Promise<void> => {
  cache.clear();
};

/**
 * Get cache statistics (for monitoring)
 */
export const getCacheStats = async (): Promise<{
  validEntries: number;
  expiredEntries: number;
  memoryBytes: number;
  totalEntries: number;
}> => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  let memoryBytes = 0;

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      expiredEntries++;
      // Clean up expired
      cache.delete(key);
    } else {
      validEntries++;
      // Rough estimate of memory
      memoryBytes += key.length + JSON.stringify(entry.value).length;
    }
  }

  return {
    validEntries,
    expiredEntries,
    memoryBytes,
    totalEntries: cache.size,
  };
};

/**
 * Cleanup expired entries periodically
 * Call this periodically to prevent memory leaks
 */
export const cleanupExpiredCache = async (): Promise<number> => {
  const now = Date.now();
  let count = 0;
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      count++;
    }
  }
  return count;
};

// Run cleanup every 5 minutes to prevent memory bloat
setInterval(async () => {
  const cleaned = await cleanupExpiredCache();
  if (cleaned > 0) {
    console.debug(`[cache] Cleaned up ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);
