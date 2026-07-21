"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// ═══════════════════════════════════════════════════════════════
// HELPER: Get current user's wedding
// ═══════════════════════════════════════════════════════════════

async function getCurrentWedding() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  let wedding = await prisma.wedding.findFirst({
    where: { userId: session.user.id },
    include: {
      budgetItems: { orderBy: { order: "asc" } },
      vendors: { orderBy: { order: "asc" } },
      guests: { orderBy: { order: "asc" } },
      tasks: { orderBy: { order: "asc" } },
      seatingTables: { orderBy: { order: "asc" } },
      aiMessages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!wedding) {
    wedding = await prisma.wedding.create({
      data: { userId: session.user.id },
      include: {
        budgetItems: { orderBy: { order: "asc" } },
        vendors: { orderBy: { order: "asc" } },
        guests: { orderBy: { order: "asc" } },
        tasks: { orderBy: { order: "asc" } },
        seatingTables: { orderBy: { order: "asc" } },
        aiMessages: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  return wedding;
}

// ═══════════════════════════════════════════════════════════════
// WEDDING
// ═══════════════════════════════════════════════════════════════

export async function getWedding() {
  return getCurrentWedding();
}

export async function updateWedding(data: {
  name?: string;
  religion?: string;
  region?: string;
  budget?: string;
  guestCount?: string;
  weddingDate?: Date;
  weddingCity?: string;
  selectedEvents?: string[];
}) {
  const wedding = await getCurrentWedding();
  return prisma.wedding.update({
    where: { id: wedding.id },
    data: {
      ...data,
      selectedEvents: data.selectedEvents ? JSON.stringify(data.selectedEvents) : undefined,
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// BUDGET ITEMS
// ═══════════════════════════════════════════════════════════════

export async function getBudgetItems() {
  const wedding = await getCurrentWedding();
  return wedding.budgetItems;
}

export async function createBudgetItem(data: {
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
  const wedding = await getCurrentWedding();
  const maxOrder = Math.max(...wedding.budgetItems.map((b: any) => b.order), -1);
  return prisma.budgetItem.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateBudgetItem(
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
  const wedding = await getCurrentWedding();
  const item = await prisma.budgetItem.findUnique({ where: { id } });
  if (!item || item.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.budgetItem.update({ where: { id }, data });
}

export async function deleteBudgetItem(id: string) {
  const wedding = await getCurrentWedding();
  const item = await prisma.budgetItem.findUnique({ where: { id } });
  if (!item || item.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.budgetItem.delete({ where: { id } });
}

export async function bulkCreateBudgetItems(items: Array<{
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
  const wedding = await getCurrentWedding();
  // Delete existing items
  await prisma.budgetItem.deleteMany({ where: { weddingId: wedding.id } });
  // Create new items
  return prisma.budgetItem.createMany({
    data: items.map((item) => ({ ...item, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// VENDORS
// ═══════════════════════════════════════════════════════════════

export async function getVendors() {
  const wedding = await getCurrentWedding();
  return wedding.vendors;
}

export async function createVendor(data: {
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
  const wedding = await getCurrentWedding();
  const maxOrder = Math.max(...wedding.vendors.map((v: any) => v.order), -1);
  return prisma.vendor.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateVendor(
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
  const wedding = await getCurrentWedding();
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor || vendor.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.vendor.update({ where: { id }, data });
}

export async function deleteVendor(id: string) {
  const wedding = await getCurrentWedding();
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor || vendor.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.vendor.delete({ where: { id } });
}

export async function bulkCreateVendors(vendors: Array<{
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
  const wedding = await getCurrentWedding();
  await prisma.vendor.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.vendor.createMany({
    data: vendors.map((v) => ({ ...v, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// GUESTS
// ═══════════════════════════════════════════════════════════════

export async function getGuests() {
  const wedding = await getCurrentWedding();
  return wedding.guests;
}

export async function createGuest(data: {
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
  const wedding = await getCurrentWedding();
  const maxOrder = Math.max(...wedding.guests.map((g: any) => g.order), -1);
  return prisma.guest.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateGuest(
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
  const wedding = await getCurrentWedding();
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest || guest.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.guest.update({ where: { id }, data });
}

export async function deleteGuest(id: string) {
  const wedding = await getCurrentWedding();
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest || guest.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.guest.delete({ where: { id } });
}

export async function bulkCreateGuests(guests: Array<{
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
  const wedding = await getCurrentWedding();
  await prisma.guest.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.guest.createMany({
    data: guests.map((g) => ({ ...g, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════

export async function getTasks() {
  const wedding = await getCurrentWedding();
  return wedding.tasks;
}

export async function createTask(data: {
  period: string;
  text: string;
  done?: boolean;
}) {
  const wedding = await getCurrentWedding();
  const maxOrder = Math.max(
    ...wedding.tasks.filter((t: any) => t.period === data.period).map((t: any) => t.order),
    -1
  );
  return prisma.task.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateTask(id: string, data: { done?: boolean; text?: string }) {
  const wedding = await getCurrentWedding();
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string) {
  const wedding = await getCurrentWedding();
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.task.delete({ where: { id } });
}

export async function bulkCreateTasks(tasks: Array<{
  period: string;
  text: string;
  done?: boolean;
  order: number;
}>) {
  const wedding = await getCurrentWedding();
  await prisma.task.deleteMany({ where: { weddingId: wedding.id } });
  return prisma.task.createMany({
    data: tasks.map((t) => ({ ...t, weddingId: wedding.id })),
  });
}

// ═══════════════════════════════════════════════════════════════
// SEATING
// ═══════════════════════════════════════════════════════════════

export async function getSeatingTables() {
  const wedding = await getCurrentWedding();
  return wedding.seatingTables;
}

export async function createSeatingTable(data: {
  name: string;
  capacity?: number;
  guests?: string;
}) {
  const wedding = await getCurrentWedding();
  const maxOrder = Math.max(...wedding.seatingTables.map((s: any) => s.order), -1);
  return prisma.seatingTable.create({
    data: { weddingId: wedding.id, ...data, order: maxOrder + 1 },
  });
}

export async function updateSeatingTable(
  id: string,
  data: { name?: string; capacity?: number; guests?: string }
) {
  const wedding = await getCurrentWedding();
  const table = await prisma.seatingTable.findUnique({ where: { id } });
  if (!table || table.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.seatingTable.update({ where: { id }, data });
}

export async function deleteSeatingTable(id: string) {
  const wedding = await getCurrentWedding();
  const table = await prisma.seatingTable.findUnique({ where: { id } });
  if (!table || table.weddingId !== wedding.id) throw new Error("Unauthorized");
  return prisma.seatingTable.delete({ where: { id } });
}

// ═══════════════════════════════════════════════════════════════
// AI MESSAGES
// ═══════════════════════════════════════════════════════════════

export async function getAiMessages() {
  const wedding = await getCurrentWedding();
  return wedding.aiMessages;
}

export async function addAiMessage(role: string, content: string) {
  const wedding = await getCurrentWedding();
  return prisma.aiMessage.create({
    data: { weddingId: wedding.id, role, content },
  });
}

export async function clearAiMessages() {
  const wedding = await getCurrentWedding();
  return prisma.aiMessage.deleteMany({ where: { weddingId: wedding.id } });
}
