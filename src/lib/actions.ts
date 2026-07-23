"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getUserRole, requireWeddingAccess } from "@/lib/permissions";

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
    // Check if user is owner
    wedding = await prisma.wedding.findFirst({
      where: { id: weddingId, userId: session.user.id },
      include: {
        budgetItems: { orderBy: { order: "asc" } },
        vendors: { orderBy: { order: "asc" } },
        guests: { orderBy: { order: "asc" } },
        tasks: { orderBy: { order: "asc" } },
        seatingTables: { orderBy: { order: "asc" } },
        aiMessages: { orderBy: { createdAt: "asc" } },
        roomAllocations: { orderBy: { order: "asc" } },
        events: { orderBy: { order: "asc" } },
        timelineItems: { orderBy: { order: "asc" } },
        collaborators: { where: { status: "accepted" }, include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    // If not owner, check if collaborator
    if (!wedding) {
      const collab = await prisma.weddingCollaborator.findFirst({
        where: { weddingId, userId: session.user.id, status: "accepted" },
      });
      if (collab) {
        wedding = await prisma.wedding.findFirst({
          where: { id: weddingId },
          include: {
            budgetItems: { orderBy: { order: "asc" } },
            vendors: { orderBy: { order: "asc" } },
            guests: { orderBy: { order: "asc" } },
            tasks: { orderBy: { order: "asc" } },
            seatingTables: { orderBy: { order: "asc" } },
            aiMessages: { orderBy: { createdAt: "asc" } },
            roomAllocations: { orderBy: { order: "asc" } },
            events: { orderBy: { order: "asc" } },
            timelineItems: { orderBy: { order: "asc" } },
            collaborators: { where: { status: "accepted" }, include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          },
        });
      }
    }

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
        roomAllocations: { orderBy: { order: "asc" } },
        events: { orderBy: { order: "asc" } },
        timelineItems: { orderBy: { order: "asc" } },
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

export async function getWeddingWithRole(weddingId: string) {
  const wedding = await getCurrentWedding(weddingId);
  const role = await getUserRole(weddingId);
  return { ...wedding, userRole: role };
}

export async function getAllWeddings() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const owned = await prisma.wedding.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { budgetItems: true, vendors: true, guests: true, tasks: true, events: true } },
    },
  });

  const collabEntries = await prisma.weddingCollaborator.findMany({
    where: { userId: session.user.id, status: "accepted" },
    include: {
      wedding: {
        include: {
          _count: { select: { budgetItems: true, vendors: true, guests: true, tasks: true, events: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const collaborated = collabEntries.map((c) => ({
    ...c.wedding,
    userRole: c.role,
    owner: c.wedding.user,
  }));

  return { owned, collaborated };
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

  const role = await getUserRole(data.weddingId);
  if (!role) throw new Error("Wedding not found");
  if (role === "viewer") throw new Error("Unauthorized");

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
  const tables = wedding.seatingTables || [];
  const maxOrder = tables.length > 0 ? Math.max(...tables.map((s: any) => s.order)) : -1;
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

export async function assignGuestsToTable(weddingId: string, tableName: string, guestName: string) {
  const wedding = await getCurrentWedding(weddingId);
  const tables = wedding.seatingTables || [];
  const guests = wedding.guests || [];

  // Find table by name (case-insensitive, partial match)
  const table = tables.find((t: any) => t.name.toLowerCase().includes(tableName.toLowerCase()));
  if (!table) throw new Error(`Table "${tableName}" not found. Create it first from the Seating section.`);

  // Find matching guests
  const matches = guests.filter((g: any) => g.name?.toLowerCase().includes(guestName.toLowerCase()));
  if (matches.length === 0) throw new Error(`No guests found matching "${guestName}".`);

  // Get current guests on this table
  let currentGuests: string[] = [];
  try { currentGuests = JSON.parse(table.guests || "[]"); } catch { currentGuests = []; }

  // Add new guest IDs (avoid duplicates)
  let added = 0;
  for (const g of matches) {
    if (!currentGuests.includes(g.id)) {
      currentGuests.push(g.id);
      added++;
    }
  }

  await prisma.seatingTable.update({
    where: { id: table.id },
    data: { guests: JSON.stringify(currentGuests) },
  });

  return { assigned: added, tableName: table.name };
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
        category: sanitize(item.category),
        item: sanitize(item.item),
        estimated,
        actual: Number(item.actual) || 0,
        paid,
        balance: estimated - paid,
        status: paid >= estimated && estimated > 0 ? "Paid" : paid > 0 ? "Partial" : "Pending",
        dueDate: sanitize(item.dueDate),
        notes: sanitize(item.notes),
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
        category: sanitize(item.category),
        name: sanitize(item.name),
        contact: sanitize(item.contact),
        quote,
        paid,
        balance: quote - paid,
        rating: sanitize(item.rating) || "\u2605\u2605\u2605\u2605\u2606",
        contract: sanitize(item.contract) || "Pending",
        notes: sanitize(item.notes),
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
        name: sanitize(item.name),
        relation: sanitize(item.relation),
        side: sanitize(item.side) || "Both",
        rsvp: sanitize(item.rsvp) || "Pending",
        dietary: sanitize(item.dietary) || "Veg",
        tableNum: 0,
        giftGiven: "No",
        thankYou: "No",
        notes: sanitize(item.notes),
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// WEDDING EVENTS
// ═══════════════════════════════════════════════════════════════

export async function getWeddingEvents(weddingId: string) {
  await requireWeddingAccess(weddingId, true);

  return prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
  });
}

export async function createWeddingEvent(weddingId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const maxOrder = await prisma.weddingEvent.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  return prisma.weddingEvent.create({
    data: {
      weddingId,
      order: (maxOrder._max.order ?? -1) + 1,
      name: data.name || "New Event",
      description: data.description || "",
      date: data.date || "",
      startTime: data.startTime || "10:00",
      duration: data.duration || 60,
      location: data.location || "",
      isRitual: data.isRitual || false,
      isSimultaneous: data.isSimultaneous || false,
    },
  });
}

export async function updateWeddingEvent(weddingId: string, eventId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const { weddingId: _, ...updateData } = data;

  if (updateData.duration !== undefined) updateData.duration = Number(updateData.duration);
  if (updateData.isRitual !== undefined) updateData.isRitual = Boolean(updateData.isRitual);
  if (updateData.isSimultaneous !== undefined) updateData.isSimultaneous = Boolean(updateData.isSimultaneous);
  if (updateData.order !== undefined) updateData.order = Number(updateData.order);

  return prisma.weddingEvent.update({
    where: { id: eventId },
    data: updateData,
  });
}

export async function deleteWeddingEvent(weddingId: string, eventId: string) {
  await requireWeddingAccess(weddingId);

  return prisma.weddingEvent.delete({ where: { id: eventId } });
}

export async function seedWeddingEvents(weddingId: string) {
  await requireWeddingAccess(weddingId, true);

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId },
  });
  if (!wedding) throw new Error("Wedding not found");

  if (!wedding.weddingDate) {
    const existing = await prisma.weddingEvent.findMany({ where: { weddingId } });
    if (existing.length > 0) return;

    const EVENTS: Record<string, Array<{ name: string; description: string; startTime: string; duration: number; isRitual: boolean; isSimultaneous?: boolean }>> = {
      hindu: [
        { name: "Roka", description: "Official engagement ceremony between families", startTime: "11:00", duration: 120, isRitual: true },
        { name: "Engagement", description: "Ring exchange ceremony", startTime: "19:00", duration: 120, isRitual: true },
        { name: "Mehendi", description: "Henna application for bride and guests", startTime: "16:00", duration: 180, isRitual: false },
        { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false },
        { name: "Haldi", description: "Turmeric paste ceremony for bride and groom", startTime: "09:00", duration: 120, isRitual: true },
        { name: "Wedding", description: "Baraat, Jaimala, Pheras - main wedding ceremony", startTime: "10:00", duration: 240, isRitual: true, isSimultaneous: true },
        { name: "Reception", description: "Grand evening celebration and dinner", startTime: "19:00", duration: 240, isRitual: false },
      ],
      muslim: [
        { name: "Mangni", description: "Engagement ceremony", startTime: "19:00", duration: 120, isRitual: true },
        { name: "Mehendi", description: "Henna night for bride", startTime: "16:00", duration: 180, isRitual: false },
        { name: "Nikah", description: "Islamic wedding ceremony", startTime: "10:00", duration: 180, isRitual: true },
        { name: "Walima", description: "Post-wedding reception hosted by groom's family", startTime: "19:00", duration: 240, isRitual: true, isSimultaneous: true },
      ],
      sikh: [
        { name: "Kurmai", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true },
        { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false },
        { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false },
        { name: "Anand Karaj", description: "Wedding ceremony at Gurdwara", startTime: "10:00", duration: 180, isRitual: true },
        { name: "Langar", description: "Community meal at Gurdwara", startTime: "13:00", duration: 120, isRitual: true, isSimultaneous: true },
        { name: "Reception", description: "Evening celebration party", startTime: "19:00", duration: 240, isRitual: false },
      ],
      christian: [
        { name: "Engagement", description: "Formal engagement ceremony", startTime: "19:00", duration: 120, isRitual: true },
        { name: "Roce Ceremony", description: "Pre-wedding turmeric ceremony", startTime: "17:00", duration: 120, isRitual: true },
        { name: "Church Wedding", description: "Wedding ceremony at church", startTime: "10:00", duration: 120, isRitual: true },
        { name: "Reception", description: "Celebration and reception", startTime: "19:00", duration: 240, isRitual: false },
      ],
      jain: [
        { name: "Roka", description: "Official engagement between families", startTime: "11:00", duration: 120, isRitual: true },
        { name: "Engagement", description: "Ring exchange ceremony", startTime: "19:00", duration: 120, isRitual: true },
        { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false },
        { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false },
        { name: "Wedding", description: "Jain wedding rituals and ceremonies", startTime: "10:00", duration: 180, isRitual: true },
        { name: "Reception", description: "Grand celebration and dinner", startTime: "19:00", duration: 240, isRitual: false },
      ],
    };

    let selectedNames: string[];
    try { selectedNames = JSON.parse(wedding.selectedEvents || "[]"); } catch { selectedNames = []; }
    selectedNames = selectedNames.map((n) => n === "Wedding Day" || n === "Wedding Ceremony" ? "Wedding" : n);

    const template = EVENTS[wedding.religion] || EVENTS.hindu;
    const filtered = selectedNames.length > 0 ? template.filter((t) => selectedNames.includes(t.name)) : template;

    let order = 0;
    for (const t of filtered) {
      await prisma.weddingEvent.create({
        data: {
          weddingId, order: order++, name: t.name, description: t.description,
          date: "", startTime: t.startTime, duration: t.duration,
          location: wedding.weddingCity || "", isRitual: t.isRitual, isSimultaneous: t.isSimultaneous || false,
        },
      });
    }
    return;
  }

  const existing = await prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
  });

  const weddingDate = new Date(wedding.weddingDate);
  weddingDate.setHours(0, 0, 0, 0);

  // Each event has a dayOffset relative to the wedding date (0 = wedding day, negative = before, positive = after)
  const EVENTS: Record<string, Array<{ name: string; description: string; startTime: string; duration: number; isRitual: boolean; dayOffset: number; isSimultaneous?: boolean }>> = {
    hindu: [
      { name: "Roka", description: "Official engagement ceremony between families", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Engagement", description: "Ring exchange ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -4 },
      { name: "Mehendi", description: "Henna application for bride and guests", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Haldi", description: "Turmeric paste ceremony for bride and groom", startTime: "09:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Baraat, Jaimala, Pheras - main wedding ceremony", startTime: "10:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
      { name: "Reception", description: "Grand evening celebration and dinner", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    muslim: [
      { name: "Mangni", description: "Engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna night for bride", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic wedding ceremony", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Post-wedding reception hosted by groom's family", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    sikh: [
      { name: "Kurmai", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Anand Karaj", description: "Wedding ceremony at Gurdwara", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Langar", description: "Community meal at Gurdwara", startTime: "13:00", duration: 120, isRitual: true, dayOffset: 0, isSimultaneous: true },
      { name: "Reception", description: "Evening celebration party", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    christian: [
      { name: "Engagement", description: "Formal engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Roce Ceremony", description: "Pre-wedding turmeric ceremony", startTime: "17:00", duration: 120, isRitual: true, dayOffset: -1 },
      { name: "Church Wedding", description: "Wedding ceremony at church", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Celebration and reception", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    jain: [
      { name: "Roka", description: "Official engagement between families", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -4 },
      { name: "Engagement", description: "Ring exchange ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1, isSimultaneous: true },
      { name: "Wedding", description: "Jain wedding rituals and ceremonies", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration and dinner", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
  };

  const template = EVENTS[wedding.religion] || EVENTS.hindu;

  // Parse selectedEvents from JSON string
  let selectedNames: string[];
  try {
    selectedNames = JSON.parse(wedding.selectedEvents || "[]");
  } catch {
    selectedNames = template.map((t) => t.name);
  }

  // Normalize legacy names: "Wedding Day" / "Wedding Ceremony" -> "Wedding"
  selectedNames = selectedNames.map((n) => {
    if (n === "Wedding Day" || n === "Wedding Ceremony") return "Wedding";
    return n;
  });

  // Filter template to only selected events
  const filteredTemplate = selectedNames.length > 0
    ? template.filter((t) => selectedNames.includes(t.name))
    : template;

  // If events already exist, check if dates match the wedding date. If not, update them.
  if (existing.length > 0) {
    // Remove events that are no longer selected
    for (const evt of existing) {
      if (!filteredTemplate.some((t) => t.name === evt.name)) {
        await prisma.weddingEvent.delete({ where: { id: evt.id } });
      }
    }

    let needsUpdate = false;
    for (const evt of existing) {
      const expectedDate = new Date(weddingDate);
      const templateEntry = filteredTemplate.find((t) => t.name === evt.name);
      if (templateEntry) {
        expectedDate.setDate(expectedDate.getDate() + templateEntry.dayOffset);
        const expectedStr = expectedDate.toISOString().split("T")[0];
        if (evt.date !== expectedStr) {
          needsUpdate = true;
          break;
        }
      }
    }

    if (!needsUpdate) return;

    // Update dates for existing events
    for (const evt of existing) {
      const templateEntry = filteredTemplate.find((t) => t.name === evt.name);
      if (templateEntry) {
        const newDate = new Date(weddingDate);
        newDate.setDate(newDate.getDate() + templateEntry.dayOffset);
        await prisma.weddingEvent.update({
          where: { id: evt.id },
          data: { date: newDate.toISOString().split("T")[0] },
        });
      }
    }
    return;
  }

  // Create events from template
  let order = 0;
  for (const t of filteredTemplate) {
    const date = new Date(weddingDate);
    date.setDate(date.getDate() + t.dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    await prisma.weddingEvent.create({
      data: {
        weddingId,
        order: order++,
        name: t.name,
        description: t.description,
        date: dateStr,
        startTime: t.startTime,
        duration: t.duration,
        location: wedding.weddingCity || "",
        isRitual: t.isRitual,
        isSimultaneous: t.isSimultaneous || false,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// WEDDING TIMELINE ITEMS
// ═══════════════════════════════════════════════════════════════

export async function getWeddingTimelineItems(weddingId: string) {
  await requireWeddingAccess(weddingId, true);

  return prisma.weddingTimelineItem.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
  });
}

export async function createWeddingTimelineItem(weddingId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const maxOrder = await prisma.weddingTimelineItem.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  return prisma.weddingTimelineItem.create({
    data: {
      weddingId,
      order: (maxOrder._max.order ?? -1) + 1,
      title: data.title || "New Item",
      description: data.description || "",
      startTime: data.startTime || "09:00",
      duration: data.duration || 30,
      isHighlight: data.isHighlight || false,
      isSimultaneous: data.isSimultaneous || false,
    },
  });
}

export async function updateWeddingTimelineItem(weddingId: string, itemId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const { weddingId: _, ...updateData } = data;

  if (updateData.duration !== undefined) updateData.duration = Number(updateData.duration);
  if (updateData.isHighlight !== undefined) updateData.isHighlight = Boolean(updateData.isHighlight);
  if (updateData.isSimultaneous !== undefined) updateData.isSimultaneous = Boolean(updateData.isSimultaneous);
  if (updateData.order !== undefined) updateData.order = Number(updateData.order);

  return prisma.weddingTimelineItem.update({
    where: { id: itemId },
    data: updateData,
  });
}

export async function deleteWeddingTimelineItem(weddingId: string, itemId: string) {
  await requireWeddingAccess(weddingId);

  return prisma.weddingTimelineItem.delete({ where: { id: itemId } });
}

export async function seedWeddingTimeline(weddingId: string) {
  await requireWeddingAccess(weddingId);

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId },
  });
  if (!wedding) throw new Error("Wedding not found");

  const existing = await prisma.weddingTimelineItem.findMany({ where: { weddingId } });

  // Parse selectedEvents to filter timeline items
  let selectedNames: string[];
  try {
    selectedNames = JSON.parse(wedding.selectedEvents || "[]");
  } catch {
    selectedNames = [];
  }

  // Each timeline item is tagged with an eventGroup that maps to a WeddingEvent name
  const TIMELINE: Record<string, Array<{ title: string; description: string; startTime: string; duration: number; isHighlight: boolean; isSimultaneous?: boolean; eventGroup: string }>> = {
    hindu: [
      { title: "Bride's Getting Ready", description: "Hair, makeup, and dressing", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true, eventGroup: "Wedding" },
      { title: "Groom's Getting Ready", description: "Sherwani, sehra, accessories", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true, eventGroup: "Wedding" },
      { title: "Morning Puja", description: "Prayers and blessings", startTime: "07:00", duration: 60, isHighlight: false, eventGroup: "Wedding" },
      { title: "Baraat Assembly", description: "Groom's side gathers", startTime: "08:00", duration: 60, isHighlight: false, eventGroup: "Wedding" },
      { title: "Baraat Procession", description: "Band, DJ, dancing", startTime: "09:00", duration: 60, isHighlight: true, eventGroup: "Wedding" },
      { title: "Milni & Welcome", description: "Groom welcomed by bride's family", startTime: "10:00", duration: 30, isHighlight: false, eventGroup: "Wedding" },
      { title: "Jaimala", description: "Exchange of garlands", startTime: "10:30", duration: 30, isHighlight: true, eventGroup: "Wedding" },
      { title: "Kanyadaan", description: "Father gives away the bride", startTime: "11:00", duration: 30, isHighlight: true, eventGroup: "Wedding" },
      { title: "Mangal Pheras", description: "Seven rounds around sacred fire", startTime: "11:30", duration: 60, isHighlight: true, eventGroup: "Wedding" },
      { title: "Sindoor & Mangalsutra", description: "Groom applies sindoor", startTime: "12:30", duration: 30, isHighlight: true, eventGroup: "Wedding" },
      { title: "Vidaai", description: "Bride's farewell", startTime: "13:00", duration: 30, isHighlight: true, eventGroup: "Wedding" },
      { title: "Lunch", description: "Wedding lunch", startTime: "13:30", duration: 60, isHighlight: false, eventGroup: "Wedding" },
      { title: "Griha Pravesh", description: "Bride enters groom's home", startTime: "16:00", duration: 30, isHighlight: false, eventGroup: "Wedding" },
      { title: "Reception", description: "Evening celebration", startTime: "18:00", duration: 180, isHighlight: true, eventGroup: "Reception" },
    ],
    muslim: [
      { title: "Mehendi", description: "Henna for bride", startTime: "08:00", duration: 120, isHighlight: false, eventGroup: "Mehendi" },
      { title: "Nikah", description: "Signing of Nikahnama", startTime: "10:00", duration: 60, isHighlight: true, eventGroup: "Nikah" },
      { title: "Mehr Exchange", description: "Groom presents Mahr", startTime: "11:00", duration: 30, isHighlight: true, eventGroup: "Nikah" },
      { title: "Blessings & Photos", description: "Family blessings", startTime: "12:00", duration: 60, isHighlight: false, eventGroup: "Nikah" },
      { title: "Lunch", description: "Wedding feast", startTime: "13:00", duration: 60, isHighlight: false, eventGroup: "Nikah" },
      { title: "Ruksati", description: "Bride's farewell", startTime: "16:00", duration: 30, isHighlight: true, eventGroup: "Walima" },
      { title: "Walima", description: "Grand reception", startTime: "18:00", duration: 180, isHighlight: true, eventGroup: "Walima" },
    ],
    sikh: [
      { title: "Chooda Ceremony", description: "Maternal uncle sets chooda", startTime: "06:00", duration: 60, isHighlight: true, eventGroup: "Anand Karaj" },
      { title: "Groom Gets Ready", description: "Sherwani, turban, kirpan", startTime: "08:00", duration: 120, isHighlight: false, eventGroup: "Anand Karaj" },
      { title: "Anand Karaj Begins", description: "Groom enters Gurdwara", startTime: "10:00", duration: 30, isHighlight: true, eventGroup: "Anand Karaj" },
      { title: "Lavaan", description: "Four rounds around Guru Granth Sahib", startTime: "10:30", duration: 120, isHighlight: true, eventGroup: "Anand Karaj" },
      { title: "Ardas", description: "Final prayer", startTime: "12:30", duration: 30, isHighlight: false, eventGroup: "Anand Karaj" },
      { title: "Langar", description: "Community meal", startTime: "13:00", duration: 60, isHighlight: false, eventGroup: "Langar" },
      { title: "Reception", description: "Evening celebration", startTime: "18:00", duration: 180, isHighlight: true, eventGroup: "Reception" },
    ],
    christian: [
      { title: "Bride Gets Ready", description: "White gown and veil", startTime: "08:00", duration: 120, isHighlight: false, eventGroup: "Church Wedding" },
      { title: "Church Ceremony", description: "Bride walks down the aisle", startTime: "10:00", duration: 30, isHighlight: true, eventGroup: "Church Wedding" },
      { title: "Exchange of Vows", description: "Wedding promises", startTime: "10:30", duration: 30, isHighlight: true, eventGroup: "Church Wedding" },
      { title: "Exchange of Rings", description: "Wedding rings", startTime: "11:00", duration: 30, isHighlight: true, eventGroup: "Church Wedding" },
      { title: "Signing Register", description: "Legal signing", startTime: "12:00", duration: 30, isHighlight: false, eventGroup: "Church Wedding" },
      { title: "Photos", description: "Group photographs", startTime: "13:00", duration: 60, isHighlight: false, eventGroup: "Church Wedding" },
      { title: "Reception", description: "Dinner, cake, first dance", startTime: "18:00", duration: 180, isHighlight: true, eventGroup: "Reception" },
    ],
    jain: [
      { title: "Bride's Getting Ready", description: "Hair, makeup, and dressing", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true, eventGroup: "Wedding" },
      { title: "Groom's Getting Ready", description: "Sherwani, accessories", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true, eventGroup: "Wedding" },
      { title: "Mandap Setup", description: "Ceremonial canopy preparation", startTime: "08:00", duration: 60, isHighlight: false, eventGroup: "Wedding" },
      { title: "Jain Wedding Ceremony", description: "Pheras and rituals", startTime: "10:00", duration: 120, isHighlight: true, eventGroup: "Wedding" },
      { title: "Ashirvad", description: "Elder blessings", startTime: "12:00", duration: 30, isHighlight: false, eventGroup: "Wedding" },
      { title: "Lunch", description: "Wedding lunch", startTime: "12:30", duration: 60, isHighlight: false, eventGroup: "Wedding" },
      { title: "Reception", description: "Grand celebration and dinner", startTime: "18:00", duration: 180, isHighlight: true, eventGroup: "Reception" },
    ],
  };

  const template = TIMELINE[wedding.religion] || TIMELINE.hindu;

  // Normalize legacy names: "Wedding Day" / "Wedding Ceremony" -> "Wedding"
  selectedNames = selectedNames.map((n) => {
    if (n === "Wedding Day" || n === "Wedding Ceremony") return "Wedding";
    return n;
  });

  // If no events selected, show nothing (user can add manually)
  const filteredTemplate = selectedNames.length > 0
    ? template.filter((t) => selectedNames.includes(t.eventGroup))
    : template;

  // If timeline items already exist, check if they match the selected events.
  // If not, delete old items and re-seed.
  if (existing.length > 0) {
    const existingTitles = new Set(existing.map((item) => item.title));
    const templateTitles = new Set(filteredTemplate.map((t) => t.title));
    // Check both directions: existing items not in template, OR template items missing from DB
    const hasStale = existing.some((item) => !templateTitles.has(item.title));
    const hasMissing = filteredTemplate.some((t) => !existingTitles.has(t.title));
    if (!hasStale && !hasMissing) return; // Already in sync
    // Delete all existing timeline items and re-seed
    await prisma.weddingTimelineItem.deleteMany({ where: { weddingId } });
  }

  let order = 0;

  for (const item of filteredTemplate) {
    await prisma.weddingTimelineItem.create({
      data: {
        weddingId,
        order: order++,
        title: item.title,
        description: item.description,
        startTime: item.startTime,
        duration: item.duration,
        isHighlight: item.isHighlight,
        isSimultaneous: item.isSimultaneous || false,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// ROOM ALLOCATIONS
// ═══════════════════════════════════════════════════════════════

export async function createRoomAllocation(weddingId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const maxOrder = await prisma.roomAllocation.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  return prisma.roomAllocation.create({
    data: {
      weddingId,
      order: (maxOrder._max.order ?? -1) + 1,
      guestName: data.guestName || "",
      hotel: data.hotel || "",
      roomNumber: data.roomNumber || "",
      roomType: data.roomType || "Standard",
      checkIn: data.checkIn || "",
      checkOut: data.checkOut || "",
      status: data.status || "Reserved",
      notes: data.notes || "",
    },
  });
}

export async function updateRoomAllocation(weddingId: string, allocationId: string, data: any) {
  await requireWeddingAccess(weddingId);

  const { weddingId: _, ...updateData } = data;
  return prisma.roomAllocation.update({
    where: { id: allocationId },
    data: updateData,
  });
}

export async function deleteRoomAllocation(weddingId: string, allocationId: string) {
  await requireWeddingAccess(weddingId);

  return prisma.roomAllocation.delete({ where: { id: allocationId } });
}

function sanitize(val: any): string {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) {
    return val.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  }
  if (typeof val === "number") return String(val);
  return String(val).trim();
}

export async function batchCreateRoomAllocations(weddingId: string, items: any[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.roomAllocation.aggregate({
    where: { weddingId },
    _max: { order: true },
  });

  let order = (maxOrder._max.order ?? -1) + 1;

  for (const item of items) {
    await prisma.roomAllocation.create({
      data: {
        weddingId,
        order: order++,
        guestName: sanitize(item.guestName),
        hotel: sanitize(item.hotel),
        roomNumber: sanitize(item.roomNumber),
        roomType: sanitize(item.roomType) || "Standard",
        checkIn: sanitize(item.checkIn),
        checkOut: sanitize(item.checkOut),
        status: sanitize(item.status) || "Reserved",
        notes: sanitize(item.notes),
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// BULK DELETE
// ═══════════════════════════════════════════════════════════════

export async function bulkDeleteBudgetItems(weddingId: string, ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return prisma.budgetItem.deleteMany({ where: { id: { in: ids }, weddingId } });
}

export async function bulkDeleteVendors(weddingId: string, ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return prisma.vendor.deleteMany({ where: { id: { in: ids }, weddingId } });
}

export async function bulkDeleteGuests(weddingId: string, ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return prisma.guest.deleteMany({ where: { id: { in: ids }, weddingId } });
}

export async function bulkDeleteSeatingTables(weddingId: string, ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return prisma.seatingTable.deleteMany({ where: { id: { in: ids }, weddingId } });
}

export async function bulkDeleteRoomAllocations(weddingId: string, ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return prisma.roomAllocation.deleteMany({ where: { id: { in: ids }, weddingId } });
}

// ═══════════════════════════════════════════════════════════════
// BULK ADD (create multiple empty rows)
// ═══════════════════════════════════════════════════════════════

export async function bulkAddBudgetItems(weddingId: string, count: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.budgetItem.aggregate({ where: { weddingId }, _max: { order: true } });
  let order = (maxOrder._max.order ?? -1) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.budgetItem.create({
      data: { weddingId, order: order++, category: "", item: "", estimated: 0, actual: 0, paid: 0, balance: 0, status: "Pending", dueDate: "", notes: "" },
    });
  }
}

export async function bulkAddVendors(weddingId: string, count: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.vendor.aggregate({ where: { weddingId }, _max: { order: true } });
  let order = (maxOrder._max.order ?? -1) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.vendor.create({
      data: { weddingId, order: order++, category: "", name: "", contact: "", quote: 0, paid: 0, balance: 0, rating: "\u2605\u2605\u2605\u2605\u2606", contract: "Pending", notes: "" },
    });
  }
}

export async function bulkAddGuests(weddingId: string, count: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.guest.aggregate({ where: { weddingId }, _max: { order: true } });
  let order = (maxOrder._max.order ?? -1) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.guest.create({
      data: { weddingId, order: order++, name: "", relation: "", side: "Both", rsvp: "Pending", dietary: "Veg", tableNum: 0, giftGiven: "No", thankYou: "No", notes: "" },
    });
  }
}

export async function bulkAddSeatingTables(weddingId: string, count: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.seatingTable.aggregate({ where: { weddingId }, _max: { order: true } });
  let order = (maxOrder._max.order ?? -1) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.seatingTable.create({
      data: { weddingId, order: order++, name: "", capacity: 8, guests: "[]" },
    });
  }
}

export async function bulkAddRoomAllocations(weddingId: string, count: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const maxOrder = await prisma.roomAllocation.aggregate({ where: { weddingId }, _max: { order: true } });
  let order = (maxOrder._max.order ?? -1) + 1;

  for (let i = 0; i < count; i++) {
    await prisma.roomAllocation.create({
      data: { weddingId, order: order++, guestName: "", hotel: "", roomNumber: "", roomType: "Standard", checkIn: "", checkOut: "", status: "Reserved", notes: "" },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// AGENTIC BULK ACTIONS (AI Panel)
// ═══════════════════════════════════════════════════════════════

function matchGuest(guest: any, filter: any): boolean {
  if (filter.relation && guest.relation?.toLowerCase() !== filter.relation.toLowerCase()) return false;
  if (filter.side && guest.side?.toLowerCase() !== filter.side.toLowerCase()) return false;
  if (filter.rsvp && guest.rsvp?.toLowerCase() !== filter.rsvp.toLowerCase()) return false;
  if (filter.dietary && guest.dietary?.toLowerCase() !== filter.dietary.toLowerCase()) return false;
  if (filter.name_contains && !guest.name?.toLowerCase().includes(filter.name_contains.toLowerCase())) return false;
  return true;
}

function matchVendor(vendor: any, filter: any): boolean {
  if (filter.category && vendor.category?.toLowerCase() !== filter.category.toLowerCase()) return false;
  if (filter.contract && vendor.contract?.toLowerCase() !== filter.contract.toLowerCase()) return false;
  if (filter.name_contains && !vendor.name?.toLowerCase().includes(filter.name_contains.toLowerCase())) return false;
  if (filter.rating && vendor.rating !== filter.rating) return false;
  return true;
}

function matchBudgetItem(item: any, filter: any): boolean {
  if (filter.category && item.category?.toLowerCase() !== filter.category.toLowerCase()) return false;
  if (filter.status && item.status?.toLowerCase() !== filter.status.toLowerCase()) return false;
  if (filter.name_contains && !item.item?.toLowerCase().includes(filter.name_contains.toLowerCase())) return false;
  return true;
}

function matchRoom(room: any, filter: any): boolean {
  if (filter.hotel && room.hotel?.toLowerCase() !== filter.hotel.toLowerCase()) return false;
  if (filter.status && room.status?.toLowerCase() !== filter.status.toLowerCase()) return false;
  if (filter.roomType && room.roomType?.toLowerCase() !== filter.roomType.toLowerCase()) return false;
  if (filter.name_contains && !room.guestName?.toLowerCase().includes(filter.name_contains.toLowerCase())) return false;
  return true;
}

export async function previewBulkAction(weddingId: string, type: string, filter: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await getCurrentWedding(weddingId);
  let matches: any[] = [];

  if (type === "guests" || type === "delete_guests") {
    matches = (wedding.guests || []).filter((g: any) => matchGuest(g, filter));
    return { count: matches.length, sample: matches.slice(0, 10).map((g: any) => ({ id: g.id, name: g.name, rsvp: g.rsvp, side: g.side, relation: g.relation, dietary: g.dietary })) };
  }
  if (type === "assign_seating") {
    matches = (wedding.guests || []).filter((g: any) => matchGuest(g, filter));
    return { count: matches.length, sample: matches.slice(0, 10).map((g: any) => ({ id: g.id, name: g.name })) };
  }
  if (type === "vendors" || type === "delete_vendors") {
    matches = (wedding.vendors || []).filter((v: any) => matchVendor(v, filter));
    return { count: matches.length, sample: matches.slice(0, 10).map((v: any) => ({ id: v.id, name: v.name, category: v.category, contract: v.contract })) };
  }
  if (type === "budget" || type === "delete_budget") {
    matches = (wedding.budgetItems || []).filter((i: any) => matchBudgetItem(i, filter));
    return { count: matches.length, sample: matches.slice(0, 10).map((i: any) => ({ id: i.id, item: i.item, category: i.category, estimated: i.estimated, status: i.status })) };
  }
  if (type === "rooms" || type === "delete_rooms") {
    matches = (wedding.roomAllocations || []).filter((r: any) => matchRoom(r, filter));
    return { count: matches.length, sample: matches.slice(0, 10).map((r: any) => ({ id: r.id, guestName: r.guestName, hotel: r.hotel, status: r.status, roomType: r.roomType })) };
  }

  return { count: 0, sample: [] };
}

export async function executeBulkUpdate(weddingId: string, type: string, filter: any, updates: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await getCurrentWedding(weddingId);
  let updated = 0;

  if (type === "guests") {
    const matches = (wedding.guests || []).filter((g: any) => matchGuest(g, filter));
    for (const g of matches) {
      await prisma.guest.update({ where: { id: g.id }, data: updates });
      updated++;
    }
  } else if (type === "vendors") {
    const matches = (wedding.vendors || []).filter((v: any) => matchVendor(v, filter));
    for (const v of matches) {
      await prisma.vendor.update({ where: { id: v.id }, data: updates });
      updated++;
    }
  } else if (type === "budget") {
    const matches = (wedding.budgetItems || []).filter((i: any) => matchBudgetItem(i, filter));
    for (const i of matches) {
      await prisma.budgetItem.update({ where: { id: i.id }, data: updates });
      updated++;
    }
  } else if (type === "rooms") {
    const matches = (wedding.roomAllocations || []).filter((r: any) => matchRoom(r, filter));
    for (const r of matches) {
      await prisma.roomAllocation.update({ where: { id: r.id }, data: updates });
      updated++;
    }
  } else if (type === "tasks") {
    if (updates.done !== undefined) {
      const matches = (wedding.tasks || []).filter((t: any) => {
        if (filter.period && t.period !== filter.period) return false;
        if (filter.done !== undefined && t.done !== filter.done) return false;
        return true;
      });
      for (const t of matches) {
        await prisma.task.update({ where: { id: t.id }, data: { done: updates.done } });
        updated++;
      }
    }
  } else if (type === "delete_guests") {
    const matches = (wedding.guests || []).filter((g: any) => matchGuest(g, filter));
    for (const g of matches) {
      await prisma.guest.delete({ where: { id: g.id } });
      updated++;
    }
  } else if (type === "delete_vendors") {
    const matches = (wedding.vendors || []).filter((v: any) => matchVendor(v, filter));
    for (const v of matches) {
      await prisma.vendor.delete({ where: { id: v.id } });
      updated++;
    }
  } else if (type === "delete_budget") {
    const matches = (wedding.budgetItems || []).filter((i: any) => matchBudgetItem(i, filter));
    for (const i of matches) {
      await prisma.budgetItem.delete({ where: { id: i.id } });
      updated++;
    }
  } else if (type === "delete_rooms") {
    const matches = (wedding.roomAllocations || []).filter((r: any) => matchRoom(r, filter));
    for (const r of matches) {
      await prisma.roomAllocation.delete({ where: { id: r.id } });
      updated++;
    }
  }

  return { updated };
}

export async function getWeddingSummary(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const w = await getCurrentWedding(weddingId);
  const budgetSpent = (w.budgetItems || []).reduce((s: number, i: any) => s + (i.paid || 0), 0);
  const budgetAllocated = (w.budgetItems || []).reduce((s: number, i: any) => s + (i.estimated || 0), 0);
  const rsvpYes = (w.guests || []).filter((g: any) => g.rsvp === "Yes").length;
  const rsvpPending = (w.guests || []).filter((g: any) => g.rsvp === "Pending").length;
  const vendorsBooked = (w.vendors || []).filter((v: any) => v.contract === "Signed").length;
  const tasksDone = (w.tasks || []).filter((t: any) => t.done).length;

  return {
    name: w.name,
    religion: w.religion,
    budget: w.budget,
    budgetAllocated,
    budgetSpent,
    budgetRemaining: (w.budget || 0) - budgetAllocated,
    guestCount: (w.guests || []).length,
    rsvpYes,
    rsvpPending,
    rsvpDeclined: (w.guests || []).length - rsvpYes - rsvpPending,
    vendorCount: (w.vendors || []).length,
    vendorsBooked,
    taskCount: (w.tasks || []).length,
    tasksDone,
    roomCount: (w.roomAllocations || []).length,
    weddingDate: w.weddingDate,
    weddingCity: w.weddingCity,
    weddingDays: w.weddingDays,
  };
}

// ─── AI Learning System ──────────────────────────────────────────────

export async function storeInteraction(
  weddingId: string,
  role: string,
  content: string,
  intent?: string,
  targetType?: string,
  successful?: boolean
) {
  try {
    return await prisma.aiMessage.create({
      data: { weddingId, role, content, intent, targetType, successful },
    });
  } catch (e) {
    console.error("Failed to store interaction:", e);
    return null;
  }
}

export async function correctInteraction(
  messageId: string,
  correctedTo: string
) {
  try {
    return await prisma.aiMessage.update({
      where: { id: messageId },
      data: { correctedTo, successful: false },
    });
  } catch (e) {
    console.error("Failed to correct interaction:", e);
    return null;
  }
}

export async function learnCommand(
  weddingId: string,
  pattern: string,
  intent: string,
  targetType: string,
  response: string
) {
  try {
    return await prisma.aiMessage.create({
      data: {
        weddingId,
        role: "learned",
        content: response,
        intent,
        targetType,
        pattern,
        successful: true,
      },
    });
  } catch (e) {
    console.error("Failed to learn command:", e);
    return null;
  }
}

export async function getLearnedPatterns(weddingId: string) {
  try {
    return await prisma.aiMessage.findMany({
      where: { weddingId, role: "learned", successful: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Failed to get learned patterns:", e);
    return [];
  }
}

export async function getInteractionHistory(weddingId: string, limit = 20) {
  try {
    return await prisma.aiMessage.findMany({
      where: {
        weddingId,
        role: { in: ["user", "assistant"] },
        successful: { not: false },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (e) {
    console.error("Failed to get interaction history:", e);
    return [];
  }
}

export async function getSuccessfulPatterns(weddingId: string) {
  try {
    return await prisma.aiMessage.findMany({
      where: {
        weddingId,
        role: "user",
        successful: true,
        intent: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch (e) {
    console.error("Failed to get successful patterns:", e);
    return [];
  }
}
