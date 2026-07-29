# ShaadiSheet South Asian Wedding Expansion

## Current State
- **5 religions supported**: Hindu, Muslim, Sikh, Christian, Jain
- **India-only**: budget in INR, Indian cities, Indian-centric food/dress defaults
- **5 religions × ~7 regions = ~35 wedding types**
- **Event templates hardcoded** in `Onboarding.tsx` and `actions.ts`

## Target State
- **7 countries**: India, Pakistan, Bangladesh, Sri Lanka, Nepal, Maldives, Afghanistan
- **16+ wedding traditions**: Hindu (North/South), Muslim, Sikh, Jain, Christian, Buddhist, Newari, etc.
- **7 currencies**: INR, PKR, BDT, LKR, NPR, MVR, AFN
- **~50+ wedding types** (country × religion × region combinations)
- **Dynamic event templates** driven by country + religion + region
- **Culture-specific sidebar sections** (checklists, food defaults, dress codes)

---

## Part 1: Data Model Changes

### New Fields on Wedding Model

```prisma
model Wedding {
  // ... existing fields ...

  // NEW: South Asian expansion
  country        String   @default("india")      // india, pakistan, bangladesh, sri_lanka, nepal, maldives, afghanistan
  currency       String   @default("INR")        // INR, PKR, BDT, LKR, NPR, MVR, AFN
  dietaryDefault String   @default("mixed")      // vegetarian, non_vegetarian, jain, halal, buddhist, mixed
  guestCountMin  Int      @default(100)          // suggested range min
  guestCountMax  Int      @default(500)          // suggested range max
  templateId     String?                        // reference to WeddingTemplate
}
```

### New WeddingTemplate Model

