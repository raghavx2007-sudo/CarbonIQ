// In a true production environment with serverless functions, this should be replaced
// with a distributed cache like Redis (e.g., using Upstash).
// For the purpose of this demonstration and local execution, we use an in-memory map.

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitRecord>();

export const rateLimit = (
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): { success: boolean; limit: number; remaining: number; reset: number } => {
  const now = Date.now();
  const record = rateLimitCache.get(identifier);

  if (!record) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (now > record.resetTime) {
    // Window expired, reset
    rateLimitCache.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  // Increment count
  record.count += 1;
  rateLimitCache.set(identifier, record);
  return { success: true, limit, remaining: limit - record.count, reset: record.resetTime };
};
