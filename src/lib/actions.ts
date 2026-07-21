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
        roomAllocations: { orderBy: { order: "asc" } },
        events: { orderBy: { order: "asc" } },
        timelineItems: { orderBy: { order: "asc" } },
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

// ═══════════════════════════════════════════════════════════════
// WEDDING EVENTS
// ═══════════════════════════════════════════════════════════════

export async function getWeddingEvents(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.weddingEvent.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
  });
}

export async function createWeddingEvent(weddingId: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.weddingEvent.delete({ where: { id: eventId } });
}

export async function seedWeddingEvents(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  if (!wedding.weddingDate) return;

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
      { name: "Wedding", description: "Baraat, Jaimala, Pheras — main wedding ceremony", startTime: "10:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
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

  // If events already exist, check if dates match the wedding date. If not, update them.
  if (existing.length > 0) {
    let needsUpdate = false;
    for (const evt of existing) {
      const expectedDate = new Date(weddingDate);
      const templateEntry = template.find((t) => t.name === evt.name);
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
      const templateEntry = template.find((t) => t.name === evt.name);
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
  for (const t of template) {
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.weddingTimelineItem.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
  });
}

export async function createWeddingTimelineItem(weddingId: string, data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.weddingTimelineItem.delete({ where: { id: itemId } });
}

export async function seedWeddingTimeline(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  const existing = await prisma.weddingTimelineItem.count({ where: { weddingId } });
  if (existing > 0) return;

  const TIMELINE: Record<string, Array<{ title: string; description: string; startTime: string; duration: number; isHighlight: boolean; isSimultaneous?: boolean }>> = {
    hindu: [
      { title: "Bride's Getting Ready", description: "Hair, makeup, and dressing", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true },
      { title: "Groom's Getting Ready", description: "Sherwani, sehra, accessories", startTime: "05:00", duration: 120, isHighlight: false, isSimultaneous: true },
      { title: "Morning Puja", description: "Prayers and blessings", startTime: "07:00", duration: 60, isHighlight: false },
      { title: "Baraat Assembly", description: "Groom's side gathers", startTime: "08:00", duration: 60, isHighlight: false },
      { title: "Baraat Procession", description: "Band, DJ, dancing", startTime: "09:00", duration: 60, isHighlight: true },
      { title: "Milni & Welcome", description: "Groom welcomed by bride's family", startTime: "10:00", duration: 30, isHighlight: false },
      { title: "Jaimala", description: "Exchange of garlands", startTime: "10:30", duration: 30, isHighlight: true },
      { title: "Kanyadaan", description: "Father gives away the bride", startTime: "11:00", duration: 30, isHighlight: true },
      { title: "Mangal Pheras", description: "Seven rounds around sacred fire", startTime: "11:30", duration: 60, isHighlight: true },
      { title: "Sindoor & Mangalsutra", description: "Groom applies sindoor", startTime: "12:30", duration: 30, isHighlight: true },
      { title: "Vidaai", description: "Bride's farewell", startTime: "13:00", duration: 30, isHighlight: true },
      { title: "Lunch", description: "Wedding lunch", startTime: "13:30", duration: 60, isHighlight: false },
      { title: "Griha Pravesh", description: "Bride enters groom's home", startTime: "16:00", duration: 30, isHighlight: false },
      { title: "Reception", description: "Evening celebration", startTime: "18:00", duration: 180, isHighlight: true },
    ],
    muslim: [
      { title: "Mehendi", description: "Henna for bride", startTime: "08:00", duration: 120, isHighlight: false },
      { title: "Nikah", description: "Signing of Nikahnama", startTime: "10:00", duration: 60, isHighlight: true },
      { title: "Mehr Exchange", description: "Groom presents Mahr", startTime: "11:00", duration: 30, isHighlight: true },
      { title: "Blessings & Photos", description: "Family blessings", startTime: "12:00", duration: 60, isHighlight: false },
      { title: "Lunch", description: "Wedding feast", startTime: "13:00", duration: 60, isHighlight: false },
      { title: "Ruksati", description: "Bride's farewell", startTime: "16:00", duration: 30, isHighlight: true },
      { title: "Walima", description: "Grand reception", startTime: "18:00", duration: 180, isHighlight: true },
    ],
    sikh: [
      { title: "Chooda Ceremony", description: "Maternal uncle sets chooda", startTime: "06:00", duration: 60, isHighlight: true },
      { title: "Groom Gets Ready", description: "Sherwani, turban, kirpan", startTime: "08:00", duration: 120, isHighlight: false },
      { title: "Anand Karaj Begins", description: "Groom enters Gurdwara", startTime: "10:00", duration: 30, isHighlight: true },
      { title: "Lavaan", description: "Four rounds around Guru Granth Sahib", startTime: "10:30", duration: 120, isHighlight: true },
      { title: "Ardas", description: "Final prayer", startTime: "12:30", duration: 30, isHighlight: false },
      { title: "Langar", description: "Community meal", startTime: "13:00", duration: 60, isHighlight: false },
      { title: "Reception", description: "Evening celebration", startTime: "18:00", duration: 180, isHighlight: true },
    ],
    christian: [
      { title: "Bride Gets Ready", description: "White gown and veil", startTime: "08:00", duration: 120, isHighlight: false },
      { title: "Church Ceremony", description: "Bride walks down the aisle", startTime: "10:00", duration: 30, isHighlight: true },
      { title: "Exchange of Vows", description: "Wedding promises", startTime: "10:30", duration: 30, isHighlight: true },
      { title: "Exchange of Rings", description: "Wedding rings", startTime: "11:00", duration: 30, isHighlight: true },
      { title: "Signing Register", description: "Legal signing", startTime: "12:00", duration: 30, isHighlight: false },
      { title: "Photos", description: "Group photographs", startTime: "13:00", duration: 60, isHighlight: false },
      { title: "Reception", description: "Dinner, cake, first dance", startTime: "18:00", duration: 180, isHighlight: true },
    ],
  };

  const template = TIMELINE[wedding.religion] || TIMELINE.hindu;
  let order = 0;

  for (const item of template) {
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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

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
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const { weddingId: _, ...updateData } = data;
  return prisma.roomAllocation.update({
    where: { id: allocationId },
    data: updateData,
  });
}

export async function deleteRoomAllocation(weddingId: string, allocationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  return prisma.roomAllocation.delete({ where: { id: allocationId } });
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
        guestName: item.guestName || "",
        hotel: item.hotel || "",
        roomNumber: item.roomNumber || "",
        roomType: item.roomType || "Standard",
        checkIn: item.checkIn || "",
        checkOut: item.checkOut || "",
        status: item.status || "Reserved",
        notes: item.notes || "",
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
