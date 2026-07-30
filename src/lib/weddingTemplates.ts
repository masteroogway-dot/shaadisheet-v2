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
] as const;

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  india: ["Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Nashik", "Jaipur", "Ahmedabad", "Kolkata", "Chennai", "Goa", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Coimbatore", "Kochi", "Thiruvananthapuram", "Other"],
  pakistan: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Other"],
  bangladesh: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Comilla", "Other"],
  sri_lanka: ["Colombo", "Kandy", "Galle", "Jaffna", "Negombo", "Matara", "Anuradhapura", "Other"],
  nepal: ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", "Birgunj", "Dharan", "Other"],
  maldives: ["Male", "Hulhumale", "Addu City", "Fuvahmulah", "Resort/Island", "Other"],
  afghanistan: ["Kabul", "Herat", "Mazar-i-Sharif", "Jalalabad", "Kandahar", "Kunduz", "Other"],
};

export const RELIGIONS_BY_COUNTRY: Record<string, Array<{ id: string; name: string }>> = {
  india: [
    { id: "hindu", name: "Hindu" },
    { id: "muslim", name: "Muslim" },
    { id: "sikh", name: "Sikh" },
    { id: "christian", name: "Christian" },
    { id: "jain", name: "Jain" },
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
