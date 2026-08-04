import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "manan.n.chandak@gmail.com";

  // 1. Find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Manan Chandak",
        email,
        emailVerified: new Date(),
      },
    });
    console.log("Created user:", user.id);
  } else {
    console.log("Found existing user:", user.id);
  }

  // Delete any existing weddings for this user to start fresh
  const existingWeddings = await prisma.wedding.findMany({ where: { userId: user.id } });
  for (const w of existingWeddings) {
    await prisma.wedding.delete({ where: { id: w.id } });
  }
  console.log("Cleared existing weddings");

  // 2. Create the wedding
  const weddingDate = new Date("2026-11-24T18:00:00.000Z");
  const rsvpToken = crypto.randomBytes(16).toString("base64url");

  const wedding = await prisma.wedding.create({
    data: {
      userId: user.id,
      name: "Ananya & Arjun",
      religion: "Hindu",
      region: "North Indian",
      country: "india",
      currency: "INR",
      dietaryDefault: "mixed",
      weddingDate,
      weddingCity: "Nashik",
      selectedEvents: JSON.stringify([
        "Haldi", "Mehendi", "Sangeet", "Wedding Ceremony", "Reception"
      ]),
      budget: 2500000,
      guestCount: 250,
      weddingDays: 2,
      rsvpToken,
      websiteSlug: "ananya-arjun",
      websiteConfig: JSON.stringify({
        template: "royal",
        tagline: "Together Forever",
        photo: "https://images.unsplash.com/photo-1604431696983-3d5b6c4d7565?w=1200",
        theme: {
          primary: "#722F37",
          accent: "#D4AF37",
          background: "#FDF6EC",
          text: "#333333",
        },
        story: {
          quote: "Two hearts, one soul, forever intertwined.",
          howWeMet: "We first met at a mutual friend's Diwali party in Mumbai. Arjun spilled chai on Ananya's saree, and spent the rest of the evening making up for it. Three years later, he proposed at the same venue.",
          proposal: "Arjun planned a surprise proposal at the Gateway of India at sunset, with fireworks and their favorite song playing. Ananya said yes before he could finish the question.",
        },
        events: [
          { name: "Haldi Ceremony", date: "November 23, 2026", time: "10:00 AM", location: "Chandak Family Residence" },
          { name: "Mehendi Night", date: "November 23, 2026", time: "4:00 PM", location: "Lakeside Lawn" },
          { name: "Sangeet", date: "November 23, 2026", time: "8:00 PM", location: "Grand Ballroom" },
          { name: "Wedding Ceremony", date: "November 24, 2026", time: "7:00 PM", location: "Temple Gardens" },
          { name: "Reception", date: "November 24, 2026", time: "9:00 PM", location: "Grand Ballroom" },
        ],
        travel: {
          venueName: "Grand Palace Resort",
          venueAddress: "Gangapur Road, Nashik, Maharashtra 422219",
          mapsUrl: "https://maps.google.com",
          hotels: [
            { name: "Grand Palace Resort", price: "Rs. 8,000/night", groupCode: "CHANDAK2026", link: "#" },
            { name: "Hotel Taj Nashik", price: "Rs. 6,500/night", groupCode: "WEDDING26", link: "#" },
          ],
          tips: "Nashik is a 3-hour drive from Mumbai. Airport transfers will be provided. Dress code for all events will be shared soon.",
        },
        registry: [
          { name: "Amazon Wishlist", url: "#" },
          { name: "Crate & Barrel", url: "#" },
        ],
        faq: [
          { q: "Is there a dress code?", a: "Yes! Traditional Indian attire for ceremonies. Western formal for the reception." },
          { q: "Are children welcome?", a: "Absolutely! We have a kids' corner at the reception." },
          { q: "How do I get to Nashik?", a: "Fly into Mumbai (BOM) and take a 3-hour drive, or fly directly to Nashik (ISK)." },
        ],
      }),
    },
  });
  console.log("Created wedding:", wedding.id);

  // 3. Seed events
  const events = [
    { name: "Haldi Ceremony", description: "Traditional turmeric ceremony for the bride", date: "2026-11-23", startTime: "10:00", duration: 120, location: "Chandak Family Residence", isRitual: true, order: 0 },
    { name: "Mehendi Night", description: "Henna application night with music and dance", date: "2026-11-23", startTime: "16:00", duration: 180, location: "Lakeside Lawn", isRitual: false, order: 1 },
    { name: "Sangeet", description: "Night of music, dance, and performances", date: "2026-11-23", startTime: "20:00", duration: 240, location: "Grand Ballroom", isRitual: false, order: 2 },
    { name: "Wedding Ceremony", description: "Sacred Hindu wedding ceremony with pheras", date: "2026-11-24", startTime: "19:00", duration: 120, location: "Temple Gardens", isRitual: true, order: 3 },
    { name: "Reception", description: "Grand reception dinner and celebrations", date: "2026-11-24", startTime: "21:00", duration: 240, location: "Grand Ballroom", isRitual: false, order: 4 },
  ];
  await prisma.weddingEvent.createMany({ data: events.map(e => ({ ...e, weddingId: wedding.id })) });
  console.log("Created events");

  // 4. Guests - Paternal side
  const paternalGuests = [
    { name: "Rajesh Chandak", relation: "Father", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Father of the groom" },
    { name: "Sunita Chandak", relation: "Mother", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Mother of the groom" },
    { name: "Priya Chandak", relation: "Sister", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Vikram Chandak", relation: "Uncle", side: "Paternal", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "" },
    { name: "Meena Chandak", relation: "Aunt", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Amit Chandak", relation: "Cousin", side: "Paternal", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "Brings wife" },
    { name: "Neha Sharma", relation: "Cousin", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Deepak Chandak", relation: "Uncle", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Kavita Chandak", relation: "Aunt", side: "Paternal", rsvp: "Pending", dietary: "Veg", accommodation: "--", notes: "" },
    { name: "Ravi Chandak", relation: "Grandfather", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Needs wheelchair access" },
    { name: "Ashadevi Chandak", relation: "Grandmother", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Sanjay Chandak", relation: "Cousin", side: "Paternal", rsvp: "No", dietary: "Non-Veg", accommodation: "--", notes: "Out of country" },
  ];

  // Maternal side
  const maternalGuests = [
    { name: "Suresh Deshmukh", relation: "Father", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Father of the bride" },
    { name: "Ashwini Deshmukh", relation: "Mother", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Mother of the bride" },
    { name: "Kavya Deshmukh", relation: "Sister", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Mohan Deshmukh", relation: "Uncle", side: "Maternal", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "" },
    { name: "Lata Deshmukh", relation: "Aunt", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Rahul Deshmukh", relation: "Cousin", side: "Maternal", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "" },
    { name: "Pooja Deshmukh", relation: "Cousin", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Anil Deshmukh", relation: "Uncle", side: "Maternal", rsvp: "Pending", dietary: "Veg", accommodation: "--", notes: "" },
    { name: "Suman Deshmukh", relation: "Aunt", side: "Maternal", rsvp: "Yes", dietary: "Jain", accommodation: "Booked", notes: "Jain dietary requirements" },
    { name: "Prakash Deshmukh", relation: "Grandfather", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Usha Deshmukh", relation: "Grandmother", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
  ];

  // Friends
  const friendGuests = [
    { name: "Rohan Patel", relation: "Friend", side: "Groom", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "College friend" },
    { name: "Aditya Mehta", relation: "Friend", side: "Groom", rsvp: "Yes", dietary: "Non-Veg", accommodation: "Booked", notes: "" },
    { name: "Vishal Gupta", relation: "Friend", side: "Groom", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Sneha Mehra", relation: "Friend", side: "Bride", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Best friend" },
    { name: "Tanvi Kulkarni", relation: "Friend", side: "Bride", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "" },
    { name: "Nisha Jain", relation: "Friend", side: "Bride", rsvp: "Yes", dietary: "Jain", accommodation: "Booked", notes: "" },
    { name: "Karan Malhotra", relation: "Friend", side: "Groom", rsvp: "Pending", dietary: "Non-Veg", accommodation: "--", notes: "" },
    { name: "Pallavi Singh", relation: "Friend", side: "Bride", rsvp: "No", dietary: "Veg", accommodation: "--", notes: "Out of country" },
  ];

  // Colleagues
  const colleagueGuests = [
    { name: "Arun Kumar", relation: "Colleague", side: "Groom", rsvp: "Yes", dietary: "Veg", accommodation: "--", notes: "Work colleague" },
    { name: "Divya Raman", relation: "Colleague", side: "Bride", rsvp: "Yes", dietary: "Veg", accommodation: "--", notes: "" },
    { name: "Suresh Iyer", relation: "Colleague", side: "Groom", rsvp: "Pending", dietary: "Non-Veg", accommodation: "--", notes: "" },
    { name: "Anjali Bhatt", relation: "Colleague", side: "Bride", rsvp: "Yes", dietary: "Veg", accommodation: "--", notes: "" },
  ];

  // Children
  const childGuests = [
    { name: "Aarav Chandak", relation: "Child", side: "Paternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Age 8" },
    { name: "Diya Deshmukh", relation: "Child", side: "Maternal", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Age 5" },
    { name: "Arjun Patel Jr.", relation: "Child", side: "Groom", rsvp: "Yes", dietary: "Veg", accommodation: "Booked", notes: "Age 10" },
  ];

  const allGuests = [...paternalGuests, ...maternalGuests, ...friendGuests, ...colleagueGuests, ...childGuests];
  let order = 0;
  for (const g of allGuests) {
    await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        name: g.name,
        relation: g.relation,
        side: g.side,
        rsvp: g.rsvp,
        dietary: g.dietary,
        accommodation: g.accommodation,
        giftGiven: g.rsvp === "Yes" ? (Math.random() > 0.5 ? "Yes" : "No") : "No",
        thankYou: "No",
        tableNum: 0,
        notes: g.notes,
      },
    });
  }
  console.log(`Created ${allGuests.length} guests`);

  // 5. Vendors
  const vendors = [
    { category: "Venue", name: "Grand Palace Resort", contact: "+91 98765 43210", quote: 800000, paid: 400000, rating: "★★★★★", contract: "Signed", notes: "Main venue for ceremony and reception" },
    { category: "Photography", name: "Pixel Perfect Studios", contact: "+91 98765 43211", quote: 150000, paid: 75000, rating: "★★★★★", contract: "Signed", notes: "2 photographers + videographer" },
    { category: "Catering", name: "Royal Kitchen Caterers", contact: "+91 98765 43212", quote: 500000, paid: 250000, rating: "★★★★☆", contract: "Signed", notes: "Veg + Non-Veg, 250 guests" },
    { category: "Decorator", name: "Sakshi Florals", contact: "+91 98765 43213", quote: 200000, paid: 100000, rating: "★★★★☆", contract: "Signed", notes: "All events decoration" },
    { category: "Makeup", name: "Glamour Touch by Pooja", contact: "+91 98765 43214", quote: 50000, paid: 25000, rating: "★★★★★", contract: "Signed", notes: "Bride makeup for all events" },
    { category: "Music/DJ", name: "Beatbox DJs", contact: "+91 98765 43215", quote: 80000, paid: 40000, rating: "★★★★☆", contract: "Signed", notes: "Sangeet + Reception" },
    { category: "Clothing", name: "Manyavar", contact: "+91 98765 43216", quote: 300000, paid: 150000, rating: "★★★★★", contract: "Signed", notes: "Sherwani + Lehenga" },
    { category: "Transport", name: "Sharma Travels", contact: "+91 98765 43217", quote: 60000, paid: 30000, rating: "★★★★☆", contract: "Signed", notes: "Guest pickup + baraat vehicles" },
    { category: "Invitation", name: "Card Mantra", contact: "+91 98765 43218", quote: 25000, paid: 25000, rating: "★★★★★", contract: "Signed", notes: "Digital + printed invites" },
    { category: "Mehendi", name: "Heena by Fatima", contact: "+91 98765 43219", quote: 15000, paid: 7500, rating: "★★★★☆", contract: "Signed", notes: "Bride + family mehendi" },
  ];
  order = 0;
  for (const v of vendors) {
    await prisma.vendor.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        category: v.category,
        name: v.name,
        contact: v.contact,
        quote: v.quote,
        paid: v.paid,
        balance: v.quote - v.paid,
        rating: v.rating,
        contract: v.contract,
        notes: v.notes,
      },
    });
  }
  console.log(`Created ${vendors.length} vendors`);

  // 6. Budget Items
  const budgetItems = [
    { category: "Venue", item: "Grand Palace Resort - 2 days", estimated: 800000, actual: 800000, paid: 400000, notes: "Includes rooms for family" },
    { category: "Catering", item: "Wedding dinner - 250 guests", estimated: 500000, actual: 520000, paid: 250000, notes: "Veg + Non-Veg buffet" },
    { category: "Catering", item: "Sangeet snacks & drinks", estimated: 100000, actual: 95000, paid: 95000, notes: "" },
    { category: "Photography", item: "Photo + Video package", estimated: 150000, actual: 150000, paid: 75000, notes: "2 photographers, 1 videographer" },
    { category: "Decorator", item: "Mandap decoration", estimated: 120000, actual: 130000, paid: 100000, notes: "Flowers + drapes" },
    { category: "Decorator", item: "Reception hall decoration", estimated: 80000, actual: 85000, paid: 0, notes: "Stage + centerpieces" },
    { category: "Clothing", item: "Bride Lehenga", estimated: 180000, actual: 200000, paid: 150000, notes: "Manish Malhotra" },
    { category: "Clothing", item: "Groom Sherwani", estimated: 120000, actual: 110000, paid: 0, notes: "Manyavar" },
    { category: "Makeup", item: "Bride makeup - all events", estimated: 50000, actual: 50000, paid: 25000, notes: "3 events" },
    { category: "Music/DJ", item: "DJ + Sound system", estimated: 80000, actual: 80000, paid: 40000, notes: "Sangeet + Reception" },
    { category: "Transport", item: "Guest transportation", estimated: 60000, actual: 55000, paid: 30000, notes: "Airport pickups" },
    { category: "Transport", item: "Baraat vehicles", estimated: 40000, actual: 40000, paid: 40000, notes: "Decorated cars + horses" },
    { category: "Invitation", item: "Digital invites", estimated: 10000, actual: 8000, paid: 8000, notes: "Video invite" },
    { category: "Invitation", item: "Printed cards - 300", estimated: 25000, actual: 25000, paid: 25000, notes: "Premium cards" },
    { category: "Mehendi", item: "Bride mehendi", estimated: 15000, actual: 15000, paid: 7500, notes: "" },
    { category: "Miscellaneous", item: "Return gifts", estimated: 50000, actual: 45000, paid: 45000, notes: "For all guests" },
    { category: "Miscellaneous", item: "Puja items", estimated: 20000, actual: 18000, paid: 18000, notes: "" },
  ];
  order = 0;
  for (const b of budgetItems) {
    await prisma.budgetItem.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        category: b.category,
        item: b.item,
        estimated: b.estimated,
        actual: b.actual,
        paid: b.paid,
        balance: b.estimated - b.paid,
        status: b.paid >= b.estimated ? "Paid" : b.paid > 0 ? "Partial" : "Pending",
        notes: b.notes,
      },
    });
  }
  console.log(`Created ${budgetItems.length} budget items`);

  // 7. Tasks
  const tasks = [
    { period: "12+ months", text: "Book venue", done: true, order: 0, priority: "High", category: "Venue" },
    { period: "12+ months", text: "Set budget", done: true, order: 1, priority: "High", category: "Budget" },
    { period: "12+ months", text: "Create guest list", done: true, order: 2, priority: "High", category: "Guests" },
    { period: "9-12 months", text: "Book photographer", done: true, order: 3, priority: "High", category: "Photography" },
    { period: "9-12 months", text: "Book caterer", done: true, order: 4, priority: "High", category: "Catering" },
    { period: "9-12 months", text: "Shop for outfits", done: true, order: 5, priority: "Medium", category: "Clothing" },
    { period: "6-9 months", text: "Book decorator", done: true, order: 6, priority: "High", category: "Decoration" },
    { period: "6-9 months", text: "Book DJ/music", done: true, order: 7, priority: "Medium", category: "Entertainment" },
    { period: "6-9 months", text: "Send save the dates", done: true, order: 8, priority: "Medium", category: "Invitations" },
    { period: "3-6 months", text: "Book makeup artist", done: true, order: 9, priority: "High", category: "Beauty" },
    { period: "3-6 months", text: "Plan mehendi designs", done: true, order: 10, priority: "Medium", category: "Events" },
    { period: "3-6 months", text: "Book transport", done: true, order: 11, priority: "Medium", category: "Transport" },
    { period: "1-3 months", text: "Send formal invitations", done: true, order: 12, priority: "High", category: "Invitations" },
    { period: "1-3 months", text: "Finalize guest count", done: false, order: 13, priority: "High", category: "Guests" },
    { period: "1-3 months", text: "Book hotel rooms for guests", done: false, order: 14, priority: "High", category: "Accommodation" },
    { period: "1-3 months", text: "Plan sangeet performances", done: false, order: 15, priority: "Medium", category: "Entertainment" },
    { period: "Last month", text: "Final venue walkthrough", done: false, order: 16, priority: "High", category: "Venue" },
    { period: "Last month", text: "Confirm all vendors", done: false, order: 17, priority: "High", category: "Vendors" },
    { period: "Last month", text: "Finalize seating chart", done: false, order: 18, priority: "Medium", category: "Seating" },
    { period: "Last month", text: "Prepare emergency kit", done: false, order: 19, priority: "Low", category: "Preparation" },
    { period: "Last month", text: "Breakdown dress rehearsal", done: false, order: 20, priority: "Medium", category: "Events" },
  ];
  await prisma.task.createMany({
    data: tasks.map(t => ({
      weddingId: wedding.id,
      period: t.period,
      text: t.text,
      done: t.done,
      order: t.order,
      priority: t.priority,
      category: t.category,
    })),
  });
  console.log(`Created ${tasks.length} tasks`);

  // 8. Gifts
  const gifts = [
    { fromName: "Sharma Family", fromSide: "Paternal", amount: 51000, giftType: "Cash", received: "Yes", thankYou: "Yes", notes: "Wedding gift" },
    { fromName: "Mehta Family", fromSide: "Maternal", amount: 21000, giftType: "Cash", received: "Yes", thankYou: "No", notes: "" },
    { fromName: "Rohan Patel", fromSide: "Groom", amount: 11000, giftType: "Cash", received: "Yes", thankYou: "No", notes: "College friend" },
    { fromName: "Gupta Ji", fromSide: "Groom", amount: 21000, giftType: "Gold Coin", received: "Yes", thankYou: "No", notes: "5gm gold" },
    { fromName: "Deshmukh Family", fromSide: "Maternal", amount: 100001, giftType: "Cash", received: "Yes", thankYou: "Yes", notes: "Wedding gift from maternal side" },
    { fromName: "Sneha Mehra", fromSide: "Bride", amount: 5000, giftType: "Gift Card", received: "Yes", thankYou: "No", notes: "Amazon gift card" },
    { fromName: "Kumar Family", fromSide: "Paternal", amount: 15000, giftType: "Cash", received: "No", thankYou: "No", notes: "Expected" },
    { fromName: "Iyer Family", fromSide: "Groom", amount: 21000, giftType: "Silver Plate Set", received: "Yes", thankYou: "No", notes: "" },
    { fromName: "Bhatia Family", fromSide: "Paternal", amount: 31000, giftType: "Cash", received: "Yes", thankYou: "Yes", notes: "" },
    { fromName: "Jain Family", fromSide: "Bride", amount: 11001, giftType: "Cash", received: "Yes", thankYou: "No", notes: "Shagun" },
    { fromName: "Anonymous", fromSide: "Both", amount: 5000, giftType: "Envelope", received: "Yes", thankYou: "No", notes: "No name on envelope" },
    { fromName: "Malhotra Uncle", fromSide: "Groom", amount: 21000, giftType: "Cash", received: "No", thankYou: "No", notes: "Expected at reception" },
  ];
  order = 0;
  for (const g of gifts) {
    await prisma.gift.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        fromName: g.fromName,
        fromSide: g.fromSide,
        amount: g.amount,
        giftType: g.giftType,
        received: g.received,
        thankYou: g.thankYou,
        notes: g.notes,
      },
    });
  }
  console.log(`Created ${gifts.length} gifts`);

  // 9. Hashtags
  const hashtags = [
    { text: "#AnanyaArjunWedding", style: "Romantic", favorite: true },
    { text: "#AnanyaKaArjun", style: "Romantic", favorite: true },
    { text: "#HappilyEverChandak", style: "Pun", favorite: false },
    { text: "#DeshmukhKiBeti", style: "Traditional", favorite: false },
    { text: "#ShaadiKaSeason", style: "Modern", favorite: true },
    { text: "#NashikKiShaadi", style: "Location", favorite: false },
    { text: "#WinterWedding2026", style: "Seasonal", favorite: false },
    { text: "#ArjunWedsAnanya", style: "Romantic", favorite: true },
    { text: "#ChandakDeshmukhWedding", style: "Traditional", favorite: false },
    { text: "#SangeetNightVibes", style: "Modern", favorite: false },
    { text: "#HaldiKaRang", style: "Traditional", favorite: false },
    { text: "#PherasAndPromises", style: "Romantic", favorite: true },
  ];
  order = 0;
  for (const h of hashtags) {
    await prisma.hashtag.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        text: h.text,
        style: h.style,
        favorite: h.favorite,
      },
    });
  }
  console.log(`Created ${hashtags.length} hashtags`);

  // 10. Outfits
  const outfits = [
    { event: "Haldi", person: "Bride", description: "Yellow floral lehenga", designer: "Sabyasachi", status: "Ready", cost: 25000, jewelryPairing: "Floral jewelry set", notes: "" },
    { event: "Mehendi", person: "Bride", description: "Green anarkali suit", designer: "Anita Dongre", status: "Ready", cost: 35000, jewelryPairing: "Kundan set", notes: "" },
    { event: "Sangeet", person: "Bride", description: "Pink sequin lehenga", designer: "Manish Malhotra", status: "Ready", cost: 80000, jewelryPairing: "Diamond earrings", notes: "" },
    { event: "Wedding", person: "Bride", description: "Red Banarasi lehenga", designer: "Sabyasachi", status: "Ready", cost: 200000, jewelryPairing: "Complete bridal set", notes: "Main wedding outfit" },
    { event: "Reception", person: "Bride", description: "Gold cocktail gown", designer: "Falguni Shane Peacock", status: "Shopping", cost: 60000, jewelryPairing: "Statement necklace", notes: "" },
    { event: "Haldi", person: "Groom", description: "Yellow kurta pajama", designer: "Manyavar", status: "Ready", cost: 8000, jewelryPairing: "None", notes: "" },
    { event: "Sangeet", person: "Groom", description: "Black bandhgala", designer: "Raghavendra Rathore", status: "Ready", cost: 45000, jewelryPairing: "Watch + cufflinks", notes: "" },
    { event: "Wedding", person: "Groom", description: "Gold sherwani with dupatta", designer: "Manyavar", status: "Ready", cost: 110000, jewelryPairing: "Sehra + kalgi", notes: "Main wedding outfit" },
    { event: "Reception", person: "Groom", description: "Navy blue tuxedo", designer: "Hugo Boss", status: "Shopping", cost: 50000, jewelryPairing: "Watch", notes: "" },
  ];
  order = 0;
  for (const o of outfits) {
    await prisma.outfit.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        event: o.event,
        person: o.person,
        description: o.description,
        designer: o.designer,
        status: o.status,
        cost: o.cost,
        jewelryPairing: o.jewelryPairing,
        notes: o.notes,
      },
    });
  }
  console.log(`Created ${outfits.length} outfits`);

  // 11. Invite Details
  const inviteDetails = [
    { type: "Main Invite", description: "Traditional red & gold wedding card", designer: "Card Mantra", printer: "Printo Press", quantity: 300, cost: 25000, sentDate: "2026-08-15", rsvpDeadline: "2026-10-15", status: "Sent", notes: "Premium card with gold foil" },
    { type: "Digital Invite", description: "Video invite with animation", designer: "Inviter", printer: "Digital", quantity: 500, cost: 8000, sentDate: "2026-08-20", rsvpDeadline: "2026-10-15", status: "Sent", notes: "WhatsApp + Email" },
    { type: "Save the Date", description: "Magnet save the date cards", designer: "Card Mantra", printer: "Printo Press", quantity: 200, cost: 12000, sentDate: "2026-06-01", rsvpDeadline: "", status: "Sent", notes: "" },
    { type: "Thank You Cards", description: "Personalized thank you cards", designer: "Card Mantra", printer: "Printo Press", quantity: 300, cost: 15000, sentDate: "", rsvpDeadline: "", status: "Planning", notes: "To be sent after wedding" },
  ];
  order = 0;
  for (const i of inviteDetails) {
    await prisma.inviteDetail.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        type: i.type,
        description: i.description,
        designer: i.designer,
        printer: i.printer,
        quantity: i.quantity,
        cost: i.cost,
        sentDate: i.sentDate,
        rsvpDeadline: i.rsvpDeadline,
        status: i.status,
        notes: i.notes,
      },
    });
  }
  console.log(`Created ${inviteDetails.length} invite details`);

  // 12. Checklist Items
  const checklistItems = [
    { category: "Venue", text: "Book main venue", done: true, order: 0 },
    { category: "Venue", text: "Finalize venue layout", done: true, order: 1 },
    { category: "Venue", text: "Confirm parking arrangements", done: false, order: 2 },
    { category: "Catering", text: "Finalize menu", done: true, order: 3 },
    { category: "Catering", text: "Confirm dietary requirements", done: false, order: 4 },
    { category: "Catering", text: "Tasting session", done: true, order: 5 },
    { category: "Photography", text: "Book photographer", done: true, order: 6 },
    { category: "Photography", text: "Create shot list", done: false, order: 7 },
    { category: "Photography", text: "Book videographer", done: true, order: 8 },
    { category: "Decoration", text: "Finalize decoration theme", done: true, order: 9 },
    { category: "Decoration", text: "Order flowers", done: false, order: 10 },
    { category: "Decoration", text: "Mandap setup plan", done: true, order: 11 },
    { category: "Clothing", text: "Bride outfit ready", done: true, order: 12 },
    { category: "Clothing", text: "Groom outfit ready", done: true, order: 13 },
    { category: "Clothing", text: "Family outfits", done: false, order: 14 },
    { category: "Invitations", text: "Design invitations", done: true, order: 15 },
    { category: "Invitations", text: "Send invitations", done: true, order: 16 },
    { category: "Invitations", text: "Track RSVPs", done: false, order: 17 },
    { category: "Transport", text: "Book wedding car", done: true, order: 18 },
    { category: "Transport", text: "Guest airport transfers", done: false, order: 19 },
    { category: "Events", text: "Plan sangeet performances", done: false, order: 20 },
    { category: "Events", text: "Book mehendi artist", done: true, order: 21 },
    { category: "Miscellaneous", text: "Return gifts purchased", done: true, order: 22 },
    { category: "Miscellaneous", text: "Emergency kit packed", done: false, order: 23 },
  ];
  await prisma.checklistItem.createMany({
    data: checklistItems.map(c => ({
      weddingId: wedding.id,
      category: c.category,
      text: c.text,
      done: c.done,
      order: c.order,
    })),
  });
  console.log(`Created ${checklistItems.length} checklist items`);

  // 13. Seating Tables
  const tables = [
    { name: "Table 1 - Family", capacity: 10, guests: ["Rajesh Chandak", "Sunita Chandak", "Ravi Chandak", "Ashadevi Chandak", "Suresh Deshmukh", "Ashwini Deshmukh", "Prakash Deshmukh", "Usha Deshmukh", "Vikram Chandak", "Meena Chandak"] },
    { name: "Table 2 - Cousins", capacity: 10, guests: ["Priya Chandak", "Amit Chandak", "Neha Sharma", "Deepak Chandak", "Kavya Deshmukh", "Rahul Deshmukh", "Pooja Deshmukh", "Aarav Chandak", "Diya Deshmukh", "Arjun Patel Jr."] },
    { name: "Table 3 - Friends (Groom)", capacity: 8, guests: ["Rohan Patel", "Aditya Mehta", "Vishal Gupta", "Karan Malhotra", "Arun Kumar", "Suresh Iyer"] },
    { name: "Table 4 - Friends (Bride)", capacity: 8, guests: ["Sneha Mehra", "Tanvi Kulkarni", "Nisha Jain", "Pallavi Singh", "Divya Raman", "Anjali Bhatt"] },
    { name: "Table 5 - Colleagues", capacity: 10, guests: ["Arun Kumar", "Divya Raman", "Suresh Iyer", "Anjali Bhatt"] },
  ];
  order = 0;
  for (const t of tables) {
    await prisma.seatingTable.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        name: t.name,
        capacity: t.capacity,
        guests: JSON.stringify(t.guests),
      },
    });
  }
  console.log(`Created ${tables.length} seating tables`);

  // 14. Room Allocations
  const rooms = [
    { guestName: "Ravi Chandak", hotel: "Grand Palace Resort", roomNumber: "301", roomType: "Suite", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "Wheelchair accessible needed" },
    { guestName: "Ashadevi Chandak", hotel: "Grand Palace Resort", roomNumber: "301", roomType: "Suite", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Prakash Deshmukh", hotel: "Grand Palace Resort", roomNumber: "302", roomType: "Suite", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Usha Deshmukh", hotel: "Grand Palace Resort", roomNumber: "302", roomType: "Suite", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Rajesh Chandak", hotel: "Grand Palace Resort", roomNumber: "305", roomType: "Deluxe", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Suresh Deshmukh", hotel: "Grand Palace Resort", roomNumber: "306", roomType: "Deluxe", checkIn: "2026-11-22", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Rohan Patel", hotel: "Hotel Taj Nashik", roomNumber: "201", roomType: "Standard", checkIn: "2026-11-23", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
    { guestName: "Sneha Mehra", hotel: "Hotel Taj Nashik", roomNumber: "202", roomType: "Standard", checkIn: "2026-11-23", checkOut: "2026-11-25", status: "Confirmed", notes: "" },
  ];
  order = 0;
  for (const r of rooms) {
    await prisma.roomAllocation.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        guestName: r.guestName,
        hotel: r.hotel,
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status,
        notes: r.notes,
      },
    });
  }
  console.log(`Created ${rooms.length} room allocations`);

  // 15. Sangeet Songs
  const sangeetSongs = [
    { title: "London Thumakda", artist: "Labh Janjua", duration: 275, type: "Group", event: "Sangeet", notes: "Family dance number" },
    { title: "Nagada Sang Dhol", artist: "Shreya Ghoshal", duration: 302, type: "Solo", event: "Sangeet", notes: "Bride's solo performance" },
    { title: "Mere Brother Ki Dulhan", artist: "Pritam", duration: 268, type: "Duet", event: "Sangeet", notes: "Brother-sister dance" },
    { title: "Kar Gayi Chull", artist: "Badshah", duration: 210, type: "Group", event: "Sangeet", notes: "Friends dance" },
    { title: "Dil Dhadakne Do", artist: "Shankar-Ehsaan-Loy", duration: 290, type: "Duet", event: "Sangeet", notes: "Couple dance" },
    { title: "Badtameez Dil", artist: "Benny Dayal", duration: 232, type: "Solo", event: "Sangeet", notes: "Groom's solo" },
  ];
  order = 0;
  for (const song of sangeetSongs) {
    const createdSong = await prisma.sangeetSong.create({
      data: {
        weddingId: wedding.id,
        order: order++,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        type: song.type,
        event: song.event,
        notes: song.notes,
      },
    });
    // Add performers
    if (song.type === "Group") {
      await prisma.sangeetPerformance.createMany({
        data: [
          { songId: createdSong.id, personName: "Priya", role: "Performer", confirmed: true },
          { songId: createdSong.id, personName: "Meera", role: "Performer", confirmed: true },
          { songId: createdSong.id, personName: "Neha", role: "Performer", confirmed: false },
        ],
      });
    } else if (song.type === "Duet") {
      await prisma.sangeetPerformance.createMany({
        data: [
          { songId: createdSong.id, personName: "Priya", role: "Performer", confirmed: true },
          { songId: createdSong.id, personName: "Arjun", role: "Performer", confirmed: true },
        ],
      });
    } else {
      await prisma.sangeetPerformance.create({
        data: {
          songId: createdSong.id,
          personName: song.title.includes("Brother") ? "Vikram" : "Priya",
          role: "Performer",
          confirmed: true,
        },
      });
    }
  }
  console.log(`Created ${sangeetSongs.length} sangeet songs`);

  // 16. Color Themes
  const colorThemes = [
    { eventName: "Haldi", primaryColor: "#FFD700", secondaryColor: "#FFA500", accentColor: "#FFF8DC", mood: "Vibrant", notes: "Yellow and orange theme" },
    { eventName: "Mehendi", primaryColor: "#228B22", secondaryColor: "#90EE90", accentColor: "#FFD700", mood: "Traditional", notes: "Green and gold" },
    { eventName: "Sangeet", primaryColor: "#FF1493", secondaryColor: "#FF69B4", accentColor: "#FFD700", mood: "Festive", notes: "Pink and gold" },
    { eventName: "Wedding", primaryColor: "#DC143C", secondaryColor: "#FF6347", accentColor: "#FFD700", mood: "Traditional", notes: "Red and gold - classic" },
    { eventName: "Reception", primaryColor: "#4B0082", secondaryColor: "#9370DB", accentColor: "#C0C0C0", mood: "Elegant", notes: "Purple and silver" },
  ];
  order = 0;
  for (const theme of colorThemes) {
    await prisma.eventColorTheme.create({
      data: {
        weddingId: wedding.id,
        eventName: theme.eventName,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        mood: theme.mood,
        notes: theme.notes,
      },
    });
  }
  console.log(`Created ${colorThemes.length} color themes`);

  // 17. Outfit Colors
  const outfitColors = [
    { eventName: "Haldi", person: "Ananya", outfitDesc: "Yellow floral lehenga", primaryColor: "#FFD700", secondaryColor: "#FFA500", accentColor: "#FFF8DC", matchScore: 92, notes: "" },
    { eventName: "Haldi", person: "Arjun", outfitDesc: "Yellow kurta pajama", primaryColor: "#FFD700", secondaryColor: "#FFA500", accentColor: "#FFF8DC", matchScore: 88, notes: "" },
    { eventName: "Wedding", person: "Ananya", outfitDesc: "Red Banarasi lehenga", primaryColor: "#DC143C", secondaryColor: "#FFD700", accentColor: "#FF6347", matchScore: 98, notes: "" },
    { eventName: "Wedding", person: "Arjun", outfitDesc: "Gold sherwani", primaryColor: "#FFD700", secondaryColor: "#DC143C", accentColor: "#FF6347", matchScore: 96, notes: "" },
    { eventName: "Reception", person: "Ananya", outfitDesc: "Gold cocktail gown", primaryColor: "#FFD700", secondaryColor: "#C0C0C0", accentColor: "#4B0082", matchScore: 94, notes: "" },
    { eventName: "Reception", person: "Arjun", outfitDesc: "Navy blue tuxedo", primaryColor: "#191970", secondaryColor: "#C0C0C0", accentColor: "#FFD700", matchScore: 91, notes: "" },
  ];
  order = 0;
  for (const outfit of outfitColors) {
    await prisma.outfitColor.create({
      data: {
        weddingId: wedding.id,
        eventName: outfit.eventName,
        person: outfit.person,
        outfitDesc: outfit.outfitDesc,
        primaryColor: outfit.primaryColor,
        secondaryColor: outfit.secondaryColor,
        accentColor: outfit.accentColor,
        matchScore: outfit.matchScore,
        notes: outfit.notes,
        order: order++,
      },
    });
  }
  console.log(`Created ${outfitColors.length} outfit colors`);

  // 18. Family Members
  const familyMembers = [
    { name: "Rajesh Chandak", side: "Groom", relation: "Father", age: 55, sideDetail: "Paternal", notes: "" },
    { name: "Sunita Chandak", side: "Groom", relation: "Mother", age: 52, sideDetail: "Paternal", notes: "" },
    { name: "Priya Chandak", side: "Groom", relation: "Sister", age: 28, sideDetail: "Paternal", notes: "" },
    { name: "Ravi Chandak", side: "Groom", relation: "Grandfather", age: 78, sideDetail: "Paternal", notes: "" },
    { name: "Ashadevi Chandak", side: "Groom", relation: "Grandmother", age: 75, sideDetail: "Paternal", notes: "" },
    { name: "Suresh Deshmukh", side: "Bride", relation: "Father", age: 54, sideDetail: "Maternal", notes: "" },
    { name: "Ashwini Deshmukh", side: "Bride", relation: "Mother", age: 50, sideDetail: "Maternal", notes: "" },
    { name: "Kavya Deshmukh", side: "Bride", relation: "Sister", age: 26, sideDetail: "Maternal", notes: "" },
    { name: "Prakash Deshmukh", side: "Bride", relation: "Grandfather", age: 80, sideDetail: "Maternal", notes: "" },
    { name: "Usha Deshmukh", side: "Bride", relation: "Grandmother", age: 76, sideDetail: "Maternal", notes: "" },
  ];
  order = 0;
  const familyMemberRecords = [];
  for (const member of familyMembers) {
    const created = await prisma.familyMember.create({
      data: {
        weddingId: wedding.id,
        name: member.name,
        side: member.side,
        relation: member.relation,
        age: member.age,
        sideDetail: member.sideDetail,
        notes: member.notes,
        order: order++,
      },
    });
    familyMemberRecords.push(created);
  }
  console.log(`Created ${familyMembers.length} family members`);

  // 19. Family Relationships
  const relationships = [
    { memberA: "Rajesh Chandak", memberB: "Suresh Deshmukh", status: "Good", notes: "Both families get along well", conflictLevel: 0 },
    { memberA: "Sunita Chandak", memberB: "Ashwini Deshmukh", status: "Good", notes: "Talk regularly about wedding planning", conflictLevel: 0 },
    { memberA: "Priya Chandak", memberB: "Kavya Deshmukh", status: "Good", notes: " cousins, close friends", conflictLevel: 0 },
    { memberA: "Rajesh Chandak", memberB: "Sunita Chandak", status: "Good", notes: "Happy couple", conflictLevel: 0 },
    { memberA: "Suresh Deshmukh", memberB: "Ashwini Deshmukh", status: "Good", notes: "Happy couple", conflictLevel: 0 },
  ];
  for (const rel of relationships) {
    const memberA = familyMemberRecords.find(m => m.name === rel.memberA);
    const memberB = familyMemberRecords.find(m => m.name === rel.memberB);
    if (memberA && memberB) {
      await prisma.familyRelationship.create({
        data: {
          weddingId: wedding.id,
          memberIdA: memberA.id,
          memberIdB: memberB.id,
          status: rel.status,
          notes: rel.notes,
          conflictLevel: rel.conflictLevel,
        },
      });
    }
  }
  console.log(`Created ${relationships.length} family relationships`);

  // 20. Seating Conflicts
  const conflicts = [
    { guestName: "Vikram Chandak", conflictWith: "Mohan Deshmukh", severity: "Low", reason: "Old business disagreement", resolved: false, notes: "" },
    { guestName: "Kavita Chandak", conflictWith: "Lata Deshmukh", severity: "Medium", reason: "Family property dispute", resolved: false, notes: "Seat at different tables" },
  ];
  for (const conflict of conflicts) {
    await prisma.seatingConflict.create({
      data: {
        weddingId: wedding.id,
        guestName: conflict.guestName,
        conflictWith: conflict.conflictWith,
        severity: conflict.severity,
        reason: conflict.reason,
        resolved: conflict.resolved,
        notes: conflict.notes,
      },
    });
  }
  console.log(`Created ${conflicts.length} seating conflicts`);

  // 21. Update wedding guest count
  await prisma.wedding.update({
    where: { id: wedding.id },
    data: { guestCount: allGuests.length },
  });

  console.log("\n========================================");
  console.log("DEMO WEDDING CREATED SUCCESSFULLY!");
  console.log("========================================");
  console.log(`User: ${email}`);
  console.log(`Wedding: ${wedding.name}`);
  console.log(`Wedding ID: ${wedding.id}`);
  console.log(`Website: shaadisheet.com/w/${wedding.websiteSlug}`);
  console.log(`RSVP Token: ${wedding.rsvpToken}`);
  console.log("========================================");
  console.log("\nData Summary:");
  console.log(`  - ${allGuests.length} guests`);
  console.log(`  - ${vendors.length} vendors`);
  console.log(`  - ${budgetItems.length} budget items`);
  console.log(`  - ${tasks.length} tasks`);
  console.log(`  - ${events.length} events`);
  console.log(`  - ${gifts.length} gifts`);
  console.log(`  - ${hashtags.length} hashtags`);
  console.log(`  - ${outfits.length} outfits`);
  console.log(`  - ${inviteDetails.length} invite details`);
  console.log(`  - ${checklistItems.length} checklist items`);
  console.log(`  - ${tables.length} seating tables`);
  console.log(`  - ${rooms.length} room allocations`);
  console.log(`  - ${sangeetSongs.length} sangeet songs`);
  console.log(`  - ${colorThemes.length} color themes`);
  console.log(`  - ${outfitColors.length} outfit colors`);
  console.log(`  - ${familyMembers.length} family members`);
  console.log(`  - ${relationships.length} family relationships`);
  console.log(`  - ${conflicts.length} seating conflicts`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