```prisma
model WeddingTemplate {
  id             String   @id @default(cuid())
  name           String                        // "Punjabi Hindu", "Bengali Muslim", "Sinhalese Buddhist"
  slug           String   @unique              // "hindu-north-indian", "muslim-pakistani-sunni"
  country        String                        // india, pakistan, bangladesh, sri_lanka, nepal, maldives, afghanistan
  religion       String                        // hindu, muslim, sikh, christian, buddhist, jain
  region         String                        // north_indian, south_indian, punjabi, bengali, tamil, etc.
  events         String                        // JSON: preset events with timings
  budgetRanges   String   @default("{}")       // JSON: {budget: {min,max}, mid: {min,max}, luxury: {min,max}}
  dressCodes     String   @default("{}")       // JSON: {bride: "...", groom: "...", guests: "..."}
  foodDefaults   String   @default("{}")       // JSON: {type: "veg/non-veg/halal", staples: [...], restrictions: [...]}
  checklistItems String   @default("[]")       // JSON: [{category: "...", items: [...]}]
  guestRange     String   @default("{}")       // JSON: {min: 100, typical: 300, max: 800}
  planningMonths Int      @default(12)          // recommended planning months
  isPremium      Boolean  @default(false)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Part 2: Country × Religion × Region Matrix

### India (Country: `india`, Currency: `INR`)

| Religion | Region | Template Slug | Events | Budget Range (INR) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Hindu | North Indian | `hindu-north-indian` | Roka, Engagement, Mehendi, Sangeet, Haldi, Wedding, Reception | 5L–5Cr | 200–800 |
| Hindu | South Indian | `hindu-south-indian` | Nischayam, Mehendi, Wedding (Kanyadaanam, Thali), Griha Pravesh | 3L–1Cr | 100–500 |
| Hindu | Bengali | `hindu-bengali` | Dodhi Mangal, Gaye Holud, Shubho Drishti, Wedding, Bou Bhat | 5L–1Cr | 200–600 |
| Hindu | Gujarati | `hindu-gujarati` | Gol Dhana, Mehendi, Pithi, Wedding, Reception | 5L–2Cr | 200–700 |
| Hindu | Maharashtrian | `hindu-maharashtrian` | Sakhar Puda, Mehendi, Wedding, Reception | 5L–1.5Cr | 200–500 |
| Hindu | Rajput | `hindu-rajput` | Pithi Dhar, Mehendi, Wedding, Reception | 10L–3Cr | 300–800 |
| Muslim | Indian | `muslim-indian` | Mangni, Mehendi, Nikah, Walima | 5L–2Cr | 200–600 |
| Sikh | Punjabi | `sikh-punjabi` | Roka, Mehendi, Sangeet, Jaggo, Anand Karaj, Langar, Reception | 25L–2.5Cr | 250–500 |
| Jain | Digambar/Shwetambar | `jain-indian` | Vagdana, Sagai, Mehendi, Haldi, Wedding, Reception | 30L–2Cr | 200–700 |
| Christian | Goan/Kerala/Mangalorean | `christian-indian` | Roce, Church Wedding, Reception | 7.5L–50L | 200–1000 |

### Pakistan (Country: `pakistan`, Currency: `PKR`)

| Religion | Region | Template Slug | Events | Budget Range (PKR) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Muslim | Punjabi | `muslim-pakistani-punjabi` | Dholki, Mayun, Mehndi, Baraat, Nikah, Walima | 15L–5Cr | 300–1500 |
| Muslim | Sindhi | `muslim-pakistani-sindhi` | Dholki, Mehndi, Baraat, Nikah, Walima | 10L–2Cr | 200–800 |
| Muslim | Pashtun | `muslim-pakistani-pashtun` | Dholki, Khwara, Mehndi, Nikah, Walima | 10L–5Cr | 300–1000 |

### Bangladesh (Country: `bangladesh`, Currency: `BDT`)

| Religion | Region | Template Slug | Events | Budget Range (BDT) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Muslim | Bengali | `muslim-bangladeshi` | Gaye Holud, Mehendi, Nikah, Walima, Bou Bhat | 3L–20L | 300–1000 |
| Hindu | Bengali | `hindu-bangladeshi` | Gaye Holud, Dodhi Mangal, Shubho Drishti, Wedding, Bou Bhat | 2L–15L | 200–600 |

### Sri Lanka (Country: `sri_lanka`, Currency: `LKR`)

| Religion | Region | Template Slug | Events | Budget Range (USD) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Buddhist | Sinhalese | `buddhist-sinhalese` | Nekath, Poruwa Ceremony, Kiribath | $3K–$80K | 100–500 |
| Hindu | Tamil | `hindu-tamil-sri_lanka` | Horoscope, Kanyadaanam, Thaali, Saptapadi | $5K–$30K | 150–500 |

### Nepal (Country: `nepal`, Currency: `NPR`)

| Religion | Region | Template Slug | Events | Budget Range (USD) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Hindu | Nepali | `hindu-nepali` | Tika-Tala, Janti, Swayamvar, Sindoor, Bidaai | $5K–$40K+ | 200–500 |
| Hindu/Buddhist | Newari | `hindu-newari` | Ihi, Supari, Swayamvar, Sindoor, Ahunakegu | $5K–$30K | 200–500 |

### Maldives (Country: `maldives`, Currency: `MVR`)

| Religion | Region | Template Slug | Events | Budget Range (USD) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Muslim | Maldivian | `muslim-maldivian` | Henna, Nikah, Boduberu, Valimah | $3K–$400K | 2–50 |

### Afghanistan (Country: `afghanistan`, Currency: `AFN`)

| Religion | Region | Template Slug | Events | Budget Range (USD) | Guest Range |
|----------|--------|---------------|--------|-------------------|-------------|
| Muslim | Pashtun | `muslim-afghan-pashtun` | Khwara, Shirni Khori, Henna, Nikah, Walima | $4.5K–$76K | 300–1000 |
| Muslim | Tajik | `muslim-afghan-tajik` | Khwara, Henna, Nikah, Walima | $4K–$60K | 200–800 |
| Muslim (Shia) | Hazara | `muslim-afghan-hazara` | Khwara, Henna, Nikah, Walima | $4K–$50K | 200–500 |

---

## Part 3: UI/UX Changes

### 3.1 Onboarding Flow Redesign

**Current flow** (7 steps):
1. Religion → 2. Region → 3. Budget → 4. Guest count → 5. Wedding days → 6. Events → 7. Date/City/Name

**New flow** (8 steps):
1. **Country** (7 options with flags) → new
2. **Religion/Sect** (dynamic based on country) → modified
3. **Region/Community** (dynamic based on country + religion) → modified
4. **Budget** (dynamic currency with local ranges) → modified
5. **Guest count** (dynamic range per tradition) → modified
6. **Wedding days** (dynamic range per tradition) → modified
7. **Events** (pre-populated from template, editable) → modified
8. **Date, City, Name** (country-specific city list) → modified

#### Country Selection UI
```
┌─────────────────────────────────────────────┐
│  Where is your wedding?                     │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │   🇮🇳    │  │   🇵🇰    │  │   🇧🇩    │    │
│  │  India  │  │ Pakistan│  │Bangladesh│    │
│  └─────────┘  └─────────┘  └─────────┘    │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │   🇱🇰    │  │   🇳🇵    │  │   🇲🇻    │    │
│  │Sri Lanka│  │  Nepal  │  │ Maldives│    │
│  └─────────┘  └─────────┘  └─────────┘    │
│                                             │
│  ┌─────────┐                                │
│  │   🇦🇫    │                                │
│  │Afghanistan│                               │
│  └─────────┘                                │
└─────────────────────────────────────────────┘
```

### 3.2 City Lists by Country

**India**: Mumbai, Delhi NCR, Bangalore, Hyderabad, Pune, Nashik, Jaipur, Ahmedabad, Kolkata, Chennai, Goa, Lucknow, Chandigarh, Bhopal, Indore, Coimbatore, Kochi, Thiruvananthapuram, Other

**Pakistan**: Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, Gujranwala, Other

**Bangladesh**: Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Comilla, Other

**Sri Lanka**: Colombo, Kandy, Galle, Jaffna, Negombo, Matara, Anuradhapura, Other

**Nepal**: Kathmandu, Pokhara, Lalitpur, Bhaktapur, Biratnagar, Birgunj, Dharan, Other

**Maldives**: Male, Hulhumale, Addu City, Fuvahmulah, Other (Resort/Island)

**Afghanistan**: Kabul, Herat, Mazar-i-Sharif, Jalalabad, Kandahar, Kunduz, Other

---

## Part 4: Sidebar Navigation Changes

### Current Sidebar
```
Planning:    Overview, Budget, Vendors, Guests, Events, Tasks
Logistics:   Seating, Rooms, Timeline, Gift Tracker, Outfit Planner, Invites
Checklists:  Emergency Kit, Priest Requirements, Vidaai Essentials
Fun:         Hashtag Generator
```

### Proposed Dynamic Sidebar
```
Planning:    Overview, Budget, Vendors, Guests, Events, Tasks
Logistics:   Seating, Rooms, Timeline, Gift Tracker, Outfit Planner, Invites
Checklists:  [Dynamic based on wedding type]
             - Hindu: Emergency Kit, Priest Requirements, Vidaai Essentials
             - Muslim: Nikah Preparation, Mehendi Night, Walima Essentials
             - Sikh: Gurdwara Requirements, Anand Karaj Essentials, Langar Planning
             - Buddhist: Poruwa Preparation, Nekath Planning
             - Jain: Jain Catering Rules, Ceremony Essentials
