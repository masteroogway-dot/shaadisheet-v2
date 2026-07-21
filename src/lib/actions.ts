"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// ═══════════════════════════════════════════════════════════════
// AUTH: SIGNUP
// ═══════════════════════════════════════════════════════════════

export async function signup(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { success: true, userId: user.id };
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Get current user's wedding
// ═══════════════════════════════════════════════════════════════

async function getCurrentWedding(weddingId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  let wedding;
  if (weddingId) {
    wedding = await prisma.wedding.findFirst({
      where: { id: weddingId, userId: session.user.id },
      include: {
        budgetItems: { orderBy: { order: "asc" } },
        vendors: { orderBy: { order: "asc" } },
        guests: { orderBy: { order: "asc" } },
        tasks: { orderBy: { order: "asc" } },
        seatingTables: { orderBy: { order: "asc" } },
        aiMessages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!wedding) throw new Error("Wedding not found");
  } else {
    wedding = await prisma.wedding.findFirst({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        budgetItems: { orderBy: { order: "asc" } },
        vendors: { orderBy: { order: "asc" } },
        guests: { orderBy: { order: "asc" } },
        tasks: { orderBy: { order: "asc" } },
        seatingTables: { orderBy: { order: "asc" } },
        aiMessages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!wedding) throw new Error("No wedding found");
  }

  return wedding;
}

// ═══════════════════════════════════════════════════════════════
// WEDDING
// ═══════════════════════════════════════════════════════════════

export async function getWedding(weddingId?: string) {
  return getCurrentWedding(weddingId);
}

export async function updateWedding(data: {
  weddingId: string;
  name?: string;
  religion?: string;
  region?: string;
  budget?: number;
  guestCount?: number;
  weddingDays?: number;
  weddingDate?: Date;
  weddingCity?: string;
  selectedEvents?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.findFirst({
    where: { id: data.weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  const { weddingId, selectedEvents, ...rest } = data;
  return prisma.wedding.update({
    where: { id: weddingId },
    data: {
      ...rest,
      selectedEvents: selectedEvents ? JSON.stringify(selectedEvents) : undefined,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// BUDGET ITEMS
// ═══════════════════════════════════════════════════════════════

export async function getBudgetItems(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.budgetItems;
}

export async function createBudgetItem(weddingId: string, data: {
  category: string;
  item: string;
  estimated: number;
  actual?: number;
  paid?: number;
  balance?: number;
  status?: string;
  dueDate?: string;
  notes?: string;
}) {
  const wedding = await getCurrentWedding(weddingId);
  const maxOrder = Math.max(...wedding.budgetItems.map((b: any) => b.order), -1);
  return prisma.budgetItem.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateBudgetItem(
  weddingId: string,
  id: string,
  data: {
    category?: string;
    item?: string;
    estimated?: number;
    actual?: number;
    paid?: number;
    balance?: number;
    status?: string;
    dueDate?: string;
    notes?: string;
  }
) {
  const wedding = await getCurrentWedding(weddingId);
  const item = await prisma.budgetItem.findUnique({ where: { id } });
  if (!item || item.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.budgetItem.update({ where: { id }, data });
}

export async function deleteBudgetItem(weddingId: string, id: string) {
  const wedding = await getCurrentWedding(weddingId);
  const item = await prisma.budgetItem.findUnique({ where: { id } });
  if (!item || item.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.budgetItem.delete({ where: { id } });
}

export async function bulkCreateBudgetItems(weddingId: string, items: Array<{
  category: string;
  item: string;
  estimated: number;
  actual?: number;
  paid?: number;
  balance?: number;
  status?: string;
  dueDate?: string;
  notes?: string;
  order: number;
}>) {
  const wedding = await getCurrentWedding(weddingId);
  await prisma.budgetItem.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.budgetItem.createMany({
    data: items.map((item) => ({ ...item, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════

export async function getVendors(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.vendors;
}

export async function createVendor(weddingId: string, data: {
  category: string;
  name: string;
  contact?: string;
  quote?: number;
  paid?: number;
  balance?: number;
  rating?: string;
  contract?: string;
  notes?: string;
}) {
  const wedding = await getCurrentWedding(weddingId);
  const maxOrder = Math.max(...wedding.vendors.map((v: any) => v.order), -1);
  return prisma.vendor.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateVendor(
  weddingId: string,
  id: string,
  data: {
    category?: string;
    name?: string;
    contact?: string;
    quote?: number;
    paid?: number;
    balance?: number;
    rating?: string;
    contract?: string;
    notes?: string;
  }
) {
  const wedding = await getCurrentWedding(weddingId);
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor || vendor.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.vendor.update({ where: { id }, data });
}

export async function deleteVendor(weddingId: string, id: string) {
  const wedding = await getCurrentWedding(weddingId);
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor || vendor.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.vendor.delete({ where: { id } });
}

export async function bulkCreateVendors(weddingId: string, vendors: Array<{
  category: string;
  name: string;
  contact?: string;
  quote?: number;
  paid?: number;
  balance?: number;
  rating?: string;
  contract?: string;
  notes?: string;
  order: number;
}>) {
  const wedding = await getCurrentWedding(weddingId);
  await prisma.vendor.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.vendor.createMany({
    data: vendors.map((v) => ({ ...v, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// GUESTS
// ═══════════════════════════════════════════════════════════════

export async function getGuests(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.guests;
}

export async function createGuest(weddingId: string, data: {
  name: string;
  relation?: string;
  side?: string;
  rsvp?: string;
  dietary?: string;
  tableNum?: number;
  giftGiven?: string;
  thankYou?: string;
  notes?: string;
}) {
  const wedding = await getCurrentWedding(weddingId);
  const maxOrder = Math.max(...wedding.guests.map((g: any) => g.order), -1);
  return prisma.guest.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateGuest(
  weddingId: string,
  id: string,
  data: {
    name?: string;
    relation?: string;
    side?: string;
    rsvp?: string;
    dietary?: string;
    tableNum?: number;
    giftGiven?: string;
    thankYou?: string;
    notes?: string;
  }
) {
  const wedding = await getCurrentWedding(weddingId);
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest || guest.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.guest.update({ where: { id }, data });
}

export async function deleteGuest(weddingId: string, id: string) {
  const wedding = await getCurrentWedding(weddingId);
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest || guest.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.guest.delete({ where: { id } });
}

export async function bulkCreateGuests(weddingId: string, guests: Array<{
  name: string;
  relation?: string;
  side?: string;
  rsvp?: string;
  dietary?: string;
  tableNum?: number;
  giftGiven?: string;
  thankYou?: string;
  notes?: string;
  order: number;
}>) {
  const wedding = await getCurrentWedding(weddingId);
  await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.guest.createMany({
    data: guests.map((g) => ({ ...g, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export async function getTasks(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.tasks;
}

export async function createTask(weddingId: string, data: {
  period: string;
  text: string;
  done?: boolean;
}) {
  const wedding = await getCurrentWedding(weddingId);
  const maxOrder = Math.max(
    ...wedding.tasks.filter((t: any) => t.period === data.period).map((t: any) => t.order),
    -1
  );
  return prisma.task.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateTask(weddingId: string, id: string, data: { done?: boolean; text?: string }) {
  const wedding = await getCurrentWedding(weddingId);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(weddingId: string, id: string) {
  const wedding = await getCurrentWedding(weddingId);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.task.delete({ where: { id } });
}

export async function bulkCreateTasks(weddingId: string, tasks: Array<{
  period: string;
  text: string;
  done?: boolean;
  order: number;
}>) {
  const wedding = await getCurrentWedding(weddingId);
  await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.task.createMany({
    data: tasks.map((t) => ({ ...t, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// SEATING
// ═══════════════════════════════════════════════════════════════

export async function getSeatingTables(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.seatingTables;
}

export async function createSeatingTable(weddingId: string, data: {
  name: string;
  capacity?: number;
  guests?: string;
}) {
  const wedding = await getCurrentWedding(weddingId);
  const maxOrder = Math.max(...wedding.seatingTables.map((s: any) => s.order), -1);
  return prisma.seatingTable.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateSeatingTable(
  weddingId: string,
  id: string,
  data: { name?: string; capacity?: number; guests?: string }
) {
  const wedding = await getCurrentWedding(weddingId);
  const table = await prisma.seatingTable.findUnique({ where: { id } });
  if (!table || table.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.seatingTable.update({ where: { id }, data });
}

export async function deleteSeatingTable(weddingId: string, id: string) {
  const wedding = await getCurrentWedding(weddingId);
  const table = await prisma.seatingTable.findUnique({ where: { id } });
  if (!table || table.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.seatingTable.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// AI MESSAGES
// ═══════════════════════════════════════════════════════════════

export async function getAiMessages(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return wedding.aiMessages;
}

export async function addAiMessage(weddingId: string, role: string, content: string) {
  const wedding = await getCurrentWedding(weddingId);
  return prisma.aiMessage.create({
    data: { weddingId: wedding.id, role, content },
  });
}

export async function clearAiMessages(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  return prisma.aiMessage.deleteMany({ where: { weddingId: wedding.id } });
}

// ═══════════════════════════════════════════════════════════════
// USER WEDDINGS
// ═══════════════════════════════════════════════════════════════

export async function getUserWeddings() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.wedding.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { budgetItems: true, vendors: true, guests: true, tasks: true },
      },
    },
  });
}

export async function createWedding() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.create({
    data: { userId: session.user.id },
  });
  return wedding;
}

export async function deleteWedding(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  return prisma.wedding.delete({ where: { id: weddingId } });
}

// ═══════════════════════════════════════════════════════════════
// BATCH CREATE: IMPORT
// ═══════════════════════════════════════════════════════════════

export async function batchCreateBudgetItems(weddingId: string, items: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.budgetItem.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  let order = (maxOrder._max.order ?? -1) + 1;

  for (const item of items) {
    const estimated = Number(item.estimated) || 0;
    const paid = Number(item.paid) || 0;
    await prisma.budgetItem.create({
      data: {
        weddingId,
        order: order++,
        category: item.category || "",
        item: item.item || "",
        estimated,
        actual: Number(item.actual) || 0,
        paid,
        balance: estimated - paid,
        status: paid >= estimated && estimated > 0 ? "Paid" : paid > 0 ? "Partial" : "Pending",
        dueDate: item.dueDate || "",
        notes: item.notes || "",
      },
    });
  }
}

export async function batchCreateVendors(weddingId: string, items: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.vendor.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  let order = (maxOrder._max.order ?? -1) + 1;

  for (const item of items) {
    const quote = Number(item.quote) || 0;
    const paid = Number(item.paid) || 0;
    await prisma.vendor.create({
      data: {
        weddingId,
        order: order++,
        category: item.category || "",
        name: item.name || "",
        contact: item.contact || "",
        quote,
        paid,
        balance: quote - paid,
        rating: item.rating || "\u2605\u2605\u2605\u2605\u2606",
        contract: item.contract || "Pending",
        notes: item.notes || "",
      },
    });
  }
}

export async function batchCreateGuests(weddingId: string, items: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.guest.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  let order = (maxOrder._max.order ?? -1) + 1;

  for (const item of items) {
    await prisma.guest.create({
      data: {
        weddingId,
        order: order++,
        name: item.name || "",
        relation: item.relation || "",
        side: item.side || "Both",
        rsvp: item.rsvp || "Pending",
        dietary: item.dietary || "Veg",
        tableNum: 0,
        giftGiven: "No",
        thankYou: "No",
        notes: item.notes || "",
      },
    });
  }
}
