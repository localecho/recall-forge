// In-memory, per-instance sliding-window limiter. This is a demo-grade
// guard, not a real one: serverless functions can spin up multiple
// instances, so a determined caller can exceed the nominal limit by
// landing on different warm instances. It's still worth having — it stops
// the trivial case (a script hammering one warm instance) from burning
// the whole OpenRouter budget during judging — but it is NOT a substitute
// for a real store (Redis/Upstash) if this ever needs to survive real
// traffic. Documented instead of silently pretended-safe.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string, now: number = Date.now()): boolean {
  const timestamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}
