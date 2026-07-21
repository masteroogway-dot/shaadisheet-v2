import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function formatINR(n: number) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + " Cr";
  if (n >= 100000) return (n / 100000).toFixed(1) + " L";
  if (n >= 1000) return (n / 1000).toFixed(1) + " K";
  return n.toString();
}

async function getSummary(weddingId: string) {
  const w = await prisma.wedding.findUnique({
    where: { id: weddingId },
    include: {
      budgetItems: true,
      vendors: true,
      guests: true,
      tasks: true,
      roomAllocations: true,
      events: true,
    },
  });
  if (!w) return null;

  let rsvpYes = 0, rsvpPending = 0, vendorsBooked = 0, tasksDone = 0, budgetAllocated = 0, budgetSpent = 0;
  for (const g of w.guests) { if (g.rsvp === "Yes") rsvpYes++; else if (g.rsvp === "Pending") rsvpPending++; }
  for (const v of w.vendors) { if (v.contract === "Signed") vendorsBooked++; }
  for (const t of w.tasks) { if (t.done) tasksDone++; }
  for (const b of w.budgetItems) { budgetAllocated += b.estimated || 0; budgetSpent += b.actual || 0; }

  return {
    name: w.name,
    budget: w.budget || 0,
    budgetAllocated,
    budgetSpent,
    budgetRemaining: (w.budget || 0) - budgetAllocated,
    guestCount: w.guests.length,
    rsvpYes,
    rsvpPending,
    rsvpDeclined: w.guests.length - rsvpYes - rsvpPending,
    vendorCount: w.vendors.length,
    vendorsBooked,
    taskCount: w.tasks.length,
    tasksDone,
    roomCount: w.roomAllocations.length,
    weddingDate: w.weddingDate,
    weddingCity: w.weddingCity,
    weddingDays: w.weddingDays,
    religion: w.religion,
    events: w.events.map((e) => ({ name: e.name, date: e.date, startTime: e.startTime })),
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { weddingId, question, conversationHistory } = await req.json();
    if (!weddingId || !question) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const summary = await getSummary(weddingId);
    if (!summary) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

    const learned = await prisma.aiMessage.findMany({
      where: { weddingId, role: "learned", successful: true },
      orderBy: { createdAt: "desc" },
    });

    const response = await askGemini(question, summary, learned, conversationHistory || []);
    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Gemini API route error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
