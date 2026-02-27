interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

interface RateLimiter {
    check(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

/* ========================
   Memory-based (dev/fallback)
   ======================== */
class MemoryRateLimiter implements RateLimiter {
    private store = new Map<string, { count: number; resetAt: number }>();

    async check(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
        const now = Date.now();
        const entry = this.store.get(identifier);

        if (!entry || now > entry.resetAt) {
            this.store.set(identifier, { count: 1, resetAt: now + windowMs });
            return { success: true, remaining: limit - 1, reset: now + windowMs };
        }

        entry.count++;
        if (entry.count > limit) {
            return { success: false, remaining: 0, reset: entry.resetAt };
        }

        return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
    }
}

/* ========================
   Upstash Redis (production)
   ======================== */
class UpstashRateLimiter implements RateLimiter {
    private url: string;
    private token: string;

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    private async redis(command: string[]): Promise<unknown> {
        const res = await fetch(`${this.url}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
        });
        const data = await res.json();
        return data.result;
    }

    async check(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
        const key = `rl:${identifier}`;
        const now = Date.now();
        const windowSec = Math.ceil(windowMs / 1000);

        const count = (await this.redis(["INCR", key])) as number;
        if (count === 1) {
            await this.redis(["EXPIRE", key, String(windowSec)]);
        }

        const ttl = ((await this.redis(["TTL", key])) as number) || windowSec;
        const reset = now + ttl * 1000;

        return {
            success: count <= limit,
            remaining: Math.max(0, limit - count),
            reset,
        };
    }
}

/* ========================
   Factory (fail-open design)
   ======================== */
let limiter: RateLimiter | null = null;
const memoryFallback = new MemoryRateLimiter();

function getLimiter(): RateLimiter {
    if (limiter) return limiter;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
        limiter = new UpstashRateLimiter(url, token);
    } else {
        limiter = memoryFallback;
    }

    return limiter;
}

export async function rateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60_000
): Promise<RateLimitResult> {
    try {
        return await getLimiter().check(identifier, limit, windowMs);
    } catch (err) {
        // If Redis fails (bad credentials, network error, etc.),
        // fall back to memory-based rate limiting instead of crashing the route
        console.error("[RATE_LIMIT_FALLBACK] Redis failed, using memory:", err);
        limiter = memoryFallback;
        return { success: true, remaining: limit - 1, reset: Date.now() + windowMs };
    }
}
