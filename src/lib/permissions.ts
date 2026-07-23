import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type WeddingRole = "owner" | "co-owner" | "editor" | "viewer" | null;

export async function getUserRole(weddingId: string): Promise<WeddingRole> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
    select: { id: true },
  });
  if (wedding) return "owner";

  const collab = await prisma.weddingCollaborator.findFirst({
    where: { weddingId, userId: session.user.id, status: "accepted" },
    select: { role: true },
  });
  return collab ? (collab.role as WeddingRole) : null;
}

export async function requireWeddingAccess(weddingId: string, allowViewer = false): Promise<{ userId: string; role: WeddingRole }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const role = await getUserRole(weddingId);
  if (!role) throw new Error("Wedding not found");
  if (!allowViewer && role === "viewer") throw new Error("Unauthorized");

  return { userId: session.user.id, role };
}

export function canEdit(role: WeddingRole): boolean {
  return role === "owner" || role === "co-owner" || role === "editor";
}

export function canEditBudget(role: WeddingRole): boolean {
  return role === "owner" || role === "co-owner";
}

export function canManageCollaborators(role: WeddingRole): boolean {
  return role === "owner" || role === "co-owner";
}

export function canDeleteWedding(role: WeddingRole): boolean {
  return role === "owner";
}