Fun:         Hashtag Generator
```

### Checklist Presets by Wedding Type

| Wedding Type | Checklist Categories |
|-------------|---------------------|
| Hindu North Indian | Emergency Kit, Priest Requirements, Vidaai Essentials, Mandap Decor |
| Hindu South Indian | Emergency Kit, Priest Requirements, Temple Ceremony, Banana Leaf Sadya |
| Muslim | Nikah Preparation, Mehendi Night, Walima Essentials, Halal Catering |
| Sikh | Gurdwara Requirements, Anand Karaj Essentials, Langar Planning, Chooda Ceremony |
| Buddhist | Poruwa Preparation, Nekath Planning, Oil Ceremony |
| Jain | Jain Catering Rules (no root veg), Ceremony Essentials, Purity Guidelines |
| Christian | Church Requirements, Roce Ceremony, Reception Planning |
| Afghan | Nikah Preparation, Attan Dance Planning, Mahr Documentation |
| Nepali | Janti Planning, Panche Baja, Dubo Ko Mala, Mukh Herne |
| Maldivian | Nikah Preparation, Boduberu Performance, Resort Coordination |

---

## Part 5: Currency & Budget Handling

### Currency Formatting

```typescript
const CURRENCY_CONFIG: Record<string, { symbol: string; code: string; locale: string; format: (n: number) => string }> = {
  INR: { symbol: "₹", code: "INR", locale: "en-IN", format: formatINR },        // ₹30,00,000
  PKR: { symbol: "₨", code: "PKR", locale: "en-PK", format: formatPKR },        // ₨30,00,000
  BDT: { symbol: "৳", code: "BDT", locale: "bn-BD", format: formatBDT },        // ৳30,00,000
  LKR: { symbol: "Rs", code: "LKR", locale: "si-LK", format: formatLKR },       // Rs 30,00,000
  NPR: { symbol: "₨", code: "NPR", locale: "ne-NP", format: formatNPR },        // ₨30,00,000
  MVR: { symbol: "Rf", code: "MVR", locale: "dv-MV", format: formatMVR },       // Rf 3,00,000
  AFN: { symbol: "؋", code: "AFN", locale: "fa-AF", format: formatAFN },        // ؋30,00,000
};
```

### Budget Range Presets per Tradition

| Tradition | Budget Tier | Local Currency | USD Equivalent |
|-----------|------------|----------------|----------------|
| Hindu North Indian | Budget | ₹5,00,000–₹15,00,000 | $5,600–$16,700 |
| Hindu North Indian | Mid | ₹25,00,000–₹70,00,000 | $27,800–$77,900 |
| Hindu North Indian | Luxury | ₹1,50,00,000–₹5,00,00,000+ | $167K–$556K+ |
| Pakistani Sunni | Budget | ₨15,00,000–₨25,00,000 | $5,360–$8,940 |
| Pakistani Sunni | Mid | ₨30,00,000–₨70,00,000 | $10,720–$25,020 |
| Pakistani Sunni | Luxury | ₨1,50,00,000–₨5,00,00,000+ | $53,600–$178,700+ |
| Bengali Muslim | Budget | ৳3,00,000–৳5,00,000 | $2,440–$4,070 |
| Bengali Muslim | Mid | ৳5,00,000–৳15,00,000 | $4,070–$12,200 |
| Sinhalese Buddhist | Budget | $3,000–$5,000 | $3,000–$5,000 |
| Sinhalese Buddhist | Mid | $6,000–$15,000 | $6,000–$15,000 |
| Nepali Hindu | Budget | $5,000–$10,000 | $5,000–$10,000 |
| Nepali Hindu | Mid | $15,000–$40,000 | $15,000–$40,000 |
| Maldivian | Basic | $3,000–$8,000 | $3,000–$8,000 |
| Maldivian | Luxury | $25,000–$400,000 | $25,000–$400,000 |
| Afghan Pashtun | Budget | ؋3,00,000–؋10,00,000 | $4,550–$15,160 |
| Afghan Pashtun | Urban | ؋10,00,000–؋50,00,000 | $15,160–$75,800 |

---

## Part 6: Dress Code Presets

### By Wedding Type

| Wedding Type | Bride | Groom | Guests |
|-------------|-------|-------|--------|
| Hindu North Indian | Red lehenga with zardozi | Sherwani + churidar + turban | Bright sarees, lehengas, kurta pajama |
| Hindu South Indian | Kanjeevaram silk saree + temple jewelry | Dhoti + kurta + angavastram | Silk sarees, veshti-shirt |
| Muslim Indian | Sharara/gharara + heavy zardozi | Sherwani + karakuli/pagri | Formal Indian attire |
| Sikh | Red/maroon lehenga + chooda + kaleere | Sherwani + turban + kirpan | Colorful ethnic; heads covered |
| Jain | Red/gold lehenga or saree | Sherwani + turban | Traditional Indian wear |
| Christian Indian | White gown + veil (Goan); Kasavu saree (Kerala) | Formal suit/tuxedo | Formal; avoid white |
| Pakistani Sunni | Red/maroon lehenga + heavy embroidery | Sherwani + sehra + pagri | Jewel tones (avoid red) |
| Bengali Muslim | Red Benarasi silk saree | Sherwani/Panjabi + Nagras | Vibrant colors |
| Sinhalese Buddhist | Kandyan white/gold saree | Kandyan Nilame outfit | Formal traditional |
| Tamil Hindu | Kanchipuram gold silk saree | Veshti + silk shirt | Formal traditional |
| Nepali Hindu | Red sari/lehenga + gold | Daura Suruwal or sherwani + topor | Festive colors |
| Maldivian | Dhirhamathi/Libaas + gold | White shirt + mundu/sarong | Modest formal |
| Afghan Pashtun | Green dress (Nikah), white (reception), red (departure) | Suit or Perahan Tunban + turban | Formal new clothing |

---

## Part 7: Food Defaults

### By Wedding Type

| Wedding Type | Dietary Type | Staples | Key Dishes |
|-------------|-------------|---------|------------|
| Hindu North Indian | Mixed (veg available) | Mughlai, Punjabi | Butter chicken, dal makhani, biryani, naan, gulab jamun |
| Hindu South Indian | Vegetarian dominant | Tamil, Kannada, Malayali | Sadya on banana leaf, sambar, rasam, payasam |
| Muslim Indian | Non-vegetarian (halal) | Mughlai | Biryani, kebabs, nihari, sheer khurma |
| Sikh | Vegetarian at Gurdwara; mixed at reception | Punjabi | Butter chicken, dal makhani, langar |
| Jain | Strictly vegetarian (no root veg) | Gujarati, Rajasthani | No onion, garlic, potato, carrot; farsan, dhokla |
| Christian Indian | Varies by region | Goan, Kerala, Mangalorean | Pork sorpotel, appam-stew, sadya |
| Pakistani | Non-vegetarian (halal) | Punjabi, Mughlai | Biryani, nihari, haleem, seekh kebabs |
| Bengali | Fish-centric | Bengali | Fish curry, hilsa, biryani, rasgulla, sandesh |
| Sinhalese Buddhist | Rice-based | Sri Lankan | Kiribath, kavum, rice and curry, hoppers |
| Nepali | Rice + lentil based | Nepali | Dal bhat, sel roti, momos, chatamari |
| Maldivian | Seafood-centric (halal) | Maldivian | Fish curry, garudhiya, grilled seafood |
| Afghan | Rice + meat based | Afghan | Kabuli pulao, mantu, kebabs, qorma |

---

## Part 8: Implementation Plan

### Phase 1: Data Model & Migration (Priority: HIGH)
1. Add `country`, `currency`, `dietaryDefault` fields to Wedding model
2. Create `WeddingTemplate` model with all templates
3. Create seed script to populate templates
4. Migration: set defaults for existing weddings (country="india", currency="INR")

### Phase 2: Onboarding Redesign (Priority: HIGH)
1. Add country selection step (Step 0)
2. Modify religion/region steps to be country-aware
3. Update budget slider with currency-aware formatting and local ranges
4. Update city lists per country
5. Pre-populate events from template

### Phase 3: Currency System (Priority: HIGH)
1. Create `src/lib/currency.ts` with formatting functions for all 7 currencies
2. Update `formatINR` to be currency-agnostic (use Wedding.currency)
3. Update all budget displays throughout the app

### Phase 4: Sidebar & Checklists (Priority: MEDIUM)
1. Make sidebar checklists dynamic based on wedding type
2. Create culture-specific checklist presets
3. Update default task suggestions per tradition

### Phase 5: AI & Content (Priority: MEDIUM)
1. Update AI system prompt to cover all traditions
2. Add culture-specific hashtag styles
3. Add culture-specific outfit planner suggestions

### Phase 6: Vendor & Catering (Priority: MEDIUM)
1. Update vendor categories per tradition (e.g., "Panjabi" vendor for Bengali)
2. Add catering order calculator with tradition-specific defaults
3. Add dietary restriction presets per tradition

### Phase 7: Website Templates (Priority: LOW)
1. Add culture-specific color palettes to website templates
2. Add tradition-specific section names (e.g., "Poruwa" vs "Wedding")
3. Add ritual description content per tradition

---

## Part 9: Migration Strategy for Existing Weddings

All existing weddings are Indian. Default assumptions:
- `country` → "india"
- `currency` → "INR"
- `dietaryDefault` → "mixed"
- No event migration needed (events are already stored in `selectedEvents`)

New weddings will get these fields populated during onboarding.

---

## Part 10: Competitive Advantage

| Feature | ShaadiSheet | ShaadiSheets.com | WeddingWire | The Knot |
|---------|-------------|------------------|-------------|----------|
| South Asian focus | ✅ All 7 countries | ❌ India only | ❌ Western | ❌ Western |
| Multi-currency | ✅ 7 currencies | ❌ INR only | ❌ USD | ❌ USD |
| Culture-specific checklists | ✅ Dynamic | ❌ Generic | ❌ Generic | ❌ Generic |
| Religion-aware events | ✅ 16+ traditions | ❌ 5 religions | ❌ None | ❌ None |
| Local food defaults | ✅ Per tradition | ❌ Generic Indian | ❌ Western | ❌ Western |
| Dress code presets | ✅ Per tradition | ❌ Generic | ❌ Western | ❌ Western |

This expansion positions ShaadiSheet as the **only** wedding planning tool that truly understands South Asian diversity — not just Indian weddings, but the full spectrum from Afghan to Maldivian traditions.
