import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "test@gmail.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { console.error("User not found"); return; }

  const wedding = await prisma.wedding.findFirst({ where: { userId: user.id } });
  if (!wedding) { console.error("Wedding not found"); return; }

  console.log("Seeding new features for:", wedding.name);

  // ═══════════════════════════════════════════════
  // SANGEET CHOREOGRAPHY PLANNER
  // ═══════════════════════════════════════════════

  const songs = await prisma.sangeetSong.createMany({
    data: [
      { weddingId: wedding.id, title: "London Thumakda", artist: "Labh Janjua", duration: 275, type: "Group", event: "Sangeet", notes: "Classic group dance number", order: 0 },
      { weddingId: wedding.id, title: "Nagada Sang Dhol", artist: "Shreya Ghoshal", duration: 302, type: "Solo", event: "Sangeet", notes: "Ananya's solo performance", order: 1 },
      { weddingId: wedding.id, title: "Mere Brother Ki Dulhan", artist: "Pritam", duration: 268, type: "Duet", event: "Sangeet", notes: "Arjun & his cousins", order: 2 },
      { weddingId: wedding.id, title: "Kar Gayi Chull", artist: "Badshah", duration: 210, type: "Group", event: "Sangeet", notes: "High energy group number", order: 3 },
      { weddingId: wedding.id, title: "Tukde Tukde", artist: "Vishal-Shekhar", duration: 245, type: "Group", event: "Sangeet", notes: "Friends dance", order: 4 },
      { weddingId: wedding.id, title: "Dil Dhadakne Do", artist: "Shankar-Ehsaan-Loy", duration: 290, type: "Duet", event: "Sangeet", notes: "Couple dance - Ananya & Arjun", order: 5 },
      { weddingId: wedding.id, title: "Badtameez Dil", artist: "Benny Dayal", duration: 232, type: "Solo", event: "Sangeet", notes: "Arjun's solo", order: 6 },
      { weddingId: wedding.id, title: "Mauja Hi Mauja", artist: "Pritam", duration: 260, type: "Group", event: "Sangeet", notes: "Finale group dance", order: 7 },
    ],
  });
  console.log("Created", songs.count, "songs");

  // Get all songs to add performances
  const allSongs = await prisma.sangeetSong.findMany({ where: { weddingId: wedding.id }, orderBy: { order: "asc" } });

  // Add performers
  const performers = [
    { songId: allSongs[0].id, personName: "Ananya", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[0].id, personName: "Priya", role: "Performer", confirmed: true, order: 1 },
    { songId: allSongs[0].id, personName: "Meera", role: "Performer", confirmed: false, order: 2 },
    { songId: allSongs[1].id, personName: "Ananya", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[2].id, personName: "Arjun", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[2].id, personName: "Rohit", role: "Performer", confirmed: true, order: 1 },
    { songId: allSongs[2].id, personName: "Vikram", role: "Performer", confirmed: false, order: 2 },
    { songId: allSongs[3].id, personName: "Priya", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[3].id, personName: "Nisha", role: "Performer", confirmed: true, order: 1 },
    { songId: allSongs[3].id, personName: "Sonia", role: "Performer", confirmed: false, order: 2 },
    { songId: allSongs[4].id, personName: "Rohit", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[4].id, personName: "Vikram", role: "Performer", confirmed: false, order: 1 },
    { songId: allSongs[4].id, personName: "Amit", role: "Performer", confirmed: false, order: 2 },
    { songId: allSongs[5].id, personName: "Ananya", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[5].id, personName: "Arjun", role: "Performer", confirmed: true, order: 1 },
    { songId: allSongs[6].id, personName: "Arjun", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[7].id, personName: "Ananya", role: "Performer", confirmed: true, order: 0 },
    { songId: allSongs[7].id, personName: "Arjun", role: "Performer", confirmed: true, order: 1 },
    { songId: allSongs[7].id, personName: "Priya", role: "Performer", confirmed: true, order: 2 },
    { songId: allSongs[7].id, personName: "Rohit", role: "Performer", confirmed: true, order: 3 },
  ];
  await prisma.sangeetPerformance.createMany({ data: performers });
  console.log("Created", performers.length, "performances");

  // Add practice sessions
  await prisma.sangeetPractice.createMany({
    data: [
      { weddingId: wedding.id, date: "2026-11-15", time: "18:00", location: "Ananya's house", notes: "First practice - bring water bottles", attendees: JSON.stringify(["Ananya", "Priya", "Meera"]), completed: false, order: 0 },
      { weddingId: wedding.id, date: "2026-11-18", time: "19:00", location: "Community Hall, Nashik", notes: "Full run-through with music", attendees: JSON.stringify(["Ananya", "Arjun", "Priya", "Rohit", "Vikram"]), completed: false, order: 1 },
      { weddingId: wedding.id, date: "2026-11-21", time: "17:00", location: "Ananya's house", notes: "Final practice - costumes recommended", attendees: JSON.stringify(["Ananya", "Arjun", "Priya", "Rohit", "Vikram", "Meera", "Nisha"]), completed: false, order: 2 },
    ],
  });
  console.log("Created 3 practice sessions");

  // ═══════════════════════════════════════════════
  // MULTI-DAY COLOR COORDINATOR
  // ═══════════════════════════════════════════════

  await prisma.eventColorTheme.createMany({
    data: [
      { weddingId: wedding.id, eventName: "Haldi", primaryColor: "#FFD700", secondaryColor: "#FFA500", accentColor: "#FFF8DC", mood: "Vibrant", notes: "Bright yellows and golds" },
      { weddingId: wedding.id, eventName: "Mehendi", primaryColor: "#228B22", secondaryColor: "#90EE90", accentColor: "#FFD700", mood: "Traditional", notes: "Green and gold theme" },
      { weddingId: wedding.id, eventName: "Sangeet", primaryColor: "#DAA520", secondaryColor: "#FFD700", accentColor: "#8B0000", mood: "Vibrant", notes: "Gold and maroon glamour" },
      { weddingId: wedding.id, eventName: "Wedding Ceremony", primaryColor: "#DC143C", secondaryColor: "#FF6347", accentColor: "#FFD700", mood: "Traditional", notes: "Classic red and gold" },
      { weddingId: wedding.id, eventName: "Reception", primaryColor: "#4B0082", secondaryColor: "#9370DB", accentColor: "#C0C0C0", mood: "Elegant", notes: "Royal purple and silver" },
    ],
  });
  console.log("Created 5 color themes");

  await prisma.outfitColor.createMany({
    data: [
      { weddingId: wedding.id, eventName: "Haldi", person: "Ananya", outfitDesc: "Yellow lehenga with mirror work", primaryColor: "#FFD700", secondaryColor: "#FFFFFF", accentColor: "#FFA500", matchScore: 95, notes: "Perfect match with theme", order: 0 },
      { weddingId: wedding.id, eventName: "Haldi", person: "Arjun", outfitDesc: "Yellow kurta with white pajama", primaryColor: "#FFD700", secondaryColor: "#FFFFFF", accentColor: "", matchScore: 90, notes: "", order: 1 },
      { weddingId: wedding.id, eventName: "Mehendi", person: "Ananya", outfitDesc: "Green Anarkali suit", primaryColor: "#228B22", secondaryColor: "#FFD700", accentColor: "#90EE90", matchScore: 92, notes: "With gold jewelry", order: 2 },
      { weddingId: wedding.id, eventName: "Sangeet", person: "Ananya", outfitDesc: "Maroon and gold lehenga", primaryColor: "#8B0000", secondaryColor: "#FFD700", accentColor: "#DC143C", matchScore: 88, notes: "Heavy embroidery", order: 3 },
      { weddingId: wedding.id, eventName: "Sangeet", person: "Arjun", outfitDesc: "Gold brocade sherwani", primaryColor: "#DAA520", secondaryColor: "#8B0000", accentColor: "#FFD700", matchScore: 85, notes: "", order: 4 },
      { weddingId: wedding.id, eventName: "Wedding Ceremony", person: "Ananya", outfitDesc: "Red Banarasi lehenga with gold zari", primaryColor: "#DC143C", secondaryColor: "#FFD700", accentColor: "#8B0000", matchScore: 98, notes: "Heirloom piece from grandmother", order: 5 },
      { weddingId: wedding.id, eventName: "Wedding Ceremony", person: "Arjun", outfitDesc: "Red and gold sherwani", primaryColor: "#DC143C", secondaryColor: "#FFD700", accentColor: "#8B0000", matchScore: 96, notes: "Matching with Ananya", order: 6 },
      { weddingId: wedding.id, eventName: "Reception", person: "Ananya", outfitDesc: "Purple silk saree with silver blouse", primaryColor: "#4B0082", secondaryColor: "#C0C0C0", accentColor: "#9370DB", matchScore: 94, notes: "Elegant and modern", order: 7 },
      { weddingId: wedding.id, eventName: "Reception", person: "Arjun", outfitDesc: "Midnight blue suit with silver pocket square", primaryColor: "#191970", secondaryColor: "#C0C0C0", accentColor: "#4B0082", matchScore: 91, notes: "", order: 8 },
    ],
  });
  console.log("Created 9 outfit colors");

  // ═══════════════════════════════════════════════
  // FAMILY POLITICS MAPPER
  // ═══════════════════════════════════════════════

  const familyMembers = await prisma.familyMember.createMany({
    data: [
      // Bride's side
      { weddingId: wedding.id, name: "Sunita Sharma", side: "Bride", relation: "Mother", age: 52, sideDetail: "Paternal", notes: "Very involved in planning", order: 0 },
      { weddingId: wedding.id, name: "Rajesh Sharma", side: "Bride", relation: "Father", age: 55, sideDetail: "Paternal", notes: "Quiet but supportive", order: 1 },
      { weddingId: wedding.id, name: "Priya Sharma", side: "Bride", relation: "Sister", age: 26, sideDetail: "Sibling", notes: "Maid of honor", order: 2 },
      { weddingId: wedding.id, name: "Kavita Mehta", side: "Bride", relation: "Aunt", age: 50, sideDetail: "Maternal", notes: "Very opinionated about decorations", order: 3 },
      { weddingId: wedding.id, name: "Sunil Mehta", side: "Bride", relation: "Uncle", age: 54, sideDetail: "Maternal", notes: "Will give a long speech", order: 4 },
      { weddingId: wedding.id, name: "Neha Sharma", side: "Bride", relation: "Cousin", age: 24, sideDetail: "Paternal", notes: "DJ coordinator", order: 5 },
      { weddingId: wedding.id, name: "Grandma Sharma", side: "Bride", relation: "Grandmother", age: 78, sideDetail: "Paternal", notes: "Needs wheelchair access", order: 6 },

      // Groom's side
      { weddingId: wedding.id, name: "Anita Kapoor", side: "Groom", relation: "Mother", age: 50, sideDetail: "Paternal", notes: "Very sweet, loves Ananya", order: 7 },
      { weddingId: wedding.id, name: "Sanjay Kapoor", side: "Groom", relation: "Father", age: 53, sideDetail: "Paternal", notes: "Businessman, generous", order: 8 },
      { weddingId: wedding.id, name: "Rohit Kapoor", side: "Groom", relation: "Brother", age: 28, sideDetail: "Sibling", notes: "Best man", order: 9 },
      { weddingId: wedding.id, name: "Pooja Kapoor", side: "Groom", relation: "Aunt", age: 48, sideDetail: "Maternal", notes: "Sangeet coordinator", order: 10 },
      { weddingId: wedding.id, name: "Vikram Kapoor", side: "Groom", relation: "Cousin", age: 27, sideDetail: "Paternal", notes: "Arjun's childhood friend", order: 11 },
      { weddingId: wedding.id, name: "Grandma Kapoor", side: "Groom", relation: "Grandmother", age: 80, sideDetail: "Paternal", notes: "Very traditional", order: 12 },
    ],
  });
  console.log("Created", familyMembers.count, "family members");

  // Get all members to create relationships
  const allMembers = await prisma.familyMember.findMany({ where: { weddingId: wedding.id }, orderBy: { order: "asc" } });

  const sunita = allMembers.find(m => m.name === "Sunita Sharma")!;
  const rajesh = allMembers.find(m => m.name === "Rajesh Sharma")!;
  const priya = allMembers.find(m => m.name === "Priya Sharma")!;
  const kavita = allMembers.find(m => m.name === "Kavita Mehta")!;
  const sunil = allMembers.find(m => m.name === "Sunil Mehta")!;
  const neha = allMembers.find(m => m.name === "Neha Sharma")!;
  const grandmaS = allMembers.find(m => m.name === "Grandma Sharma")!;
  const anita = allMembers.find(m => m.name === "Anita Kapoor")!;
  const sanjay = allMembers.find(m => m.name === "Sanjay Kapoor")!;
  const rohit = allMembers.find(m => m.name === "Rohit Kapoor")!;
  const pooja = allMembers.find(m => m.name === "Pooja Kapoor")!;
  const vikram = allMembers.find(m => m.name === "Vikram Kapoor")!;
  const grandmaK = allMembers.find(m => m.name === "Grandma Kapoor")!;

  const relationships = await prisma.familyRelationship.createMany({
    data: [
      // Bride's family internal
      { weddingId: wedding.id, memberIdA: sunita.id, memberIdB: rajesh.id, status: "Good", notes: "Happily married 28 years", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: sunita.id, memberIdB: priya.id, status: "Good", notes: "Very close mother-daughter", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: sunita.id, memberIdB: kavita.id, status: "Strained", notes: "Kavita is very critical of Sunita's planning choices", conflictLevel: 2 },
      { weddingId: wedding.id, memberIdA: kavita.id, memberIdB: sunil.id, status: "Good", notes: "Married couple", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: rajesh.id, memberIdB: neha.id, status: "Good", notes: "Uncle-niece bond", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: sunita.id, memberIdB: grandmaS.id, status: "Strained", notes: "Generational disagreements on traditions", conflictLevel: 1 },

      // Groom's family internal
      { weddingId: wedding.id, memberIdA: anita.id, memberIdB: sanjay.id, status: "Good", notes: "Strong marriage", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: anita.id, memberIdB: rohit.id, status: "Good", notes: "Very close", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: sanjay.id, memberIdB: vikram.id, status: "Good", notes: "Vikram is like a second son", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: pooja.id, memberIdB: anita.id, status: "Feuding", notes: "Pooja thinks she should have more say in wedding planning", conflictLevel: 3 },
      { weddingId: wedding.id, memberIdA: anita.id, memberIdB: grandmaK.id, status: "Strained", notes: "Traditional vs modern disagreements", conflictLevel: 1 },

      // Cross-family
      { weddingId: wedding.id, memberIdA: sunita.id, memberIdB: anita.id, status: "Good", notes: "Mothers bonded immediately", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: kavita.id, memberIdB: pooja.id, status: "Strained", notes: "Both want to control decorations", conflictLevel: 2 },
      { weddingId: wedding.id, memberIdA: rohit.id, memberIdB: priya.id, status: "Good", notes: "Getting along well", conflictLevel: 0 },
      { weddingId: wedding.id, memberIdA: vikram.id, memberIdB: neha.id, status: "Good", notes: "Flirting at family gatherings", conflictLevel: 0 },
    ],
  });
  console.log("Created", relationships.count, "relationships");

  // Add seating conflicts
  const conflicts = await prisma.seatingConflict.createMany({
    data: [
      { weddingId: wedding.id, guestName: "Kavita Mehta", conflictWith: "Pooja Kapoor", severity: "High", reason: "Both want to sit at the head table and control the decor", notes: "Keep them at separate tables", resolved: false },
      { weddingId: wedding.id, guestName: "Grandma Sharma", conflictWith: "Grandma Kapoor", severity: "Low", reason: "Language barrier - they don't speak the same language", notes: "Seat with translators nearby", resolved: false },
      { weddingId: wedding.id, guestName: "Sunil Mehta", conflictWith: "Sanjay Kapoor", severity: "Medium", reason: "Old business rivalry from 10 years ago", notes: "May have moved past it, but monitor", resolved: true },
    ],
  });
  console.log("Created", conflicts.count, "seating conflicts");

  console.log("\n✅ All new feature data seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
