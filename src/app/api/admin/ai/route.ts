import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalMessages, messagesToday, messagesThisWeek, messagesThisMonth] = await Promise.all([
    prisma.aiMessage.count(),
    prisma.aiMessage.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.aiMessage.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.aiMessage.count({ where: { createdAt: { gte: monthAgo } } }),
  ]);

  // Top users by usage count
  const usageByUser = await prisma.aiUsage.groupBy({
    by: ["userId"],
    orderBy: { userId: "asc" },
  });

  // Count occurrences per user
  const userCounts: Record<string, number> = {};
  for (const u of usageByUser) {
    userCounts[u.userId] = (userCounts[u.userId] || 0) + 1;
  }

  const sorted = Object.entries(userCounts)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topUsers = await Promise.all(
    sorted.map(async (u) => {
      const user = await prisma.user.findUnique({
        where: { id: u.userId },
        select: { id: true, name: true, email: true },
      });
      return {
        userId: u.userId,
        name: user?.name || "Unknown",
        email: user?.email || "Unknown",
        count: u.count,
      };
    })
  );

  // Daily usage for last 7 days
  const dailyUsage = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const count = await prisma.aiMessage.count({
      where: { createdAt: { gte: dayStart, lt: dayEnd } },
    });

    dailyUsage.push({
      date: dayStart.toISOString().split("T")[0],
      count,
    });
  }

  return NextResponse.json({
    totalMessages,
    messagesToday,
    messagesThisWeek,
    messagesThisMonth,
    topUsers,
    dailyUsage,
  });
}
