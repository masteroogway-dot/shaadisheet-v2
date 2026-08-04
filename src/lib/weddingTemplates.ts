export interface WeddingTemplateData {
  name: string;
  slug: string;
  country: string;
  religion: string;
  region: string;
  currency: string;
  events: Array<{
    name: string;
    description: string;
    startTime: string;
    duration: number;
    isRitual: boolean;
    dayOffset: number;
    isSimultaneous?: boolean;
  }>;
  budgetRanges: {
    budget: { min: number; max: number; label: string };
    mid: { min: number; max: number; label: string };
    luxury: { min: number; max: number; label: string };
  };
  dressCodes: {
    bride: string;
    groom: string;
    guests: string;
  };
  foodDefaults: {
    type: string;
    staples: string[];
    keyDishes: string[];
    restrictions: string[];
  };
  checklistItems: Array<{
    category: string;
    items: string[];
  }>;
  guestRange: { min: number; typical: number; max: number };
  planningMonths: number;
}

export const WEDDING_TEMPLATES: WeddingTemplateData[] = [
  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU NORTH INDIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu North Indian",
    slug: "hindu-north-indian",
    country: "india",
    religion: "hindu",
    region: "North Indian",
    currency: "INR",
    events: [
      { name: "Roka", description: "Official engagement ceremony between families", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Engagement", description: "Ring exchange ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -4 },
      { name: "Mehendi", description: "Henna application for bride and guests", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Haldi", description: "Turmeric paste ceremony for bride and groom", startTime: "09:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Baraat, Jaimala, Pheras - main wedding ceremony", startTime: "10:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
      { name: "Reception", description: "Grand evening celebration and dinner", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2500000, max: 7000000, label: "₹25–70 Lakh" },
      luxury: { min: 15000000, max: 50000000, label: "₹1.5–5 Crore" },
    },
    dressCodes: {
      bride: "Red lehenga choli with heavy zardozi/gota patti embroidery; dupatta over head",
      groom: "Sherwani (ivory/cream/gold) with churidar, turban (pagri), sehra, kalgi",
      guests: "Bright sarees, lehengas, salwar kameez for women; kurta pajama, sherwani, or suit for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Mughlai", "Punjabi"],
      keyDishes: ["Butter chicken", "Dal makhani", "Paneer dishes", "Biryani", "Naan", "Gulab jamun", "Jalebi"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Antacids", "Tissues", "Stain remover", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri list", "Havan kund arrangement", "Sacred fire materials", "Flowers and garlands", "Fruits and sweets for offering"] },
      { category: "Vidaai Essentials", items: ["Coconut for vidaai", "Rice for farewell", "Vidaai flowers", "Bride's travel bag", "Family photo session", " Emotional support plan"] },
      { category: "Mandap Decor", items: ["Mandap fabric and flowers", "Marigold garlands", "Mango leaves for toran", "Kalash and coconut", "Lighting arrangement", "Seating for pheras"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU SOUTH INDIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu South Indian",
    slug: "hindu-south-indian",
    country: "india",
    religion: "hindu",
    region: "South Indian",
    currency: "INR",
    events: [
      { name: "Nischayam", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application (optional, smaller scale)", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Kanyadaanam, Thali tying, Saptapadi", startTime: "06:00", duration: 240, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 5000000, label: "₹15–50 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "₹50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Kanjeevaram silk saree in bright colors (red, gold, green) with temple jewelry",
      groom: "Dhoti/veshti with kurta and angavastram",
      guests: "Silk sarees for women; veshti-shirt for men",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Tamil", "Kannada", "Malayali"],
      keyDishes: ["Sadya on banana leaf", "Sambar", "Rasam", "Avial", "Payasam", "Dosa", "Idli"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Mangalsutra (Thali)", "Sacred thread", "Flowers and garlands", "Camphor and incense"] },
      { category: "Temple Ceremony", items: ["Temple booking confirmed", "Banana leaves for sadya", "Traditional lamps", "Kalash and coconut", "Flower arrangements"] },
    ],
    guestRange: { min: 100, typical: 250, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — MUSLIM INDIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Muslim Indian",
    slug: "muslim-indian",
    country: "india",
    religion: "muslim",
    region: "Indian",
    currency: "INR",
    events: [
      { name: "Mangni", description: "Engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna night for bride", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic wedding ceremony", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Post-wedding reception hosted by groom's family", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2000000, max: 7000000, label: "₹20–70 Lakh" },
      luxury: { min: 10000000, max: 20000000, label: "₹1–2 Crore" },
    },
    dressCodes: {
      bride: "Sharara, gharara, or lehenga in red/gold with heavy zardozi work",
      groom: "Sherwani with karakuli (lambskin cap) or pagri",
      guests: "Formal Indian attire; jewel tones for women",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Mughlai"],
      keyDishes: ["Biryani", "Kebabs", "Nihari", "Haleem", "Sheer khurma", "Gulab jamun"],
      restrictions: ["No pork", "No alcohol (halal only)"],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", " Quran for Aarsi Mushaf", "Wedding venue booking"] },
      { category: "Walima Essentials", items: ["Catering booking confirmed", "Stage decoration", "Lighting and sound", "Guest seating arrangement", "Welcome desk setup"] },
    ],
    guestRange: { min: 200, typical: 400, max: 600 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — SIKH PUNJABI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sikh Punjabi",
    slug: "sikh-punjabi",
    country: "india",
    religion: "sikh",
    region: "Punjabi",
    currency: "INR",
    events: [
      { name: "Roka", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Anand Karaj", description: "Wedding ceremony at Gurdwara (4 Laavan)", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Langar", description: "Community meal at Gurdwara", startTime: "13:00", duration: 120, isRitual: true, dayOffset: 0, isSimultaneous: true },
      { name: "Reception", description: "Evening celebration party", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 2500000, max: 5000000, label: "₹25–50 Lakh" },
      mid: { min: 5000000, max: 10000000, label: "₹50 Lakh–1 Crore" },
      luxury: { min: 10000000, max: 25000000, label: "₹1–2.5 Crore" },
    },
    dressCodes: {
      bride: "Red/maroon lehenga or salwar kameez with chooda (21 red+white bangles) and kaleere",
      groom: "Sherwani with turban (pagri/dastaar), kalgi, kirpan (ceremonial sword)",
      guests: "Colorful ethnic wear; heads must be covered in Gurdwara",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Punjabi"],
      keyDishes: ["Butter chicken", "Dal makhani", "Paneer tikka", "Naan", "Langar (community meal)", "Gulab jamun"],
      restrictions: ["No alcohol inside Gurdwara", "Langar is strictly vegetarian"],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Gurdwara Requirements", items: ["Gurdwara booking confirmed", "Head coverings for all guests", "Kirpan for groom", "Chooda set (21 bangles)", "Rumala (cloth for Guru Granth Sahib)", "Karah Prashad ingredients"] },
      { category: "Anand Karaj Essentials", items: ["Granthi (priest) confirmed", "Laavan hymns booklets", "Flower decorations for Palki Sahib", "Seating for guests (floor)", "Musicians (Rababi)", "Langar kitchen coordination"] },
      { category: "Langar Planning", items: ["Langar menu decided", "Volunteer cooks confirmed", "Langar hall booking", "Utensils and plates", "Washing area setup", "Food serving volunteers"] },
    ],
    guestRange: { min: 250, typical: 400, max: 500 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — JAIN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Jain",
    slug: "jain-indian",
    country: "india",
    religion: "jain",
    region: "Indian",
    currency: "INR",
    events: [
      { name: "Vagdana", description: "Verbal agreement between families", startTime: "11:00", duration: 60, isRitual: true, dayOffset: -5 },
      { name: "Engagement", description: "Lagna Lekhan / ring exchange", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -4 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Sangeet", description: "Dance and music night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1, isSimultaneous: true },
      { name: "Wedding", description: "Mada Mandap, Mangal Pheras, Saptapadi", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration and dinner", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 3000000, max: 7000000, label: "₹30–70 Lakh" },
      mid: { min: 7000000, max: 15000000, label: "₹70 Lakh–1.5 Crore" },
      luxury: { min: 15000000, max: 20000000, label: "₹1.5–2 Crore" },
    },
    dressCodes: {
      bride: "Bridal lehenga or saree in red/gold",
      groom: "Sherwani with turban",
      guests: "Traditional Indian wear",
    },
    foodDefaults: {
      type: "jain",
      staples: ["Gujarati", "Rajasthani"],
      keyDishes: ["Farsan", "Dhokla", "Khandvi", "Sabudana khichdi", "Jain sweets"],
      restrictions: ["No root vegetables (onion, garlic, potato, carrot, beetroot)", "No honey", "No alcohol", "No leather/silk in decor"],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Jain Catering Rules", items: ["No root vegetables confirmed", "Jain caterer booked", "Kitchen purity maintained", "Separate utensils for Jain food", "No onion/garlic in any dish", "Fruit-based sweets only"] },
      { category: "Ceremony Essentials", items: ["Mada Mandap decorated", "Sacred fire arranged", "Mangal Pheras setup", "Granthi Bandhan (tying the knot)", "Saptapadi items", "Ashirwad (blessings) plan"] },
    ],
    guestRange: { min: 200, typical: 400, max: 700 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — CHRISTIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Christian Indian",
    slug: "christian-indian",
    country: "india",
    religion: "christian",
    region: "Indian",
    currency: "INR",
    events: [
      { name: "Engagement", description: "Formal engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Roce Ceremony", description: "Pre-wedding turmeric/coconut milk ceremony", startTime: "17:00", duration: 120, isRitual: true, dayOffset: -1 },
      { name: "Church Wedding", description: "Wedding ceremony at church with vows", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Celebration and reception", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 755000, max: 1200000, label: "₹7.5–12 Lakh" },
      mid: { min: 1200000, max: 2500000, label: "₹12–25 Lakh" },
      luxury: { min: 2500000, max: 5000000, label: "₹25–50 Lakh" },
    },
    dressCodes: {
      bride: "White gown with veil (Goan/Mangalorean); white-and-gold Kasavu saree (Kerala)",
      groom: "Formal suit or tuxedo",
      guests: "Formal/smart attire; avoid white (bride's color)",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Goan", "Kerala", "Mangalorean"],
      keyDishes: ["Pork sorpotel", "Vindaloo", "Bebinca", "Appam and stew", "Chicken curry", "Sanna"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Church Requirements", items: ["Church booking confirmed", "Pastor/priest confirmed", "Pre-marriage counseling completed", "Banns announced", "Church decoration", "Music/choir arranged"] },
      { category: "Roce Ceremony", items: ["Turmeric paste", "Coconut milk", "Roce outfit for bride/groom", "Guest arrangements", "Music playlist", "Photography"] },
    ],
    guestRange: { min: 200, typical: 400, max: 1000 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — SUNNI MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Pakistani Sunni Muslim",
    slug: "muslim-pakistani-sunni",
    country: "pakistan",
    religion: "muslim",
    region: "Sunni",
    currency: "PKR",
    events: [
      { name: "Dholki", description: "Informal singing nights with dholak drum", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -7 },
      { name: "Mayun", description: "Bride secluded; ubtan paste applied; yellow theme", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -3 },
      { name: "Mehndi", description: "Henna night (separate for bride and groom's sides)", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -2 },
      { name: "Baraat", description: "Groom's procession with dhol, decorated car/horse", startTime: "16:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "19:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Groom's family grand reception", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 1500000, max: 2500000, label: "₨15–25 Lakh" },
      mid: { min: 3000000, max: 7000000, label: "₨30–70 Lakh" },
      luxury: { min: 15000000, max: 50000000, label: "₨1.5–5 Crore" },
    },
    dressCodes: {
      bride: "Deep red/maroon lehenga or gharara with heavy zardozi, dabka, kora embroidery (can weigh 8+ kg)",
      groom: "Sherwani with sehra (flower veil), pagri",
      guests: "Jewel tones (avoid bridal red) for Baraat; champagne, silver, mint for Walima",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Punjabi", "Mughlai"],
      keyDishes: ["Biryani", "Nihari", "Haleem", "Seekh kebabs", "Sheer khurma", "Gulab jamun"],
      restrictions: ["No pork", "No alcohol (halal only)"],
    },
    checklistItems: [
      { category: "Dholki Essentials", items: ["Dholak (drum)", "Song list prepared", "Guest snacks", "Seating arrangement", "Microphone/speaker"] },
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr (bride price) decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Quran for Aarsi Mushaf", "Wedding venue booking"] },
      { category: "Baraat Planning", items: ["Horse/car booking for groom", "Dhol (drum) players", "Baraat route planned", "Joota Chupai plan (sisters hide shoes)", "Doodh Pilai arrangement", "Welcome refreshments"] },
      { category: "Walima Essentials", items: ["Catering booking confirmed", "Stage decoration", "Lighting and sound", "Guest seating arrangement", "Welcome desk setup", "Photography/videography"] },
    ],
    guestRange: { min: 300, typical: 600, max: 1500 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // BANGLADESH — BENGALI MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Bengali Muslim",
    slug: "muslim-bangladeshi",
    country: "bangladesh",
    religion: "muslim",
    region: "Bengali",
    currency: "BDT",
    events: [
      { name: "Gaye Holud", description: "Turmeric ceremony (separate for bride and groom)", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Mehendi", description: "Henna application", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic wedding contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Post-wedding reception by groom's family", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 500000, label: "৳3–5 Lakh" },
      mid: { min: 500000, max: 1500000, label: "৳5–15 Lakh" },
      luxury: { min: 1500000, max: 2000000, label: "৳15–20 Lakh" },
    },
    dressCodes: {
      bride: "Red Benarasi silk brocade saree with heavy gold jewelry for Nikah; yellow cotton for Gaye Holud",
      groom: "Sherwani or high-end Panjabi with Nagras (traditional shoes)",
      guests: "Vibrant colors; men wear Panjabi or formal suit",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Bengali"],
      keyDishes: ["Fish curry", "Hilsa", "Biryani", "Rasgulla", "Sandesh", "Kebabs"],
      restrictions: ["No pork", "Fish is central to Bengali cuisine", "No alcohol"],
    },
    checklistItems: [
      { category: "Gaye Holud Essentials", items: ["Turmeric paste prepared", "Sweets and gifts from groom's family", "Decorated rohu fish", "Yellow theme decorations", "Folk music (dhol, ektara)", "Guest seating"] },
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Venue booking", "Catering arranged"] },
      { category: "Walima Planning", items: ["Catering booking confirmed", "Stage decoration", "Lighting and sound", "Guest list finalized", "Photography/videography"] },
    ],
    guestRange: { min: 300, typical: 500, max: 1000 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // BANGLADESH — BENGALI HINDU
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Bengali Hindu",
    slug: "hindu-bangladeshi",
    country: "bangladesh",
    religion: "hindu",
    region: "Bengali",
    currency: "BDT",
    events: [
      { name: "Gaye Holud", description: "Turmeric ceremony", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Dodhi Mangal", description: "Auspicious first look at wedding morning", startTime: "06:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Shubho Drishti", description: "Bride's first glance at groom", startTime: "08:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Mangal Pheras, Sindoor Daan", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Bou Bhat", description: "Reception by groom's family", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 500000, label: "৳2–5 Lakh" },
      mid: { min: 500000, max: 1000000, label: "৳5–10 Lakh" },
      luxury: { min: 1000000, max: 1500000, label: "৳10–15 Lakh" },
    },
    dressCodes: {
      bride: "White saree with red border; red bindi and sindoor",
      groom: "Dhoti-kurta or sherwani",
      guests: "Traditional Bengali attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Bengali"],
      keyDishes: ["Fish curry", "Hilsa", "Biryani", "Rasgulla", "Sandesh", "Mishti doi"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Sindoor", "Phone charger"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Sacred fire materials", "Flowers and garlands", "Mangal Pheras items", "Sindoor for Daan"] },
    ],
    guestRange: { min: 200, typical: 400, max: 600 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // SRI LANKA — SINHALESE BUDDHIST
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sinhalese Buddhist",
    slug: "buddhist-sinhalese",
    country: "sri_lanka",
    religion: "buddhist",
    region: "Sinhalese",
    currency: "LKR",
    events: [
      { name: "Poruwa Ceremony", description: "Main wedding ceremony on decorated wooden platform", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Kiribath", description: "Milk rice sharing ceremony", startTime: "12:00", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "Rs5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "Rs20–50 Lakh" },
      luxury: { min: 8000000, max: 25000000, label: "Rs80 Lakh–2.5 Crore" },
    },
    dressCodes: {
      bride: "Kandyan saree in white/gold/cream",
      groom: "Kandyan Nilame-style outfit (inspired by ancient Kandyan nobles)",
      guests: "Formal traditional attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Sri Lankan"],
      keyDishes: ["Kiribath (milk rice)", "Kavum (oil cakes)", "Kokis", "Rice and curry", "Hoppers", "Traditional sweets"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Poruwa Preparation", items: ["Poruwa (wooden platform) constructed", "Platform decorated with flowers", "Astrologer consultation (Nekath)", "Betel leaves for elders", "Gold thread for Nalangu", "Oil lamp for ceremony"] },
      { category: "Nekath Planning", items: ["Astrologer consulted for auspicious times", "Nekath (astrological requirements) documented", "Poruwa construction timeline", "Traditional items list", "Blessings ceremony安排"] },
    ],
    guestRange: { min: 100, typical: 200, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // SRI LANKA — TAMIL HINDU
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Tamil Hindu (Sri Lanka)",
    slug: "hindu-tamil-sri_lanka",
    country: "sri_lanka",
    religion: "hindu",
    region: "Tamil",
    currency: "LKR",
    events: [
      { name: "Kanyadaanam", description: "Father gives away bride", startTime: "08:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Thaali Ceremony", description: "Groom ties sacred gold necklace (3 knots)", startTime: "09:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Agni Pradakshina", description: "Circling sacred fire", startTime: "10:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Saptapadi", description: "Seven steps together", startTime: "11:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "Rs5–15 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "Rs15–40 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "Rs50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Kanchipuram gold silk saree",
      groom: "Veshti (dhoti) with silk shirt or angavastram",
      guests: "Formal traditional attire",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Tamil"],
      keyDishes: ["Sambar", "Dosa", "Payasam", "Rice and curry", "Idli", "Vada"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Thaali (mangalsutra)", "Sacred fire materials", "Flowers and garlands", "Camphor and incense", "Banana leaves for sadya"] },
    ],
    guestRange: { min: 150, typical: 300, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — HINDU NEPALI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Nepali",
    slug: "hindu-nepali",
    country: "nepal",
    religion: "hindu",
    region: "Nepali",
    currency: "NPR",
    events: [
      { name: "Tika-Tala", description: "Engagement with Kusha grass ring", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna ceremony", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Janti", description: "Groom's procession with brass band, Panche Baja", startTime: "10:00", duration: 120, isRitual: false, dayOffset: 0 },
      { name: "Wedding", description: "Swayamvar, Sindoor, Fire ceremony, Kanyadaan", startTime: "12:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Mukh Herne", description: "Bride's face showing to groom's family", startTime: "16:00", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding feast", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 5000, max: 10000, label: "$5,000–$10,000" },
      mid: { min: 15000, max: 40000, label: "$15,000–$40,000" },
      luxury: { min: 40000, max: 60000, label: "$40,000–$60,000" },
    },
    dressCodes: {
      bride: "Bright red sari or lehenga with gold embroidery",
      groom: "Daura Suruwal or sherwani with topor (conical hat)",
      guests: "Festive colors; dhaka topi or kurta appreciated",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Nepali"],
      keyDishes: ["Dal bhat", "Aloo tama", "Sekuwa (grilled meat)", "Chatamari", "Sel roti", "Momos"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Janti Planning", items: ["Panche Baja musicians booked", "Groom's horse/car decorated", "Baraat route planned", "Welcome refreshments", "Flower garlands for groom"] },
      { category: "Dubo Ko Mala", items: ["Bermuda grass garlands prepared (never wilt)", "Garlands for bride and groom", "Symbolic of long marriage", "Backup artificial garlands"] },
    ],
    guestRange: { min: 200, typical: 300, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — NEWARI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Newari",
    slug: "hindu-newari",
    country: "nepal",
    religion: "hindu",
    region: "Newari",
    currency: "NPR",
    events: [
      { name: "Ihi", description: "Bel marriage — girl symbolically married to bel fruit (Vishnu)", startTime: "10:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Supari", description: "Bride hands 10 betel nuts to each family member", startTime: "11:00", duration: 60, isRitual: true, dayOffset: -3 },
      { name: "Swayamvar", description: "Bride circumambulates groom 3 times, presents betel nuts and garland", startTime: "10:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Sindoor", description: "Groom applies vermilion to bride's forehead", startTime: "11:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Departure", description: "Bride's formal departure in decorated palanquin", startTime: "14:00", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 5000, max: 10000, label: "$5,000–$10,000" },
      mid: { min: 10000, max: 20000, label: "$10,000–$20,000" },
      luxury: { min: 20000, max: 30000, label: "$20,000–$30,000" },
    },
    dressCodes: {
      bride: "Haku Patasi (black sari with red border) and white paper hat (topi)",
      groom: "Malla-era costume",
      guests: "Traditional Newari attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Newari"],
      keyDishes: ["Chatamari (rice crepes)", "Yomari", "Choyla (spiced meat)", "Sekuwa", "Newari sweets"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Ihi Ceremony", items: ["Bel fruit (wood apple) for ceremony", "Traditional Newari priest", "Betel nuts and leaves", "Newari attire for bride", "Traditional music", "Guest seating"] },
      { category: "Swayamvar Essentials", items: ["Betel nuts for bride", "Garlands for groom", "Palanquin (doli) decorated", "Traditional Newari musicians", "Red vermilion (sindoor)", "Family blessings ceremony"] },
    ],
    guestRange: { min: 200, typical: 300, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // MALDIVES — MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Maldivian Muslim",
    slug: "muslim-maldivian",
    country: "maldives",
    religion: "muslim",
    region: "Maldivian",
    currency: "MVR",
    events: [
      { name: "Henna Night", description: "Bride's hands decorated with henna", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Marriage contract in mosque or home", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Boduberu", description: "Traditional drumming and dance performance", startTime: "14:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Valimah", description: "Grand reception feast", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 8000, label: "$3,000–$8,000" },
      mid: { min: 8000, max: 25000, label: "$8,000–$25,000" },
      luxury: { min: 25000, max: 400000, label: "$25,000–$400,000" },
    },
    dressCodes: {
      bride: "Dhirhamathi (embroidered silk/cotton dress) with gold jewelry and henna; or Libaas",
      groom: "White shirt (Libaas) and sarong (Mundu); or formal suit",
      guests: "Modest attire; long dresses/skirts for women; long pants and shirts for men",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Maldivian"],
      keyDishes: ["Rice", "Fish curries", "Grilled seafood", "Garudhiya (fish broth)", "Hedhika (sweet snacks)"],
      restrictions: ["No pork", "No alcohol", "All food must be halal"],
    },
    checklistItems: [
      { category: "Henna Night", items: ["Henna artist booked", "Bridal henna design decided", "Guest henna arrangements", "Yellow/green theme", "Traditional music", "Refreshments"] },
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Qazi (officiant) confirmed", "Two male Muslim witnesses", "Mahr amount decided", "Quran for ceremony", "Venue booking"] },
      { category: "Resort Coordination", items: ["Resort booking confirmed", "Guest travel arrangements", "Accommodation for guests", "Catering menu finalized", "Decor and lighting", "Photography/videography"] },
    ],
    guestRange: { min: 2, typical: 30, max: 50 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // AFGHANISTAN — PASHTUN MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Afghan Pashtun Muslim",
    slug: "muslim-afghan-pashtun",
    country: "afghanistan",
    religion: "muslim",
    region: "Pashtun",
    currency: "AFN",
    events: [
      { name: "Khwara", description: "Formal engagement", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -7 },
      { name: "Shirni Khori", description: "'Eating sweets' engagement party", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -3 },
      { name: "Henna Night", description: "Khina Night — henna application", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic contract — mullah officiates", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Grand celebration with Attan dance", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "؋3–10 Lakh" },
      mid: { min: 1000000, max: 5000000, label: "؋10–50 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "؋50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Green dress (Khatt-e-Sabz) for Nikah; white/cream gown for reception; red for departure",
      groom: "Formal suit (modern) or Perahan Tunban with waistcoat and turban (traditional)",
      guests: "Formal new clothing; traditional forms preferred",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Afghan"],
      keyDishes: ["Kabuli pulao (national dish)", "Mantu (dumplings)", "Kebabs", "Qorma", "Rice and meat", "Fresh fruits"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Khwara Essentials", items: ["Engagement gifts exchanged", "Mahr (bride price) negotiated", "Families formally introduced", "Date for Nikah set", "Traditional sweets served"] },
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount documented", "Three Muslim witnesses", "Mullah (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
      { category: "Attan Dance Planning", items: ["Attan musicians booked", "Dance circle space arranged", "Traditional drums (tabla/zirbaghali)", "Guest participation encouraged", "Performance area cleared", "Music playlist prepared"] },
      { category: "Mahr Documentation", items: ["Mahr amount agreed", "Written contract prepared", "Witnesses signed", "Mahr items prepared", "Family consent documented", "Gifts for bride listed"] },
    ],
    guestRange: { min: 300, typical: 500, max: 1000 },
    planningMonths: 6,
  },

  // ═══════════════════════════════════════════════════════════════
  // BHUTAN — BUDDHIST NGALOP
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Buddhist Ngalop",
    slug: "buddhist-bhutanese-ngalop",
    country: "bhutan",
    religion: "buddhist",
    region: "Ngalop",
    currency: "BTN",
    events: [
      { name: "Lhabsang", description: "Monks burn incense and offer to local deities", startTime: "07:00", duration: 60, isRitual: true, dayOffset: -1 },
      { name: "Thrisor", description: "Purification ceremony — cleanses body, speech, mind, soul", startTime: "09:00", duration: 90, isRitual: true, dayOffset: 0 },
      { name: "Butter Lamp Lighting", description: "Couple prostrates 6 times, then butter lamps are lit", startTime: "10:30", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Changphoed", description: "Ara (local brew) offered to deities, then shared by couple from same wooden phoob", startTime: "11:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Ring Exchange", description: "Exchange of wedding rings to bind the couple", startTime: "11:30", duration: 15, isRitual: true, dayOffset: 0 },
      { name: "Tsepamey Choko", description: "Blessings from Head Lama for longevity and happy marriage", startTime: "11:45", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Zhugdrey Phunsum Tshogpa", description: "Food sharing ritual — oranges symbolize the couple's bond", startTime: "12:15", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Dhar Nyanga", description: "Presentation of five-color scarves with good wishes", startTime: "13:15", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Wedding Feast", description: "Celebration with masked dances (cham), music, and traditional food", startTime: "18:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 100000, max: 500000, label: "Nu.1–5 Lakh" },
      mid: { min: 500000, max: 2000000, label: "Nu.5–20 Lakh" },
      luxury: { min: 2000000, max: 10000000, label: "Nu.20 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Kira (hand-woven raw silk traditional dress) with koma (belt), toego (outer jacket), and radio (scarf); elaborate jewelry",
      groom: "Gho (traditional knee-length robe) with kera (belt), knee-high socks, and traditional shoes; yellow silk for formal occasions",
      guests: "Traditional Bhutanese dress (kira for women, gho for men) preferred; formal Western attire acceptable for foreign guests",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Bhutanese"],
      keyDishes: ["Ema datshi (chili cheese)", "Red rice", "Momos (dumplings)", "Phaksha paa (pork with red chilies)", "Jasha maru (spiced chicken)", "Ara (local brew)"],
      restrictions: ["No beef in some communities", "Ara offered at ceremony but not required for all guests"],
    },
    checklistItems: [
      { category: "Auspicious Date", items: ["Consult Bhutanese astrologer for auspicious date", "Confirm monastery or temple venue", "Head Lama (Rimpoche) confirmed", "Monks assigned for ceremony", "Date communicated to all guests"] },
      { category: "Lhabsang Preparation", items: ["Incense offerings prepared", "Local deities offerings arranged", "Monks briefed on ceremony sequence", "Temple courtyard cleaned", "Butter lamps prepared"] },
      { category: "Changphoed Ritual", items: ["Ara (local brew) prepared", "Wooden phoob (sharing bowl) obtained", "Offerings for deities arranged", "Ring exchange logistics confirmed"] },
      { category: "Wedding Feast", items: ["Venue booking confirmed", "Catering menu finalized (ema datshi, red rice, momos)", "Masked dance (cham) performers booked", "Traditional music arranged", "Photography/videography", "Dhar Nyanga scarves prepared"] },
    ],
    guestRange: { min: 50, typical: 200, max: 500 },
    planningMonths: 6,
  },

  // ═══════════════════════════════════════════════════════════════
  // BHUTAN — HINDU LHOTSHAMPA
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Lhotshampa",
    slug: "hindu-bhutanese-lhotshampa",
    country: "bhutan",
    religion: "hindu",
    region: "Lhotshampa",
    currency: "BTN",
    events: [
      { name: "Mai Ping", description: "Pre-wedding prayer ceremony at bride's home", startTime: "10:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Henna Night", description: "Bride's hands decorated with henna, songs and dancing", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Janti", description: "Groom's procession with music and dancing to wedding venue", startTime: "08:00", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Kanya Daan", description: "Father gives away the bride with sacred offerings", startTime: "09:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Vivah Homa", description: "Sacred fire ceremony — couple makes offerings into the fire", startTime: "09:30", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Saptapadi", description: "Seven steps around the sacred fire — seven vows", startTime: "11:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Sindoor & Mangalsutra", description: "Groom applies vermilion and ties sacred necklace", startTime: "11:30", duration: 15, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand feast with traditional Nepali food, music, and dancing", startTime: "18:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 100000, max: 500000, label: "Nu.1–5 Lakh" },
      mid: { min: 500000, max: 2000000, label: "Nu.5–20 Lakh" },
      luxury: { min: 2000000, max: 10000000, label: "Nu.20 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Red or maroon sari/salwar kameez with gold jewelry, bangles, and traditional Nepali bride ornaments",
      groom: "Daura suruwal (traditional Nepali dress) with dhaka topi (hat) or formal suit",
      guests: "Traditional Nepali attire or formal Western clothing; bright colors preferred",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Nepali"],
      keyDishes: ["Dal bhat (lentils and rice)", "Sel roti (ring-shaped bread)", "Momos", "Aloo tama (potato and bamboo shoot)", "Meat curries", "Sweets (laddu, barfi)"],
      restrictions: ["No beef", "Vegetarian options essential", "Halal not required"],
    },
    checklistItems: [
      { category: "Mai Ping Preparation", items: ["Puja (prayer) materials arranged", "Pandit (priest) confirmed", "Venue at bride's home prepared", "Flowers and decorations", "Sacred fire materials for Vivah Homa"] },
      { category: "Janti Planning", items: ["Barat procession route planned", "Music and DJ booked", "Dhol (drum) players confirmed", "Groom's outfit finalized", "Fireworks (if permitted)"] },
      { category: "Fire Ceremony", items: ["Sacred fire pit constructed", "Homa materials gathered", "Seven rounds space cleared", "Kanya Daan gifts prepared", "Mangalsutra and sindoor ready"] },
      { category: "Reception", items: ["Venue booking confirmed", "Catering menu finalized (dal bhat, sel roti)", "DJ and music arranged", "Photography/videography", "Guest seating arranged", "Cake and desserts"] },
    ],
    guestRange: { min: 100, typical: 300, max: 800 },
    planningMonths: 6,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU BENGALI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Bengali",
    slug: "hindu-indian-bengali",
    country: "india",
    religion: "hindu",
    region: "Bengali",
    currency: "INR",
    events: [
      { name: "Aiburobhat", description: "Farewell meal for bride before wedding", startTime: "12:00", duration: 120, isRitual: false, dayOffset: -2 },
      { name: "Gaye Holud", description: "Turmeric ceremony (bride's side)", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Dodhi Mangal", description: "Auspicious first look at dawn", startTime: "06:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Shubho Drishti", description: "Bride carried in, first glance at groom", startTime: "08:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Mangal Pheras", description: "Seven rounds around sacred fire", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Sindoor Daan", description: "Groom applies vermilion", startTime: "12:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Bou Bhat", description: "Reception by groom's family (bride serves first meal)", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₹20–50 Lakh" },
      luxury: { min: 10000000, max: 25000000, label: "₹1–2.5 Crore" },
    },
    dressCodes: {
      bride: "White saree with red border (Lal Paar) for main ceremony; red Banarasi for reception",
      groom: "Dhoti-kurta with Uttariya (upper cloth) or sherwani",
      guests: "Traditional Bengali attire; sarees for women, dhoti-kurta or panjabi for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Bengali"],
      keyDishes: ["Fish curry (Machher Jhol)", "Luchi-Alur Dom", "Chingri Malai Curry", "Rasgulla", "Sandesh", "Mishti doi"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Sindoor", "Phone charger"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Sacred fire materials", "Flowers and garlands", "Mangal Pheras items", "Sindoor for Daan"] },
      { category: "Bengali Traditions", items: ["Dhol-dhak players booked", "Shankha-Pola (bangles) for bride", "Topor (conical headgear) for groom", "Mangal coconut (kola agun)", "Bridal palanquin (palki)", "Aiburobhat meal arranged"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU GUJARATI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Gujarati",
    slug: "hindu-indian-gujarati",
    country: "india",
    religion: "hindu",
    region: "Gujarati",
    currency: "INR",
    events: [
      { name: "Gol Dhana", description: "Engagement with coriander seeds and jaggery", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Garba and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Pithi", description: "Turmeric paste ceremony", startTime: "08:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Mangal Pheras, Jaimala, Kanyadaan", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration and dinner", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₹20–50 Lakh" },
      luxury: { min: 10000000, max: 30000000, label: "₹1–3 Crore" },
    },
    dressCodes: {
      bride: "Chaniya choli (flared skirt + blouse) with heavy silver/gold jewelry, matha patti",
      groom: "Kediyu (flared kurta) with dhoti and safo (turban)",
      guests: "Colorful chaniya cholis for women; kediyu or kurta for men",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Gujarati"],
      keyDishes: ["Dhokla", "Khandvi", "Undhiyu", "Khichdi Kadhi", "Thepla", "Jalebi", "Mohanthal"],
      restrictions: ["No onion/garlic in religious ceremonies"],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Gol Dhana items"] },
      { category: "Garba Night", items: ["Dhol player booked", "Garba music playlist", "Chaniya cholis for guests", "Lighting setup", "Refreshments", "Photography"] },
    ],
    guestRange: { min: 200, typical: 500, max: 1000 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU MAHARASHTRIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Maharashtrian",
    slug: "hindu-indian-maharashtrian",
    country: "india",
    religion: "hindu",
    region: "Maharashtrian",
    currency: "INR",
    events: [
      { name: "Sakhar Puda", description: "Engagement with sugar exchange", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Haldi Kumkum", description: "Turmeric-vermilion ceremony for women", startTime: "09:00", duration: 120, isRitual: false, dayOffset: 0 },
      { name: "Wedding", description: "Antarpat, Lajahom, Saptapadi", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Nauvari (9-yard) saree in green or Paithani saree with traditional jewelry (thushi, choker, vajra)",
      groom: "Dhoti-kurta with Pheta (turban) and shela (stole)",
      guests: "Nauvari sarees or half-sarees for women; dhoti-kurta for men",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Maharashtrian"],
      keyDishes: ["Puran Poli", "Misal Pav", "Vada Pav", "Bharli Vangi", "Shrikhand", "Puran Poli"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Havan kund", "Antarpat cloth", "Lajahom rice", "Flowers and garlands"] },
      { category: "Maharashtrian Traditions", items: ["Gajra (flower garland) for bride", "Banana stem for ceremony", "Coconut for Kalash", "Turmeric and kumkum", "Wedding mandap decor", "Seating for pheras"] },
    ],
    guestRange: { min: 150, typical: 300, max: 600 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU RAJPUT
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Rajput",
    slug: "hindu-indian-rajput",
    country: "india",
    religion: "hindu",
    region: "Rajput",
    currency: "INR",
    events: [
      { name: "Sagai", description: "Engagement with exchange of sweets and gifts", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Haldi", description: "Turmeric ceremony", startTime: "08:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Baraat", description: "Groom's grand procession with sword and horse", startTime: "10:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Wedding", description: "Mangal Pheras, Jaimala, Kanyadaan at palace/fort venue", startTime: "12:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand palace celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 1000000, max: 3000000, label: "₹10–30 Lakh" },
      mid: { min: 3000000, max: 8000000, label: "₹30–80 Lakh" },
      luxury: { min: 15000000, max: 50000000, label: "₹1.5–5 Crore" },
    },
    dressCodes: {
      bride: "Red/gold lehenga with Kundan/Polki jewelry, borla (matha patti), nath (nose ring)",
      groom: "Bandhgala sherwani with safa (turban), sword (kirpan), and mojari shoes",
      guests: "Royal Rajasthani attire; lehengas for women, kurta-pyjama or bandhgala for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Rajasthani", "Mughlai"],
      keyDishes: ["Dal Baati Churma", "Laal Maas", "Gatte ki Sabzi", "Ker Sangri", "Ghevar", "Malpua"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Priest booking confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Mangal items"] },
      { category: "Rajput Traditions", items: ["Groom's horse decorated", "Sword for groom", "Palace/fort venue confirmed", "Rajasthani musicians", "Camel/horse for baraat", "Royal seating arrangement"] },
    ],
    guestRange: { min: 300, typical: 600, max: 1500 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU PUNJABI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Punjabi",
    slug: "hindu-indian-punjabi",
    country: "india",
    religion: "hindu",
    region: "Punjabi",
    currency: "INR",
    events: [
      { name: "Roka", description: "Families formally agree to the match", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -7 },
      { name: "Kurmai", description: "Engagement with exchange of gifts and sweets", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -4 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -2 },
      { name: "Sangeet", description: "Music, dance, and dhol night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Haldi", description: "Turmeric paste ceremony", startTime: "08:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Baraat, Jaimala, Mangal Pheras, Kanyadaan", startTime: "10:00", duration: 240, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand evening celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 1000000, max: 2500000, label: "₹10–25 Lakh" },
      mid: { min: 3000000, max: 7000000, label: "₹30–70 Lakh" },
      luxury: { min: 10000000, max: 30000000, label: "₹1–3 Crore" },
    },
    dressCodes: {
      bride: "Red/maroon lehenga with heavy gold jewelry, chooda (bangles), kaleere",
      groom: "Sherwani with turban (pagri), sehra, kalgi, and mojari",
      guests: "Bright Punjabi attire; salwar kameez for women, kurta-pajama for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Punjabi"],
      keyDishes: ["Butter chicken", "Sarson ka saag", "Makki ki roti", "Dal makhani", "Chole bhature", "Gulab jamun"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Pandit ji confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Mangal items"] },
      { category: "Baraat Planning", items: ["Horse/car for groom", "Dhol players booked", "Baraat route planned", "Joota Chupai plan", "Welcome refreshments", "Seating for baraatis"] },
    ],
    guestRange: { min: 250, typical: 500, max: 1000 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — HINDU
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Pakistani",
    slug: "hindu-pakistani-pakistani",
    country: "pakistan",
    religion: "hindu",
    region: "Pakistani",
    currency: "PKR",
    events: [
      { name: "Kanyadaan", description: "Families formally agree to the match", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Mangal Pheras, Jaimala, Kanyadaan", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Vidaai", description: "Bride's farewell ceremony", startTime: "14:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₨5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₨20–50 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₨80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Red lehenga with gold jewelry and chooda",
      groom: "Sherwani with turban",
      guests: "Traditional Pakistani Hindu attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Sindhi", "Punjabi"],
      keyDishes: ["Biryani", "Dal fry", "Paneer dishes", "Sindhi curry", "Gulab jamun", "Jalebi"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Pandit booking confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Mangal items"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — CHRISTIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Christian Pakistani",
    slug: "christian-pakistani-pakistani",
    country: "pakistan",
    religion: "christian",
    region: "Pakistani",
    currency: "PKR",
    events: [
      { name: "Engagement", description: "Formal engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Mehendi", description: "Henna night (cultural)", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Church Wedding", description: "Wedding ceremony at church with vows", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Reception celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₨5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₨20–50 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₨80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "White gown with veil or traditional Pakistani formal wear",
      groom: "Formal suit or tuxedo",
      guests: "Formal/smart attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Pakistani", "Continental"],
      keyDishes: ["Biryani", "Kebabs", "Pulao", "Cake", "Pastries", "Roasted chicken"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Church Requirements", items: ["Church booking confirmed", "Pastor/priest confirmed", "Pre-marriage counseling completed", "Church decoration", "Music/choir arranged", "Wedding bands"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — BUDDHIST
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Buddhist Nepali",
    slug: "buddhist-nepali-nepali",
    country: "nepal",
    religion: "buddhist",
    region: "Nepali",
    currency: "NPR",
    events: [
      { name: "Kura Thapne", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Haldi", description: "Turmeric ceremony", startTime: "09:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Buddhist ceremony with monks chanting, exchange of garlands", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding feast", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 8000, label: "$3,000–$8,000" },
      mid: { min: 10000, max: 25000, label: "$10,000–$25,000" },
      luxury: { min: 30000, max: 50000, label: "$30,000–$50,000" },
    },
    dressCodes: {
      bride: "Red or white saree with traditional Nepali jewelry",
      groom: "Daura Suruwal with topi (Nepali cap)",
      guests: "Traditional Nepali attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Nepali"],
      keyDishes: ["Dal bhat", "Momos", "Sel roti", "Sekuwa", "Chatamari", "Newari sweets"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Buddhist Ceremony", items: ["Monk/priest confirmed", "Buddhist prayer items", "Incense and candles", "Flowers for offering", "Buddha statue for altar", "Chanting books"] },
    ],
    guestRange: { min: 100, typical: 200, max: 400 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Muslim Nepali",
    slug: "muslim-nepali-nepali",
    country: "nepal",
    religion: "muslim",
    region: "Nepali",
    currency: "NPR",
    events: [
      { name: "Mangni", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna night", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Post-wedding reception", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 8000, label: "$3,000–$8,000" },
      mid: { min: 10000, max: 25000, label: "$10,000–$25,000" },
      luxury: { min: 25000, max: 40000, label: "$25,000–$40,000" },
    },
    dressCodes: {
      bride: "Red/gold lehenga or sharara with heavy jewelry",
      groom: "Sherwani or Perahan Tunban with turban",
      guests: "Formal Nepali Muslim attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Nepali", "Mughlai"],
      keyDishes: ["Biryani", "Kebabs", "Dal bhat", "Momos", "Sheer khurma", "Gulab jamun"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
    ],
    guestRange: { min: 100, typical: 250, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // SRI LANKA — CHRISTIAN (CATHOLIC)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sri Lankan Catholic",
    slug: "christian-sri_lankan-sri_lankan",
    country: "sri_lanka",
    religion: "christian",
    region: "Sri Lankan",
    currency: "LKR",
    events: [
      { name: "Engagement", description: "Formal engagement ceremony", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Poruwa Blessing", description: "Optional: Buddhist-style blessing adapted for Christian ceremony", startTime: "09:00", duration: 60, isRitual: false, dayOffset: 0 },
      { name: "Church Wedding", description: "Catholic wedding ceremony with mass", startTime: "10:00", duration: 90, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 6000, label: "Rs3,000–6,000" },
      mid: { min: 8000, max: 20000, label: "Rs8,000–20,000" },
      luxury: { min: 25000, max: 60000, label: "Rs25,000–60,000" },
    },
    dressCodes: {
      bride: "White wedding gown with veil",
      groom: "Formal suit or tuxedo",
      guests: "Formal/smart attire; avoid white",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Sri Lankan", "Continental"],
      keyDishes: ["Rice and curry", "Fish ambul thiyal", "Watalappan", "Love cake", "Roasted chicken", "Hoppers"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Church Requirements", items: ["Church booking confirmed", "Priest confirmed", "Pre-marriage counseling completed", "Banns announced", "Church decoration", "Music/choir arranged"] },
    ],
    guestRange: { min: 100, typical: 200, max: 500 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // SRI LANKA — MUSLIM
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sri Lankan Muslim",
    slug: "muslim-sri_lankan-sri_lankan",
    country: "sri_lanka",
    religion: "muslim",
    region: "Sri Lankan",
    currency: "LKR",
    events: [
      { name: "Mangni", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna night", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Post-wedding reception", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 6000, label: "Rs3,000–6,000" },
      mid: { min: 8000, max: 20000, label: "Rs8,000–20,000" },
      luxury: { min: 25000, max: 50000, label: "Rs25,000–50,000" },
    },
    dressCodes: {
      bride: "Red/gold lehenga or saree with heavy jewelry",
      groom: "Sherwani or formal suit with kufi cap",
      guests: "Formal Sri Lankan Muslim attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Sri Lankan", "Mughlai"],
      keyDishes: ["Biryani", "Kebabs", "Rice and curry", "Watalappan", "Sheer khurma", "Samosas"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
    ],
    guestRange: { min: 150, typical: 300, max: 600 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU KASHMIRI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Kashmiri",
    slug: "hindu-indian-kashmiri",
    country: "india",
    religion: "hindu",
    region: "Kashmiri",
    currency: "INR",
    events: [
      { name: "Lagan", description: "Engagement ceremony with family priest", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Kanjuur", description: "Mehndi/haldi ceremony", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Lagan ceremony at temple, pheras around sacred fire", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Griha Pravesh", description: "Bride enters new home", startTime: "16:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₹20–50 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Pheran (long robe) in maroon/gold with heavy silver/gold jewelry, taranga (head covering)",
      groom: "Pheran with turban and Kashmiri shoes (poonchoor)",
      guests: "Traditional Kashmiri pheran for men and women",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Kashmiri"],
      keyDishes: ["Rogan josh", "Dum aloo", "Gushtaba", "Sheermal", "Nooni roti", "Kahwa tea"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Kashmiri Pandit priest confirmed", "Puja samagri", "Sacred fire materials", "Flowers and garlands", "Mangal items", "Kahwa for guests"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU ASSAMESE
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Assamese",
    slug: "hindu-indian-assamese",
    country: "india",
    religion: "hindu",
    region: "Assamese",
    currency: "INR",
    events: [
      { name: "Pani Tula", description: "Water-fetching ceremony by bride", startTime: "06:00", duration: 60, isRitual: true, dayOffset: -2 },
      { name: "Tel Diya", description: "Oil application ceremony", startTime: "09:00", duration: 60, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Ghor Boron, Kanyadaan, Saptapadi", startTime: "08:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Mekhela chador (Assamese silk) in bright colors with traditional gold jewelry (lokaparo, galpata)",
      groom: "Dhoti-kurta with gamosa (traditional scarf) and traditional Assamese topi",
      guests: "Mekhela chador for women; dhoti-kurta with gamosa for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Assamese"],
      keyDishes: ["Khar", "Masor tenga (sour fish)", "Pitha", "Laru", "Assamese thali", "Payox (kheer)"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Assamese priest confirmed", "Puja samagri", "Sacred fire materials", "Flowers and gamosa", "Mangal items", "Betel nut and leaves"] },
    ],
    guestRange: { min: 150, typical: 300, max: 600 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU ODIA
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Odia",
    slug: "hindu-indian-odia",
    country: "india",
    religion: "hindu",
    region: "Odia",
    currency: "INR",
    events: [
      { name: "Daka Akshaya", description: "Formal proposal from groom's family", startTime: "11:00", duration: 60, isRitual: true, dayOffset: -7 },
      { name: "Nandi Puja", description: "Auspicious beginning ceremony", startTime: "10:00", duration: 60, isRitual: true, dayOffset: -3 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Kanyadaan, Mangal Pheras, Saptapadi", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Sambalpuri silk saree with traditional silver/terracotta jewelry",
      groom: "Dhoti-kurta with traditional Odia turban (tahiya)",
      guests: "Sarees for women; dhoti-kurta for men",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Odia"],
      keyDishes: ["Dalma", "Pakhala bhata", "Chhena poda", "Rasabali", "Dahi vada", "Besara"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Odia priest confirmed", "Puja samagri", "Sacred fire materials", "Flowers and garlands", "Mangal items", "Banana leaves"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU BIHARI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Bihari",
    slug: "hindu-indian-bihari",
    country: "india",
    religion: "hindu",
    region: "Bihari",
    currency: "INR",
    events: [
      { name: "Sagai", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Haldi", description: "Turmeric ceremony", startTime: "09:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Sat Paak", description: "Bride carried around groom 7 times", startTime: "08:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Wedding", description: "Kanyadaan, Mangal Pheras, Saptapadi", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Vidaai", description: "Bride's farewell", startTime: "14:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Red saree with gold jewelry, traditional Bihari tikli (head ornament)",
      groom: "Dhoti-kurta with pagri (turban) and sehra",
      guests: "Sarees for women; dhoti-kurta or kurta-pajama for men",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Bihari"],
      keyDishes: ["Litti chokha", "Thekua", "Khaja", "Chana ghugni", "Anarsa", "Pedha"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Bihari priest confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Mangal items"] },
    ],
    guestRange: { min: 300, typical: 500, max: 1000 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU MALAYALI (Kerala)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Malayali",
    slug: "hindu-indian-malayali",
    country: "india",
    religion: "hindu",
    region: "Malayali",
    currency: "INR",
    events: [
      { name: "Nischayam", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Kanyadaanam", description: "Father gives away bride", startTime: "08:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Pudamuri", description: "Groom gifts bride new clothes", startTime: "09:00", duration: 30, isRitual: true, dayOffset: 0 },
      { name: "Saptapadi", description: "Seven steps around sacred fire", startTime: "10:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Sadya", description: "Grand vegetarian feast on banana leaves", startTime: "12:00", duration: 120, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Kerala kasavu saree (white with gold border) with gold temple jewelry",
      groom: "White mundu (dhoti) with gold border and gold jewelry",
      guests: "Kasavu sarees for women; mundu-shirt for men",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Kerala"],
      keyDishes: ["Sadya on banana leaf", "Avial", "Sambar", "Rasam", "Payasam", "Banana chips", "Appam"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Kerala priest (pandaram) confirmed", "Puja samagri", "Mangalsutra (Thali)", "Sacred fire materials", "Flowers and garlands", "Banana leaves for sadya"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — HINDU SINDHI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hindu Sindhi",
    slug: "hindu-indian-sindhi",
    country: "india",
    religion: "hindu",
    region: "Sindhi",
    currency: "INR",
    events: [
      { name: "Lada", description: "Engagement ceremony with sweet exchange", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -2 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Baraat, Jaimala, Mangal Pheras, Kanyadaan", startTime: "10:00", duration: 240, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₹20–50 Lakh" },
      luxury: { min: 10000000, max: 30000000, label: "₹1–3 Crore" },
    },
    dressCodes: {
      bride: "Heavy gold lehenga with traditional Sindhi jewelry (tikka, borla, nath)",
      groom: "Sherwani with turban and traditional Sindhi mojari",
      guests: "Colorful ethnic wear; Sindhi dupattas for women",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Sindhi"],
      keyDishes: ["Sindhi dal pakwan", "Sai bhaji", "Sindhi biryani", "Mithai", "Malpua", "Gulab jamun"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Sindhi priest confirmed", "Puja samagri", "Havan kund", "Sacred fire materials", "Flowers and garlands", "Mangal items"] },
    ],
    guestRange: { min: 300, typical: 500, max: 1000 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — CHRISTIAN GOAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Christian Goan",
    slug: "christian-indian-goan",
    country: "india",
    religion: "christian",
    region: "Goan",
    currency: "INR",
    events: [
      { name: "Engagement", description: "Formal engagement", startTime: "19:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Roce Ceremony", description: "Coconut milk and turmeric applied to bride/groom", startTime: "17:00", duration: 120, isRitual: true, dayOffset: -1 },
      { name: "Church Wedding", description: "Catholic ceremony with vows and ring exchange", startTime: "10:00", duration: 90, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration with Goan food", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₹5–15 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "White wedding gown with veil (Portuguese influence)",
      groom: "Formal suit or tuxedo",
      guests: "Formal/smart attire; avoid white",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Goan"],
      keyDishes: ["Pork vindaloo", "Xacuti", "Bebinca", "Sanna", "Fish curry rice", "Dodol"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Church Requirements", items: ["Church booking confirmed", "Priest confirmed", "Pre-marriage counseling completed", "Banns announced", "Church decoration", "Music/choir arranged"] },
      { category: "Roce Ceremony", items: ["Turmeric paste", "Coconut milk", "Roce outfit", "Guest arrangements", "Music playlist", "Photography"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — CHRISTIAN KERALA (Syrian/Marthoma)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Christian Kerala",
    slug: "christian-indian-kerala",
    country: "india",
    religion: "christian",
    region: "Kerala",
    currency: "INR",
    events: [
      { name: "Koodam", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Church Wedding", description: "Syrian Christian ceremony with Mantrakodi", startTime: "10:00", duration: 90, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Kerala sadya feast", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "₹3–10 Lakh" },
      mid: { min: 1500000, max: 4000000, label: "₹15–40 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₹80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "White kasavu saree or white wedding gown with gold border",
      groom: "White mundu with shirt or formal suit",
      guests: "Formal white or cream attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Kerala Christian"],
      keyDishes: ["Appam and stew", "Duck roast", "Fish molee", "Beef fry", "Kerala sadya", "Wine cake"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Church Requirements", items: ["Church booking confirmed", "Priest/pastor confirmed", "Mantrakodi (bridal saree) prepared", "Church decoration", "Music/choir arranged", "Wedding bands"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — BUDDHIST LADAKHI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Buddhist Ladakhi",
    slug: "buddhist-indian-ladakhi",
    country: "india",
    religion: "buddhist",
    region: "Ladakhi",
    currency: "INR",
    events: [
      { name: "Khatag Ceremony", description: "Scarf offering and blessings", startTime: "10:00", duration: 60, isRitual: true, dayOffset: -2 },
      { name: "Wedding", description: "Monastery ceremony with monks chanting, khatag exchange", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Community Feast", description: "Traditional Ladakhi feast", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 500000, label: "₹2–5 Lakh" },
      mid: { min: 800000, max: 2000000, label: "₹8–20 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "₹50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Traditional goncha (robe) with perak (turquoise headdress)",
      groom: "Goncha with traditional Ladakhi hat",
      guests: "Traditional Ladakhi goncha for men and women",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Ladakhi", "Tibetan"],
      keyDishes: ["Thukpa", "Momos", "Butter tea", "Skyu", "Chhang (barley beer)", "Tigmo"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Monastery Requirements", items: ["Monastery booking confirmed", "Monk blessings arranged", "Khatags (scarves) prepared", "Prayer flags for decoration", "Butter lamps", "Traditional music"] },
    ],
    guestRange: { min: 100, typical: 200, max: 400 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — PARSI/ZOROASTRIAN
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Parsi",
    slug: "parsi-indian-parsi",
    country: "india",
    religion: "parsi",
    region: "Parsi",
    currency: "INR",
    events: [
      { name: "Ardibehest仪式", description: "Engagement with fire ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Mehendi", description: "Henna application", startTime: "16:00", duration: 120, isRitual: false, dayOffset: -1 },
      { name: "Wedding", description: "Haath Boravanu (tying hands), Lagan ceremony with Parsi priest", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Grand celebration with Parsi food", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 1000000, max: 3000000, label: "₹10–30 Lakh" },
      mid: { min: 3000000, max: 8000000, label: "₹30–80 Lakh" },
      luxury: { min: 15000000, max: 50000000, label: "₹1.5–5 Crore" },
    },
    dressCodes: {
      bride: "White/gold saree with head covering; traditional Parsi bride wears white",
      groom: "Black suit or sherwani",
      guests: "Formal Western or Indian attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Parsi"],
      keyDishes: ["Dhansak", "Berry pulao", "Ravo", "Lapsi", "Salli boti", "Lagan nu custard"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Priest Requirements", items: ["Parsi priest (Mobed) confirmed", "Fire ceremony (Atash) arranged", "Haath Boravanu items", "Lagan ceremony setup", "Flowers and decorations", "Parsi wedding attire"] },
    ],
    guestRange: { min: 100, typical: 300, max: 600 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // INDIA — CHRISTIAN NORTHEAST
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Christian Northeast",
    slug: "christian-indian-northeast",
    country: "india",
    religion: "christian",
    region: "Northeast",
    currency: "INR",
    events: [
      { name: "Engagement", description: "Community engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -2 },
      { name: "Church Wedding", description: "Christian ceremony with traditional hymns", startTime: "10:00", duration: 90, isRitual: true, dayOffset: 0 },
      { name: "Community Feast", description: "Traditional tribal feast with community", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Reception", description: "Post-wedding celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 500000, label: "₹2–5 Lakh" },
      mid: { min: 800000, max: 2000000, label: "₹8–20 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "₹50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Traditional tribal woven shawl/attire or white wedding gown",
      groom: "Traditional tribal shawl or formal suit",
      guests: "Traditional tribal attire or formal wear",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Northeast Indian"],
      keyDishes: ["Smoked meat", "Bamboo shoot curry", "Rice", "Fish", "Fermented vegetables", "Local rice beer"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Church Requirements", items: ["Church booking confirmed", "Pastor confirmed", "Traditional hymns selected", "Church decoration", "Community feast arranged", "Photography"] },
    ],
    guestRange: { min: 100, typical: 300, max: 500 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — SINDHI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sindhi Pakistani",
    slug: "muslim-pakistani-sindhi",
    country: "pakistan",
    religion: "muslim",
    region: "Sindhi",
    currency: "PKR",
    events: [
      { name: "Pakhru", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Sangeet", description: "Music and dance night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -2 },
      { name: "Mehndi", description: "Henna night", startTime: "19:00", duration: 240, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Rukhsati", description: "Bride's farewell", startTime: "15:00", duration: 60, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Grand reception", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 1500000, max: 3000000, label: "₨15–30 Lakh" },
      mid: { min: 3000000, max: 8000000, label: "₨30–80 Lakh" },
      luxury: { min: 15000000, max: 40000000, label: "₨1.5–4 Crore" },
    },
    dressCodes: {
      bride: "Red/gold lehenga with ajrak-patterned embroidery, heavy gold jewelry",
      groom: "Sherwani with ajrak shawl and turban",
      guests: "Jewel tones; ajrak patterns appreciated",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Sindhi"],
      keyDishes: ["Sindhi biryani", "Sai bhaji", "Dal pakwan", "Seekh kebabs", "Mithai", "Sheer khurma"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
      { category: "Sindhi Traditions", items: ["Ajrak cloth for ceremonies", "Traditional Sindhi sweets", "Dholki players booked", "Rukhsati items prepared", "Gifts for bride's new home", "Photography"] },
    ],
    guestRange: { min: 300, typical: 600, max: 1500 },
    planningMonths: 12,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — BALOCH
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Baloch Pakistani",
    slug: "muslim-pakistani-baloch",
    country: "pakistan",
    religion: "muslim",
    region: "Baloch",
    currency: "PKR",
    events: [
      { name: "Nikah", description: "Simple community Nikah with tribal elders", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Tribal gathering and feast", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₨5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₨20–50 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₨80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Traditional Balochi embroidered dress with silver jewelry and coins",
      groom: "Shalwar kameez with turban and waistcoat",
      guests: "Traditional Balochi attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Balochi"],
      keyDishes: ["Sajji (whole lamb)", "Lamb kebabs", "Rice dishes", "Dates", "Nan", "Dahi"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Tribal elders as witnesses", "Mullah (officiant) confirmed", "Quran for ceremony", "Community hall booking"] },
    ],
    guestRange: { min: 200, typical: 500, max: 1000 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // PAKISTAN — KASHMIRI
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Kashmiri Pakistani",
    slug: "muslim-pakistani-kashmiri",
    country: "pakistan",
    religion: "muslim",
    region: "Kashmiri",
    currency: "PKR",
    events: [
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Wazwan", description: "Traditional Kashmiri feast", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
      { name: "Walima", description: "Reception", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 1 },
    ],
    budgetRanges: {
      budget: { min: 500000, max: 1500000, label: "₨5–15 Lakh" },
      mid: { min: 2000000, max: 5000000, label: "₨20–50 Lakh" },
      luxury: { min: 8000000, max: 20000000, label: "₨80 Lakh–2 Crore" },
    },
    dressCodes: {
      bride: "Pheran in gold/red with traditional Kashmiri jewelry",
      groom: "Pheran with turban",
      guests: "Traditional Kashmiri pheran for all",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Kashmiri"],
      keyDishes: ["Wazwan — rogan josh, gushtaba, rista, tabakh maaz", "Sheermal", "Kahwa tea"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two male Muslim witnesses", "Qazi (officiant) confirmed", "Quran for ceremony", "Wazwan caterer booked"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 10,
  },

  // ═══════════════════════════════════════════════════════════════
  // AFGHANISTAN — TAJIK
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Afghan Tajik",
    slug: "muslim-afghan-tajik",
    country: "afghanistan",
    religion: "muslim",
    region: "Tajik",
    currency: "AFN",
    events: [
      { name: "Shirni Khori", description: "Engagement with sweets", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Mehndi", description: "Henna night", startTime: "19:00", duration: 180, isRitual: false, dayOffset: -1 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Grand celebration with traditional music", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 300000, max: 1000000, label: "؋3–10 Lakh" },
      mid: { min: 1000000, max: 5000000, label: "؋10–50 Lakh" },
      luxury: { min: 5000000, max: 10000000, label: "؋50 Lakh–1 Crore" },
    },
    dressCodes: {
      bride: "Colorful dress with specific Tajik embroidery and silver jewelry",
      groom: "Shalwar kameez with waistcoat and turban",
      guests: "Formal traditional attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Tajik Afghan"],
      keyDishes: ["Pulao (pilaf)", "Kebabs", "Mantu (dumplings)", "Bolani", "Fresh fruits", "Naan"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount documented", "Two Muslim witnesses", "Mullah (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
    ],
    guestRange: { min: 200, typical: 500, max: 1000 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // AFGHANISTAN — HAZARA (Shia)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Afghan Hazara",
    slug: "muslim-afghan-hazara",
    country: "afghanistan",
    religion: "muslim",
    region: "Hazara",
    currency: "AFN",
    events: [
      { name: "Shirni Khori", description: "Engagement with sweets", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Nikah", description: "Shia Nikah ceremony", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Walima", description: "Grand celebration", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 800000, label: "؋2–8 Lakh" },
      mid: { min: 800000, max: 3000000, label: "؋8–30 Lakh" },
      luxury: { min: 3000000, max: 8000000, label: "؋30–80 Lakh" },
    },
    dressCodes: {
      bride: "Brightly colored dress with coin jewelry and specific Hazara embroidery",
      groom: "Shalwar kameez with chapan (coat)",
      guests: "Traditional Hazara attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Hazara"],
      keyDishes: ["Kabuli pulao", "Mantu (dumplings)", "Bolani", "Ashak (leek dumplings)", "Rice and meat", "Fresh fruits"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Shia Mullah (officiant) confirmed", "Two Muslim witnesses", "Quran for ceremony", "Venue booking"] },
    ],
    guestRange: { min: 200, typical: 400, max: 800 },
    planningMonths: 6,
  },

  // ═══════════════════════════════════════════════════════════════
  // AFGHANISTAN — UZBEK
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Afghan Uzbek",
    slug: "muslim-afghan-uzbek",
    country: "afghanistan",
    religion: "muslim",
    region: "Uzbek",
    currency: "AFN",
    events: [
      { name: "Fatiha", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -5 },
      { name: "Nikah", description: "Islamic marriage contract", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Uzeri", description: "Community feast with traditional music", startTime: "19:00", duration: 240, isRitual: true, dayOffset: 0, isSimultaneous: true },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 800000, label: "؋2–8 Lakh" },
      mid: { min: 800000, max: 3000000, label: "؋8–30 Lakh" },
      luxury: { min: 3000000, max: 8000000, label: "؋30–80 Lakh" },
    },
    dressCodes: {
      bride: "Brightly colored dress with specific Uzbek embroidery patterns",
      groom: "Chapan (robe) with turban",
      guests: "Traditional Uzbek attire",
    },
    foodDefaults: {
      type: "non_vegetarian",
      staples: ["Uzbek"],
      keyDishes: ["Plov (pilaf)", "Somsa (samosa)", "Kebabs", "Non (bread)", "Manti", "Kumys (fermented milk)"],
      restrictions: ["No pork", "No alcohol", "Halal only"],
    },
    checklistItems: [
      { category: "Nikah Preparation", items: ["Nikah-nama (marriage contract)", "Mahr amount decided", "Two Muslim witnesses", "Mullah (officiant) confirmed", "Quran for ceremony", "Venue booking"] },
    ],
    guestRange: { min: 150, typical: 400, max: 800 },
    planningMonths: 6,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — SHERPA/TIBETAN BUDDHIST
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Sherpa Buddhist",
    slug: "buddhist-nepali-sherpa",
    country: "nepal",
    religion: "buddhist",
    region: "Sherpa",
    currency: "NPR",
    events: [
      { name: "Kura Thapne", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Wedding", description: "Monastery ceremony with monks chanting, khatag offering", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Community Feast", description: "Traditional Sherpa feast", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 3000, max: 8000, label: "$3,000–$8,000" },
      mid: { min: 10000, max: 25000, label: "$10,000–$25,000" },
      luxury: { min: 25000, max: 40000, label: "$25,000–$40,000" },
    },
    dressCodes: {
      bride: "Traditional chuba (robe) with turquoise/jade jewelry",
      groom: "Chuba with traditional Sherpa hat",
      guests: "Traditional Sherpa chuba for all",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Sherpa", "Tibetan"],
      keyDishes: ["Tsampa", "Momos", "Thukpa", "Butter tea", "Chang (beer)", "Dried yak meat"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Monastery Requirements", items: ["Monastery booking confirmed", "Monk blessings arranged", "Khatags (scarves) prepared", "Prayer flags", "Butter lamps", "Traditional music"] },
    ],
    guestRange: { min: 50, typical: 150, max: 300 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // NEPAL — TAMANG
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Tamang",
    slug: "hindu-nepali-tamang",
    country: "nepal",
    religion: "hindu",
    region: "Tamang",
    currency: "NPR",
    events: [
      { name: "Kura Thapne", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Wedding", description: "Buddhist-influenced Hindu ceremony with community feast", startTime: "10:00", duration: 180, isRitual: true, dayOffset: 0 },
      { name: "Community Feast", description: "Traditional Tamang feast with music and dance", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 2000, max: 5000, label: "$2,000–$5,000" },
      mid: { min: 8000, max: 20000, label: "$8,000–$20,000" },
      luxury: { min: 20000, max: 35000, label: "$20,000–$35,000" },
    },
    dressCodes: {
      bride: "Traditional Tamang dress with bead jewelry and dhaka topi",
      groom: "Daura suruwal with dhaka topi and traditional Tamang vest",
      guests: "Traditional Tamang attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Tamang"],
      keyDishes: ["Dhindo", "Gundruk", "Meat curry", "Sel roti", "Rice", "Local rice beer (tongba)"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Tamang Traditions", items: ["Traditional drummer (damphu) booked", "Community feast arranged", "Traditional dance performers", "Dhaka topi for groom", "Bead jewelry for bride", "Blessings from elders"] },
    ],
    guestRange: { min: 100, typical: 250, max: 500 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // BANGLADESH — CHAKMA (Buddhist)
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Chakma Buddhist",
    slug: "buddhist-bangladeshi-chakma",
    country: "bangladesh",
    religion: "buddhist",
    region: "Chakma",
    currency: "BDT",
    events: [
      { name: "Sampradan", description: "Engagement ceremony", startTime: "11:00", duration: 120, isRitual: true, dayOffset: -3 },
      { name: "Wedding", description: "Buddhist ceremony with monks chanting, thread tying", startTime: "10:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Community Feast", description: "Traditional Chakma feast", startTime: "13:00", duration: 180, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 100000, max: 300000, label: "৳1–3 Lakh" },
      mid: { min: 300000, max: 800000, label: "৳3–8 Lakh" },
      luxury: { min: 800000, max: 1500000, label: "৳8–15 Lakh" },
    },
    dressCodes: {
      bride: "Traditional pinon-hadi (woven textile) with silver jewelry",
      groom: "Traditional Chakma dhoti and shirt with turban",
      guests: "Traditional Chakma woven attire",
    },
    foodDefaults: {
      type: "mixed",
      staples: ["Chakma"],
      keyDishes: ["Bamboo shoot curry", "Rice", "Fish", "Fermented bamboo", "Traditional sweets"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Buddhist Ceremony", items: ["Monk/priest confirmed", "Buddhist prayer items", "Thread for tying ceremony", "Flowers for offering", "Community hall booking", "Traditional music"] },
    ],
    guestRange: { min: 100, typical: 200, max: 400 },
    planningMonths: 8,
  },

  // ═══════════════════════════════════════════════════════════════
  // SRI LANKA — HILL COUNTRY TAMIL
  // ═══════════════════════════════════════════════════════════════
  {
    name: "Hill Country Tamil",
    slug: "hindu-sri_lankan-hillcountry",
    country: "sri_lanka",
    religion: "hindu",
    region: "Hill Country Tamil",
    currency: "LKR",
    events: [
      { name: "Engagement", description: "Simple engagement ceremony", startTime: "11:00", duration: 60, isRitual: true, dayOffset: -2 },
      { name: "Wedding", description: "Simplified Hindu ceremony with thali tying", startTime: "09:00", duration: 120, isRitual: true, dayOffset: 0 },
      { name: "Reception", description: "Community celebration", startTime: "19:00", duration: 240, isRitual: false, dayOffset: 0 },
    ],
    budgetRanges: {
      budget: { min: 200000, max: 500000, label: "Rs2–5 Lakh" },
      mid: { min: 500000, max: 1500000, label: "Rs5–15 Lakh" },
      luxury: { min: 2000000, max: 5000000, label: "Rs20–50 Lakh" },
    },
    dressCodes: {
      bride: "Green or red saree with gold jewelry",
      groom: "White veshti with shirt",
      guests: "Simple traditional attire",
    },
    foodDefaults: {
      type: "vegetarian",
      staples: ["Tamil"],
      keyDishes: ["Rice and curry", "Sambar", "Rasam", "Payasam", "Vegetable dishes"],
      restrictions: [],
    },
    checklistItems: [
      { category: "Emergency Kit", items: ["Safety pins", "Sewing kit", "Pain relievers", "Tissues", "Phone charger", "Cash for tips"] },
      { category: "Priest Requirements", items: ["Hindu priest confirmed", "Thaali (mangalsutra)", "Flowers and garlands", "Puja samagri", "Banana leaves", "Coconut for ceremony"] },
    ],
    guestRange: { min: 100, typical: 200, max: 400 },
    planningMonths: 8,
  },
];

// ═══════════════════════════════════════════════════════════════
// COUNTRY CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const COUNTRIES = [
  { id: "india", name: "India", flag: "\uD83C\uDDEE\uD83C\uDDF3", currency: "INR" },
  { id: "pakistan", name: "Pakistan", flag: "\uD83C\uDDF5\uD83C\uDDF0", currency: "PKR" },
  { id: "bangladesh", name: "Bangladesh", flag: "\uD83C\uDDE7\uD83C\uDDE9", currency: "BDT" },
  { id: "sri_lanka", name: "Sri Lanka", flag: "\uD83C\uDDF1\uD83C\uDDF0", currency: "LKR" },
  { id: "nepal", name: "Nepal", flag: "\uD83C\uDDF3\uD83C\uDDF5", currency: "NPR" },
  { id: "maldives", name: "Maldives", flag: "\uD83C\uDDF2\uD83C\uDDFB", currency: "MVR" },
  { id: "afghanistan", name: "Afghanistan", flag: "\uD83C\uDDE6\uD83C\uDDEB", currency: "AFN" },
  { id: "bhutan", name: "Bhutan", flag: "\uD83C\uDDE7\uD83C\uDDF9", currency: "BTN" },
] as const;

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  india: ["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Nashik", "Jaipur", "Ahmedabad", "Kolkata", "Chennai", "Goa", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Coimbatore", "Kochi", "Thiruvananthapuram", "Other"],
  pakistan: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Other"],
  bangladesh: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Comilla", "Other"],
  sri_lanka: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Matara", "Anuradhapura", "Other"],
  nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", "Birgunj", "Dharan", "Other"],
  maldives: ["Male", "Hulhumale", "Addu City", "Fuvahmulah", "Resort/Island", "Other"],
  afghanistan: ["Kabul", "Herat", "Mazar-i-Sharif", "Jalalabad", "Kandahar", "Kunduz", "Other"],
  bhutan: ["Thimphu", "Paro", "Punakha", "Jakar", "Gelephu", "Samdrup Jongkhar", "Other"],
};

export const CITIES_BY_REGION: Record<string, string[]> = {
  "North Indian": ["Delhi NCR", "Jaipur", "Chandigarh", "Lucknow", "Bhopal", "Indore", "Agra", "Varanasi", "Dehradun", "Shimla", "Other"],
  "South Indian": ["Bangalore", "Hyderabad", "Chennai", "Coimbatore", "Kochi", "Thiruvananthapuram", "Mysore", "Visakhapatnam", "Tiruchirappalli", "Madurai", "Other"],
  "Bengali": ["Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Other"],
  "Gujarati": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Junagadh", "Other"],
  "Maharashtrian": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Solapur", "Other"],
  "Rajput": ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota", "Bikaner", "Jaisalmer", "Other"],
  "Punjabi": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Other"],
  "Kashmiri": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Other"],
  "Assamese": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Other"],
  "Odia": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Other"],
  "Bihari": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Other"],
  "Malayali": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kottayam", "Kollam", "Other"],
  "Sindhi": ["Mumbai", "Ahmedabad", "Hyderabad", "Other"],
  "Ladakhi": ["Leh", "Kargil", "Other"],
  "Indian Christian": ["Mumbai", "Goa", "Kochi", "Chennai", "Bangalore", "Delhi NCR", "Other"],
  "Goan Christian": ["Goa", "Mumbai", "Other"],
  "Kerala Christian": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kottayam", "Other"],
  "Northeast Christian": ["Guwahati", "Shillong", "Imphal", "Aizawl", "Kohima", "Other"],
  "Indian Buddhist": ["Mumbai", "Delhi NCR", "Nagpur", "Pune", "Other"],
  "Indian Jain": ["Mumbai", "Ahmedabad", "Delhi NCR", "Pune", "Jaipur", "Other"],
  "Indian Parsi": ["Mumbai", "Pune", "Ahmedabad", "Other"],
  "Sunni": ["Delhi NCR", "Mumbai", "Hyderabad", "Lucknow", "Kolkata", "Other"],
  "Sindhi Muslim": ["Karachi", "Hyderabad", "Other"],
  "Baloch": ["Quetta", "Karachi", "Other"],
  "Kashmiri Muslim": ["Srinagar", "Jammu", "Baramulla", "Other"],
  "Pashtun": ["Peshawar", "Kabul", "Quetta", "Other"],
  "Tajik": ["Kabul", "Mazar-i-Sharif", "Herat", "Other"],
  "Hazara": ["Kabul", "Ghazni", "Other"],
  "Uzbek": ["Kabul", "Mazar-i-Sharif", "Other"],
  "Tamang": ["Kathmandu", "Pokhara", "Other"],
  "Newari": ["Kathmandu", "Lalitpur", "Bhaktapur", "Other"],
  "Sherpa": ["Kathmandu", "Namche Bazaar", "Other"],
  "Nepali Muslim": ["Kathmandu", "Other"],
  "Sinhalese": ["Colombo", "Kandy", "Galle", "Other"],
  "Tamil Hindu": ["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Other"],
  "Hill Country Tamil": ["Colombo", "Kandy", "Nuwara Eliya", "Other"],
  "Chakma": ["Chittagong Hill Tracts", "Dhaka", "Other"],
  "Bangladeshi Hindu": ["Kolkata", "Dhaka", "Chittagong", "Other"],
  "Bangladeshi Buddhist": ["Chittagong", "Dhaka", "Other"],
  "Maldivian": ["Male", "Hulhumale", "Addu City", "Other"],
  "Sri Lankan Muslim": ["Colombo", "Kandy", "Other"],
  "Sri Lankan Christian": ["Colombo", "Negombo", "Galle", "Other"],
  "Ngalop": ["Thimphu", "Paro", "Punakha", "Wangdue Phodrang", "Haa", "Gasa", "Other"],
  "Lhotshampa": ["Gelephu", "Sarpang", "Samdrup Jongkhar", "Other"],
};

export const RELIGIONS_BY_COUNTRY: Record<string, Array<{ id: string; name: string }>> = {
  india: [
    { id: "hindu", name: "Hindu" },
    { id: "muslim", name: "Muslim" },
    { id: "sikh", name: "Sikh" },
    { id: "christian", name: "Christian" },
    { id: "jain", name: "Jain" },
    { id: "buddhist", name: "Buddhist" },
    { id: "parsi", name: "Parsi" },
  ],
  pakistan: [
    { id: "muslim", name: "Muslim" },
    { id: "hindu", name: "Hindu" },
    { id: "christian", name: "Christian" },
  ],
  bangladesh: [
    { id: "muslim", name: "Muslim" },
    { id: "hindu", name: "Hindu" },
  ],
  sri_lanka: [
    { id: "buddhist", name: "Buddhist" },
    { id: "hindu", name: "Hindu" },
    { id: "christian", name: "Christian (Catholic)" },
    { id: "muslim", name: "Muslim" },
  ],
  nepal: [
    { id: "hindu", name: "Hindu" },
    { id: "buddhist", name: "Buddhist" },
    { id: "muslim", name: "Muslim" },
  ],
  maldives: [
    { id: "muslim", name: "Muslim" },
  ],
  afghanistan: [
    { id: "muslim", name: "Muslim" },
  ],
  bhutan: [
    { id: "buddhist", name: "Buddhist" },
    { id: "hindu", name: "Hindu" },
  ],
};

export function getTemplateSlug(country: string, religion: string, region: string): string {
  const countryMap: Record<string, string> = {
    india: "indian",
    pakistan: "pakistani",
    bangladesh: "bangladeshi",
    sri_lanka: "sri_lankan",
    nepal: "nepali",
    maldives: "maldivian",
    afghanistan: "afghan",
    bhutan: "bhutanese",
  };
  return `${religion}-${countryMap[country] || country}-${region.toLowerCase().replace(/\s+/g, "-")}`;
}

export function findTemplate(country: string, religion: string, region: string): WeddingTemplateData | undefined {
  const slug = getTemplateSlug(country, religion, region);
  return WEDDING_TEMPLATES.find((t) => t.slug === slug);
}

export function getTemplatesForCountry(country: string): WeddingTemplateData[] {
  return WEDDING_TEMPLATES.filter((t) => t.country === country);
}

export function getTemplatesForReligion(country: string, religion: string): WeddingTemplateData[] {
  return WEDDING_TEMPLATES.filter((t) => t.country === country && t.religion === religion);
}
