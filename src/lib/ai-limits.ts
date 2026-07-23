import { prisma } from "./prisma";

// ─── Limits configuration ─────────────────────────────────────────
export const AI_LIMITS = {
  perMinute: 20,
  perDay: 50,
  perMonth: 500,
  maxConversationLength: 20,
} as const;

// ─── In-memory per-minute rate limiter (fast, no DB hit) ───────────
const minuteMap = new Map<string, { count: number; resetAt: number }>();

export function checkMinuteLimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = minuteMap.get(key);

  if (!entry || now > entry.resetAt) {
    minuteMap.set(key, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= AI_LIMITS.perMinute) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of minuteMap) {
    if (now > entry.resetAt) minuteMap.delete(key);
  }
}, 60_000);

// ─── DB-backed daily + monthly limits ──────────────────────────────
export async function checkAndRecordUsage(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  dailyRemaining?: number;
  monthlyRemaining?: number;
}> {
  const now = new Date();

  // Start of today (UTC)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Count usage today and this month
  const [dailyCount, monthlyCount] = await Promise.all([
    prisma.aiUsage.count({
      where: { userId, createdAt: { gte: todayStart } },
    }),
    prisma.aiUsage.count({
      where: { userId, createdAt: { gte: monthStart } },
    }),
  ]);

  const dailyRemaining = AI_LIMITS.perDay - dailyCount;
  const monthlyRemaining = AI_LIMITS.perMonth - monthlyCount;

  if (dailyCount >= AI_LIMITS.perDay) {
    return { allowed: false, reason: `Daily limit reached (${AI_LIMITS.perDay}/day). Try again tomorrow.`, dailyRemaining: 0, monthlyRemaining };
  }

  if (monthlyCount >= AI_LIMITS.perMonth) {
    return { allowed: false, reason: `Monthly limit reached (${AI_LIMITS.perMonth}/month). Resets next month.`, dailyRemaining, monthlyRemaining: 0 };
  }

  // Record this usage
  await prisma.aiUsage.create({
    data: { userId },
  });

  return { allowed: true, dailyRemaining: dailyRemaining - 1, monthlyRemaining: monthlyRemaining - 1 };
}

// ─── Conversation length check ─────────────────────────────────────
export function checkConversationLength(history: { role: string; content: string }[]): {
  allowed: boolean;
  message?: string;
} {
  if (history.length >= AI_LIMITS.maxConversationLength) {
    return {
      allowed: false,
      message: `Conversation limit reached (${AI_LIMITS.maxConversationLength} messages). Please start a new chat.`,
    };
  }
  return { allowed: true };
}
