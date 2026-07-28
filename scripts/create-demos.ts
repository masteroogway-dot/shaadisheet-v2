import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const photo = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80";
const photoFloral = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80";
const photoBoho = "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80";
const photoEditorial = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80";
const photoMonogram = "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80";
const photoTropical = "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=1200&q=80";

const baseEvents = [
  { name: "Mehendi Ceremony", date: "2026-12-18", startTime: "10:00", duration: "4 hours", location: "Crystal Ballroom, Grand Hyatt", dressCode: "Colorful Casual", description: "An evening of music, dance, and beautiful henna art." },
  { name: "Sangeet Night", date: "2026-12-18", startTime: "19:00", duration: "5 hours", location: "Poolside Lawn, Grand Hyatt", dressCode: "Festive Glam", description: "A night of music, dance performances, and celebration." },
  { name: "Wedding Ceremony", date: "2026-12-19", startTime: "11:00", duration: "3 hours", location: "Grand Hyatt Chapel", dressCode: "Formal", description: "The sacred ceremony uniting two souls." },
  { name: "Reception Dinner", date: "2026-12-19", startTime: "19:00", duration: "4 hours", location: "Grand Ballroom, Grand Hyatt", dressCode: "Black Tie", description: "An evening of fine dining, toasts, and celebration." },
];

const baseStory = {
  quote: "In all the world, there is no heart for me like yours.",
  howWeMet: "We first met at a mutual friend's party in the summer of 2020. What started as a casual conversation about our favorite travel destinations turned into hours of talking. We discovered we shared a love for adventure, spicy food, and old Bollywood movies. By the end of the night, we knew this was something special.",
  proposal: "Two years later, on a quiet evening at our favorite rooftop restaurant, with the city lights twinkling below, he got down on one knee. Through tears of joy, I said yes before he could even finish the question. It was perfect — intimate, romantic, and absolutely us.",
};

const baseTravel = {
  venueName: "Grand Hyatt Mumbai",
  venueAddress: "Off Western Express Highway, Santacruz East, Mumbai 400055",
  mapsUrl: "https://maps.google.com/?q=Grand+Hyatt+Mumbai",
  hotels: [
    { name: "Grand Hyatt Mumbai", price: "₹8,500/night (wedding group rate)", groupCode: "CHANDAK2026", link: "https://hyatt.com" },
    { name: "JW Marriott Mumbai", price: "₹7,200/night", groupCode: "WEDDING2026", link: "https://marriott.com" },
  ],
  tips: "Mumbai in December has pleasant weather (22-30°C). The venue is 15 minutes from the airport. Complimentary shuttle service available from both hotels.",
};

const baseRegistry = [
  { name: "Honeymoon Fund", url: "https://example.com/honeymoon" },
  { name: "Home Registry", url: "https://example.com/home" },
  { name: "Experience Fund", url: "https://example.com/experiences" },
];

const baseFaq = [
  { q: "What is the dress code?", a: "The Mehendi is colorful casual, Sangeet is festive glam, the ceremony is formal, and the reception is black tie. We encourage you to dress your best!" },
  { q: "Is there parking available?", a: "Yes, the Grand Hyatt has valet parking and a multi-level parking garage. Valet is complimentary for wedding guests." },
  { q: "Can I bring a plus one?", a: "Please check your invitation for details on the number of guests invited. If you have questions, reach out to us directly." },
  { q: "Are there vegetarian options?", a: "Absolutely! Our caterers offer a wide variety of vegetarian, vegan, and Jain options alongside non-vegetarian dishes." },
  { q: "What time should I arrive?", a: "We recommend arriving 30 minutes before the scheduled start time for each event to allow for seating and pre-event refreshments." },
];

const baseGuests = [
  { name: "Sneha Mehra" }, { name: "Rohan Patel" }, { name: "Priya Sharma" },
  { name: "Amit Singh" }, { name: "Neha Gupta" }, { name: "Vikram Desai" },
  { name: "Anjali Nair" }, { name: "Karthik Iyer" }, { name: "Meera Joshi" },
  { name: "Arjun Kapoor" }, { name: "Divya Reddy" }, { name: "Sanjay Mishra" },
];

const demos = [
  {
    slug: "demo-royal-indian",
    name: "Ananya & Arjun",
    city: "Mumbai",
    photo: photo,
    template: "royal-indian",
    tagline: "Two Souls, One Divine Journey",
    theme: { primary: "#722F37", accent: "#D4AF37" },
  },
  {
    slug: "demo-floral",
    name: "Priya & Rahul",
    city: "Jaipur",
    photo: photoFloral,
    template: "floral",
    tagline: "A Blooming Love Story",
    theme: { primary: "#C75B7A", accent: "#BA94D1" },
  },
  {
    slug: "demo-boho",
    name: "Maya & Dev",
    city: "Udaipur",
    photo: photoBoho,
    template: "boho",
    tagline: "Love, Freely & Wildly",
    theme: { primary: "#8B6F47", accent: "#C4A882" },
  },
  {
    slug: "demo-editorial",
    name: "Zara & Kabir",
    city: "Delhi",
    photo: photoEditorial,
    template: "editorial",
    tagline: "A Modern Love Story",
    theme: { primary: "#1A1A2E", accent: "#E94560" },
  },
  {
    slug: "demo-monogram",
    name: "Ishaan & Tara",
    city: "Bangalore",
    photo: photoMonogram,
    template: "monogram",
    tagline: "Written in the Stars",
    theme: { primary: "#2C3E50", accent: "#D4A574" },
  },
  {
    slug: "demo-tropical",
    name: "Leela & Nikhil",
    city: "Goa",
    photo: photoTropical,
    template: "tropical",
    tagline: "Paradise Found",
    theme: { primary: "#006B5E", accent: "#F4A261" },
  },
];

async function main() {
  console.log("Creating demo weddings...");

  for (const demo of demos) {
    const config = JSON.stringify({
      template: demo.template,
      theme: demo.theme,
      photo: demo.photo,
      tagline: demo.tagline,
      story: baseStory,
      events: baseEvents.map((e, i) => ({ ...e, id: `evt-${demo.slug}-${i}` })),
      travel: baseTravel,
      registry: baseRegistry,
      faq: baseFaq,
    });

    const wedding = await prisma.wedding.create({
      data: {
        name: demo.name,
        weddingDate: "2026-12-19T11:00:00.000Z",
        weddingCity: demo.city,
        websiteSlug: demo.slug,
        websiteConfig: config,
        religion: "Hindu",
        userId: "cmru5eeax00009gwxoun4dsd9",
      },
    });

    // Create guests
    for (const guest of baseGuests) {
      await prisma.guest.create({
        data: {
          name: guest.name,
          weddingId: wedding.id,
          rsvp: "Pending",
        },
      });
    }

    console.log(`Created: ${demo.name} (${demo.slug}) — template: ${demo.template}`);
  }

  console.log("\nAll 6 demo weddings created!");
  console.log("\nLinks:");
  for (const demo of demos) {
    console.log(`  ${demo.template}: /w/${demo.slug}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
