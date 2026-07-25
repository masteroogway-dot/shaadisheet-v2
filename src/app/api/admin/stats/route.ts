import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, totalWeddings, totalGuests, totalVendors, newUsersThisWeek, newUsersThisMonth, bannedUsers, aiMessagesToday, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.wedding.count(),
    prisma.guest.count(),
    prisma.vendor.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.user.count({ where: { role: "banned" } }),
    prisma.aiMessage.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalWeddings,
    totalGuests,
    totalVendors,
    newUsersThisWeek,
    newUsersThisMonth,
    bannedUsers,
    aiMessagesToday,
    recentUsers,
  });
}
