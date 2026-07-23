// ─── Comprehensive Pattern Database ────────────────────────────────
// Maps natural language commands to tool calls with parameter extraction.
// Uses a generic pattern engine to cover ALL possible command combinations.

export interface ParsedCommand {
  tool: string;
  args: any;
  description: string;
  response: string;
}

// ─── Synonym maps ─────────────────────────────────────────────────

const ACTION_SYNONYMS: Record<string, string[]> = {
  delete: ['delete', 'remove', 'clear', 'drop', 'eliminate', 'get rid of', 'kick out', 'erase', 'cut', 'trash', 'ditch', 'discard', 'wipe out', 'get rid'],
  create: ['create', 'add', 'new', 'insert', 'register', 'include', 'bring in', 'put in', 'enter', 'input', 'book', 'hire', 'reserve'],
  update: ['update', 'mark', 'set', 'change', 'make', 'turn', 'switch', 'assign', 'move', 'shift', 'apply', 'convert', 'flip', 'put'],
  query: ['how many', 'count', 'total', 'number of', 'number', 'give me', 'tell me', 'what are', 'what is'],
};

const TARGET_SYNONYMS: Record<string, string[]> = {
  guests: ['guest', 'guests', 'invitee', 'invitees', 'attendee', 'attendees', 'people', 'person', 'family', 'relative', 'friend', 'couple', 'bride', 'groom', 'individual', 'contact'],
  vendors: ['vendor', 'vendors', 'supplier', 'suppliers', 'provider', 'contractor', 'service provider', 'business', 'company', 'photographer', 'caterer', 'decorator', 'dj', 'band', 'makeup artist', 'mehendi artist'],
  budget: ['budget', 'budget item', 'expense', 'cost', 'spending', 'expenditure', 'line item', 'item', 'entry', 'budget entry'],
  tasks: ['task', 'tasks', 'todo', 'to-do', 'action item', 'checklist item', 'thing to do', 'job', 'chore'],
  rooms: ['room', 'rooms', 'allocation', 'hotel', 'accommodation', 'stay', 'lodging', 'room allocation', 'hotel room', 'room booking'],
  events: ['event', 'events', 'function', 'ceremony', 'ritual', 'day', 'programme', 'program'],
};

const Rsvp_SYNONYMS: Record<string, string> = {
  yes: 'Yes', confirmed: 'Yes', attending: 'Yes', coming: 'Yes', going: 'Yes', 'will attend': 'Yes', accepted: 'Yes', 'said yes': 'Yes',
  no: 'Declined', declined: 'Declined', rejected: 'Declined', 'not coming': 'Declined', "won't attend": 'Declined', 'cancelled': 'Declined',
  pending: 'Pending', waiting: 'Pending', 'not sure': 'Pending', maybe: 'Pending', 'to be confirmed': 'Pending', tbc: 'Pending', undecided: 'Pending',
  'checked in': 'Yes', attended: 'Yes', arrived: 'Yes', present: 'Yes',
};

const DIETARY_SYNONYMS: Record<string, string> = {
  veg: 'Veg', vegetarian: 'Veg', 'no meat': 'Veg', 'plant based': 'Veg', 'pure veg': 'Veg',
  'non-veg': 'Non-Veg', 'non veg': 'Non-Veg', 'nonvegetarian': 'Non-Veg', meat: 'Non-Veg', 'eats meat': 'Non-Veg',
  jain: 'Jain', 'jain food': 'Jain', 'jain diet': 'Jain',
  vegan: 'Vegan', 'no dairy': 'Vegan', 'plant only': 'Vegan',
};

const SIDE_SYNONYMS: Record<string, string> = {
  bride: 'Bride', 'bride side': 'Bride', "bride's": 'Bride', 'bride family': 'Bride', 'from bride': 'Bride', 'brides': 'Bride',
  groom: 'Groom', 'groom side': 'Groom', "groom's": 'Groom', 'groom family': 'Groom', 'from groom': 'Groom', 'grooms': 'Groom',
};

const CONTRACT_SYNONYMS: Record<string, string> = {
  pending: 'Pending', unsigned: 'Pending', 'not signed': 'Pending', awaiting: 'Pending', waiting: 'Pending',
  signed: 'Signed', booked: 'Signed', confirmed: 'Signed', locked: 'Signed', reserved: 'Signed',
  completed: 'Completed', done: 'Completed', finished: 'Completed', fulfilled: 'Completed', delivered: 'Completed',
};

const ROOM_STATUS_SYNONYMS: Record<string, string> = {
  reserved: 'Reserved', booked: 'Reserved', 'on hold': 'Reserved', held: 'Reserved',
  'checked in': 'Checked In', arrived: 'Checked In', occupied: 'Checked In', staying: 'Checked In',
  'checked out': 'Checked Out', left: 'Checked Out', vacated: 'Checked Out', departed: 'Checked Out',
  cancelled: 'Cancelled', canceled: 'Cancelled', 'no show': 'No Show',
};

const PRIORITY_SYNONYMS: Record<string, string> = {
  low: 'Low', minor: 'Low', 'not important': 'Low', whenever: 'Low', 'whenever possible': 'Low',
  medium: 'Medium', normal: 'Medium', standard: 'Medium', average: 'Medium',
  high: 'High', important: 'High', soon: 'High', 'very important': 'High',
  urgent: 'Urgent', critical: 'Urgent', asap: 'Urgent', immediately: 'Urgent', now: 'Urgent', 'right away': 'Urgent',
};

const CATEGORY_SYNONYMS: Record<string, string> = {
  photography: 'Photography', photographer: 'Photography', photos: 'Photography', pictures: 'Photography', shoot: 'Photography', cameraman: 'Photography',
  videography: 'Videography', videographer: 'Videography', video: 'Videography', filming: 'Videography', drone: 'Videography',
  catering: 'Catering', food: 'Catering', meals: 'Catering', cuisine: 'Catering', caterer: 'Catering', cook: 'Catering', chef: 'Catering', buffet: 'Catering', khana: 'Catering',
  decoration: 'Decoration', decor: 'Decoration', flowers: 'Decoration', floral: 'Decoration', stage: 'Decoration', flower: 'Decoration', phool: 'Decoration', 'flower decoration': 'Decoration',
  makeup: 'Makeup', 'make up': 'Makeup', cosmetics: 'Makeup', beauty: 'Makeup', artist: 'Makeup', salon: 'Makeup',
  mehendi: 'Mehendi', henna: 'Mehendi', 'mehndi': 'Mehendi', 'mehendi artist': 'Mehendi',
  dj: 'DJ', music: 'DJ', 'sound system': 'DJ', 'sound': 'DJ', speaker: 'DJ', lighting: 'DJ',
  band: 'Band', baraat: 'Band', 'brass band': 'Band', orchestra: 'Band', 'wedding band': 'Band',
  venue: 'Venue', 'wedding venue': 'Venue', location: 'Venue', banquet: 'Venue', farmhouse: 'Venue', hotel: 'Venue', hall: 'Venue', mandap: 'Venue', 'marriage hall': 'Venue', resort: 'Venue',
  transport: 'Transport', travel: 'Transport', car: 'Transport', 'wedding car': 'Transport', logistics: 'Transport', bus: 'Transport', tempo: 'Transport',
  invitation: 'Invitation', invites: 'Invitation', 'wedding card': 'Invitation', cards: 'Invitation', 'wedding invite': 'Invitation', eInvite: 'Invitation',
  jewelry: 'Jewellery', jewellery: 'Jewellery', gold: 'Jewellery', ornaments: 'Jewellery', 'wedding jewellery': 'Jewellery', diamonds: 'Jewellery',
  outfit: 'Outfit', dress: 'Outfit', lehenga: 'Outfit', sherwani: 'Outfit', 'wedding dress': 'Outfit', 'wedding outfit': 'Outfit', saree: 'Outfit', suit: 'Outfit',
};

const RELATION_SYNONYMS: Record<string, string> = {
  cousin: 'Cousin', bhai: 'Brother', brother: 'Brother', behen: 'Sister', sister: 'Sister',
  uncle: 'Uncle', chacha: 'Uncle', mama: 'Uncle', mami: 'Aunt', aunty: 'Aunt', aunt: 'Aunt',
  friend: 'Friend', dost: 'Friend', colleague: 'Colleague', coworker: 'Colleague',
  neighbor: 'Neighbor', padosi: 'Neighbor', son: 'Son', beta: 'Son', daughter: 'Daughter', beti: 'Daughter',
  nephew: 'Nephew', bhatija: 'Nephew', niece: 'Niece', bhatiji: 'Niece',
  father: 'Father', papa: 'Father', dad: 'Father', daddy: 'Father', baapu: 'Father',
  mother: 'Mother', maa: 'Mother', mom: 'Mother', mommy: 'Mother', amma: 'Mother',
  grandfather: 'Grandfather', dada: 'Grandfather', nana: 'Grandfather', grandmother: 'Grandmother', dadi: 'Grandmother', nani: 'Grandmother',
};

const MONTH_SYNONYMS: Record<string, string> = {
  january: '01', jan: '01', february: '02', feb: '02', march: '03', mar: '03',
  april: '04', apr: '04', may: '05', june: '06', jun: '06', july: '07', jul: '07',
  august: '08', aug: '08', september: '09', sep: '09', october: '10', oct: '10',
  november: '11', nov: '11', december: '12', dec: '12',
};

const ROOM_TYPE_SYNONYMS: Record<string, string> = {
  standard: 'Standard', basic: 'Standard', regular: 'Standard',
  deluxe: 'Deluxe', delux: 'Deluxe',
  suite: 'Suite', luxury: 'Suite',
  premium: 'Premium', 'high end': 'Premium',
  vip: 'VIP', exclusive: 'VIP',
  ac: 'AC', 'air conditioned': 'AC',
  'non-ac': 'Non-AC', 'non ac': 'Non-AC', 'without ac': 'Non-AC', 'no ac': 'Non-AC',
};

// ─── Helper functions ─────────────────────────────────────────────

function fuzzyMatch(input: string, targets: string[], threshold = 0.7): string | undefined {
  const lower = input.toLowerCase().trim();
  for (const t of targets) {
    if (lower === t || lower.includes(t)) return t;
  }
  for (const t of targets) {
    if (levenshtein(lower, t) <= Math.floor(t.length * (1 - threshold))) return t;
  }
  return undefined;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

function normalizeSynonyms(input: string, map: Record<string, string>): string | undefined {
  const lower = input.toLowerCase().trim();
  const sortedKeys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower === key || new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(lower)) return map[key];
  }
  return fuzzyMatch(lower, Object.keys(map)) ? map[fuzzyMatch(lower, Object.keys(map))!] : undefined;
}

function extractName(q: string, actionWords: string[], extraStrip: string[]): string | undefined {
  let cleaned = q;
  for (const word of actionWords) {
    cleaned = cleaned.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }
  for (const word of extraStrip) {
    cleaned = cleaned.replace(new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }
  // Strip entity nouns and common wedding terms
  cleaned = cleaned.replace(/\b(guests?|invitees?|attendees?|people|person|family|relative|friends?|couples?|vendors?|suppliers?|contractors?|budget|expense|cost|spending|tasks?|todos?|to-dos?|action items?|rooms?|hotels?|accommodation|events?|functions?|ceremonies?|rituals?)\b/gi, '');
  // Strip filler words
  cleaned = cleaned.replace(/\b(from|the|a|an|all|every|each|some|any|no|my|his|her|their|its|our|and|or|with|for|in|on|at|to|of|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|shall|must|also|just|only|then|than|so|but|not|very|too|really|actually|basically|literally|please|kindly|want|need|like|get|give|show|list|find|search|tell|what|how|why|when|where|who|which|that|this|these|those|as|by|before|after|until|non)\b/gi, '');
  cleaned = cleaned.replace(/[^a-z0-9\s]/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 2) return undefined;
  return cleaned;
}

function extractNumber(q: string): number | undefined {
  const match = q.match(/(\d[\d,]*)/);
  if (match) return parseInt(match[1].replace(/,/g, ''), 10);
  const wordNums: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
    thousand: 1000, lakh: 100000, lac: 100000, crore: 10000000,
  };
  for (const [word, num] of Object.entries(wordNums)) {
    if (q.includes(word)) return num;
  }
  return undefined;
}

function extractDate(q: string): string | undefined {
  const isoMatch = q.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const slashMatch = q.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2].padStart(2, '0')}-${slashMatch[1].padStart(2, '0')}`;
  const monthDayYear = q.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{4})?/i);
  if (monthDayYear) {
    const month = MONTH_SYNONYMS[monthDayYear[2].toLowerCase()] || '01';
    const day = monthDayYear[1].padStart(2, '0');
    const year = monthDayYear[3] || new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  const monthFirst = q.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})?/i);
  if (monthFirst) {
    const month = MONTH_SYNONYMS[monthFirst[1].toLowerCase()] || '01';
    const day = monthFirst[2].padStart(2, '0');
    const year = monthFirst[3] || new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }
  const now = new Date();
  if (q.includes('tomorrow')) { now.setDate(now.getDate() + 1); return now.toISOString().split('T')[0]; }
  if (q.includes('today')) return now.toISOString().split('T')[0];
  if (q.includes('next week')) { now.setDate(now.getDate() + 7); return now.toISOString().split('T')[0]; }
  if (q.includes('next month')) { now.setMonth(now.getMonth() + 1); return now.toISOString().split('T')[0]; }
  if (q.includes('day after tomorrow')) { now.setDate(now.getDate() + 2); return now.toISOString().split('T')[0]; }
  if (q.includes('next year')) { now.setFullYear(now.getFullYear() + 1); return now.toISOString().split('T')[0]; }
  return undefined;
}

function extractTime(q: string): string | undefined {
  const timeMatch = q.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const mins = timeMatch[2];
    if (timeMatch[3]?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (timeMatch[3]?.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  }
  const simpleTime = q.match(/(\d{1,2})\s*(am|pm)/i);
  if (simpleTime) {
    let hours = parseInt(simpleTime[1]);
    if (simpleTime[2].toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (simpleTime[2].toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:00`;
  }
  return undefined;
}

function extractRelation(q: string): string | undefined {
  const match = q.match(/\b(cousin|brother|sister|uncle|aunt|friend|colleague|coworker|neighbor|son|daughter|nephew|niece|father|mother|grandfather|grandmother|bhai|behen|chacha|mama|mami|dost|beta|beti|papa|maa|dada|nana|dadi|nani)\b/i);
  if (match) return normalizeSynonyms(match[0], RELATION_SYNONYMS);
  return undefined;
}

function extractVendorType(q: string): string | undefined {
  const match = q.match(/\b(vendor|photographer|photography|caterer|catering|decorator|decoration|dj|band|makeup|make-up|mehendi|henna|venue|videography|videographer|transport|invitation|jewelry|jewellery|outfit|dress)s?\b/i)?.[0];
  if (match) return normalizeSynonyms(match, CATEGORY_SYNONYMS);
  return undefined;
}

function hasBudgetContext(q: string): boolean {
  return /\b(budget|expense|cost|spending|item|amount|entry|line item)\b/.test(q);
}

function hasPersonName(q: string): boolean {
  // Check if there's a proper noun (capitalized word) that isn't an action/entity word
  const words = q.split(/\s+/);
  const skipWords = new Set([...ACTION_SYNONYMS.delete, ...ACTION_SYNONYMS.create, ...ACTION_SYNONYMS.update, 'rsvp', 'dietary', 'food', 'status', 'contract', 'category', 'type', 'quote', 'price', 'amount', 'budget', 'cost', 'priority', 'deadline', 'date', 'time', 'room', 'hotel', 'event', 'function', 'ceremony', 'guest', 'vendor', 'task', 'all', 'the', 'a', 'an', 'to', 'as', 'for', 'in', 'on', 'at', 'by', 'from', 'of', 'with', 'and', 'or', 'yes', 'no', 'pending', 'confirmed', 'declined', 'attending', 'rejected', 'checked', 'reserved', 'deluxe', 'suite', 'standard', 'premium', 'veg', 'non-veg', 'jain', 'vegan', 'urgent', 'high', 'medium', 'low', 'critical', 'bride', 'groom']);
  return words.some(w => w.length > 1 && !skipWords.has(w) && !/^\d/.test(w) && !extractVendorType(w) && !normalizeSynonyms(w, DIETARY_SYNONYMS) && !normalizeSynonyms(w, Rsvp_SYNONYMS) && !normalizeSynonyms(w, ROOM_STATUS_SYNONYMS) && !normalizeSynonyms(w, CONTRACT_SYNONYMS) && !normalizeSynonyms(w, PRIORITY_SYNONYMS));
}

// ─── Pattern Engine ────────────────────────────────────────────────

interface PatternDef {
  match: (q: string) => boolean;
  parse: (q: string) => ParsedCommand | null;
}

function hasAny(q: string, words: string[]): boolean {
  return words.some(w => q.includes(w));
}

function hasActionVerb(q: string): boolean {
  return hasAny(q, [...ACTION_SYNONYMS.delete, ...ACTION_SYNONYMS.create, ...ACTION_SYNONYMS.update]);
}

// ── DELETE patterns ───────────────────────────────────────────────

function generateDeletePatterns(): PatternDef[] {
  const patterns: PatternDef[] = [];
  const deleteVerbs = ACTION_SYNONYMS.delete;
  
  for (const [entityKey, entityNouns] of Object.entries(TARGET_SYNONYMS)) {
    const toolName = entityKey === 'budget' ? 'delete_budget_items' : `delete_${entityKey}`;
    const filterFieldMap: Record<string, string> = {
      guests: 'name_contains', vendors: 'name_contains', budget: 'item_contains',
      tasks: 'task_contains', rooms: 'guestName_contains', events: 'name_contains',
    };
    const filterField = filterFieldMap[entityKey] || 'name_contains';
    
    const filterTermsRegex = /\b(veg|vegetarian|non-veg|jain|vegan|meat|bride|groom|pending|confirmed|declined|rejected|attending|checked in|arrived|no show)\b/i;
    const filterOnlyRegex = /^(veg|vegetarian|non-veg|jain|vegan|meat|bride|groom|bride side|groom side|pending|confirmed|declined|rejected|attending|checked in|arrived|no show)$/i;
    patterns.push({
      match: q => hasAny(q, deleteVerbs),
      parse: q => {
        const name = extractName(q, deleteVerbs, ['from', 'the']);
        if (!name) return null;
        // If extracted name is ONLY a filter term (e.g. "veg", "jain"), skip - let specific filter patterns handle it
        // But if "from guests" is present, always allow (name-based delete)
        // If extracted name has both filter terms AND other words (e.g. "Sameer Jain"), allow as name delete
        if (filterOnlyRegex.test(name) && !/\bfrom\s+(the\s+)?guests?\b/.test(q)) return null;
        return { tool: toolName, args: { filter: { [filterField]: name } }, description: `Delete ${entityKey.slice(0, -1)} "${name}"`, response: `I'll delete ${entityKey.slice(0, -1)} "${name}". Please confirm below.` };
      },
    });
    
    patterns.push({
      match: q => hasAny(q, deleteVerbs) && hasAny(q, ['all', 'every', 'each', 'entire', 'whole', 'complete']) && hasAny(q, entityNouns),
      parse: q => {
        const filter: any = {};
        if (entityKey === 'guests') {
          const side = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS);
          if (side) filter.side = side;
          const dietaryMatch = q.match(/\b(non-veg|non veg|nonvegetarian)\b/i)?.[0] || q.match(/\b(veg|vegetarian|jain|vegan)\b/i)?.[0] || '';
          const dietary = normalizeSynonyms(dietaryMatch, DIETARY_SYNONYMS);
          if (dietary) filter.dietary = dietary;
          const rsvp = normalizeSynonyms(q.match(/\b(pending|confirmed|declined|rejected|attending|checked in)\b/i)?.[0] || '', Rsvp_SYNONYMS);
          if (rsvp) filter.rsvp = rsvp;
        }
        if (entityKey === 'vendors') {
          const contract = normalizeSynonyms(q.match(/\b(pending|signed|completed|done|booked)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
          if (contract) filter.contract = contract;
          const category = extractVendorType(q);
          if (category) filter.category = category;
        }
        if (entityKey === 'tasks') {
          const priority = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical)\b/i)?.[0] || '', PRIORITY_SYNONYMS);
          if (priority) filter.priority = priority;
        }
        if (entityKey === 'rooms') {
          const status = normalizeSynonyms(q.match(/\b(reserved|checked in|checked out|cancelled|no show)\b/i)?.[0] || '', ROOM_STATUS_SYNONYMS);
          if (status) filter.status = status;
        }
        if (entityKey === 'events') {
          const date = extractDate(q);
          if (date) filter.date = date;
        }
        return { tool: toolName, args: { filter }, description: `Delete all ${entityKey}`, response: `I'll delete all ${entityKey}. Please confirm below.` };
      },
    });
    
    if (entityKey === 'guests') {
      // Dietary delete - requires explicit dietary context (not just name containing "jain")
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(veg|vegetarian|non-veg|non veg|jain|vegan|meat)\b/.test(q) && /\b(dietary|food|meal|eat|veg|vegetarian|non-veg|jain|vegan|meat)\b/i.test(q) && !/\b(name|named|called|family|surname)\b/.test(q),
        parse: q => {
          const dMatch = q.match(/\b(non-veg|non veg|nonvegetarian)\b/i)?.[0] || q.match(/\b(veg|vegetarian|jain|vegan|meat)\b/i)?.[0] || '';
          const d = normalizeSynonyms(dMatch, DIETARY_SYNONYMS);
          return d ? { tool: toolName, args: { filter: { dietary: d } }, description: `Delete all ${d} dietary guests`, response: `I'll delete all ${d} dietary guests. Please confirm below.` } : null;
        },
      });
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(bride|groom|bride side|groom side|bride's|groom's)\b/.test(q),
        parse: q => { const s = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS); return s ? { tool: toolName, args: { filter: { side: s } }, description: `Delete all ${s} side guests`, response: `I'll delete all ${s} side guests. Please confirm below.` } : null; },
      });
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(pending|confirmed|declined|rejected|attending|checked in|arrived|no show)\b/.test(q),
        parse: q => { const r = normalizeSynonyms(q.match(/\b(pending|confirmed|declined|rejected|attending|checked in|arrived|no show)\b/i)?.[0] || '', Rsvp_SYNONYMS); return r ? { tool: toolName, args: { filter: { rsvp: r } }, description: `Delete all ${r} RSVP guests`, response: `I'll delete all ${r} RSVP guests. Please confirm below.` } : null; },
      });
    }
    if (entityKey === 'vendors') {
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(pending|unsigned|not signed|signed|booked|completed|done)\b/.test(q),
        parse: q => { const c = normalizeSynonyms(q.match(/\b(pending|unsigned|not signed|signed|booked|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS); return c ? { tool: toolName, args: { filter: { contract: c } }, description: `Delete all ${c} contract vendors`, response: `I'll delete all ${c} contract vendors. Please confirm below.` } : null; },
      });
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && extractVendorType(q) !== undefined,
        parse: q => { const c = extractVendorType(q); return c ? { tool: toolName, args: { filter: { category: c } }, description: `Delete all ${c} vendors`, response: `I'll delete all ${c} vendors. Please confirm below.` } : null; },
      });
    }
    if (entityKey === 'tasks') {
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(low|medium|high|urgent|critical|important)\b/.test(q),
        parse: q => { const p = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical|important)\b/i)?.[0] || '', PRIORITY_SYNONYMS); return p ? { tool: toolName, args: { filter: { priority: p } }, description: `Delete all ${p} priority tasks`, response: `I'll delete all ${p} priority tasks. Please confirm below.` } : null; },
      });
    }
    if (entityKey === 'rooms') {
      patterns.push({
        match: q => hasAny(q, deleteVerbs) && hasAny(q, entityNouns) && /\b(reserved|checked in|checked out|cancelled|no show)\b/.test(q),
        parse: q => { const s = normalizeSynonyms(q.match(/\b(reserved|checked in|checked out|cancelled|no show)\b/i)?.[0] || '', ROOM_STATUS_SYNONYMS); return s ? { tool: toolName, args: { filter: { status: s } }, description: `Delete all ${s} rooms`, response: `I'll delete all ${s} rooms. Please confirm below.` } : null; },
      });
    }
  }
  return patterns;
}

// ── UPDATE patterns (checked BEFORE create to prevent misrouting) ─

function generateUpdatePatterns(): PatternDef[] {
  const patterns: PatternDef[] = [];
  const updateVerbs = ACTION_SYNONYMS.update;
  
  // Process entities in priority order: specific entities first, vendors last
  const entityOrder = ['tasks', 'events', 'rooms', 'budget', 'guests', 'vendors'];
  const entries = entityOrder.map(key => [key, TARGET_SYNONYMS[key]] as [string, string[]]);
  
  for (const [entityKey, entityNouns] of entries) {
    const toolName = `update_${entityKey}`;
    
    if (entityKey === 'guests') {
      // RSVP update - match by RSVP value only when guest context is present (not vendor)
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(yes|no|pending|confirmed|declined|attending|rejected|checked in|arrived|present)\b/.test(q) && (hasAny(q, entityNouns) || hasPersonName(q)) && extractVendorType(q) === undefined && !/\b(contract|supplier|vendor)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'rsvp', 'to', 'as'], ['yes', 'no', 'pending', 'confirmed', 'declined', 'attending', 'rejected', 'checked in', 'arrived', 'present']);
          const rsvp = normalizeSynonyms(q.match(/\b(yes|no|pending|confirmed|declined|attending|rejected|checked in|arrived|present)\b/i)?.[0] || '', Rsvp_SYNONYMS);
          if (rsvp) {
            const filter: any = {};
            if (name) filter.name_contains = name;
            if (q.includes('bride')) filter.side = 'Bride';
            if (q.includes('groom')) filter.side = 'Groom';
            if (q.includes('veg') && !q.includes('non')) filter.dietary = 'Veg';
            if (q.includes('jain')) filter.dietary = 'Jain';
            return { tool: toolName, args: { filter, updates: { rsvp } }, description: `Update ${name || 'guests'} RSVP to ${rsvp}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' guests\''} RSVP to ${rsvp}.` };
          }
          return null;
        },
      });
      // Dietary update - match by dietary value only when dietary context is present
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(veg|vegetarian|non-veg|jain|vegan|dietary|food)\b/.test(q) && /\b(dietary|food|meal|eat|vegetarian|veg|non-veg|jain|vegan|meat)\b/i.test(q) && !/\b(name|named|called|family|surname)\b/.test(q) && (hasAny(q, entityNouns) || hasPersonName(q)),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'dietary', 'food', 'to', 'as'], ['veg', 'vegetarian', 'non-veg', 'jain', 'vegan', 'non', 'dietary', 'food']);
          const dietaryMatch = q.match(/\b(non-veg|non veg|nonvegetarian)\b/i)?.[0] || q.match(/\b(veg|vegetarian|jain|vegan)\b/i)?.[0] || '';
          const dietary = normalizeSynonyms(dietaryMatch, DIETARY_SYNONYMS);
          if (dietary) {
            const filter: any = {};
            if (name) filter.name_contains = name;
            if (q.includes('bride')) filter.side = 'Bride';
            if (q.includes('groom')) filter.side = 'Groom';
            return { tool: toolName, args: { filter, updates: { dietary } }, description: `Update ${name || 'guests'} dietary to ${dietary}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' guests\''} dietary to ${dietary}.` };
          }
          return null;
        },
      });
      // Side update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && hasAny(q, entityNouns) && /\b(bride|groom|bride side|groom side)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'side', 'to', 'as'], [...Object.keys(SIDE_SYNONYMS), 'bride side', 'groom side']);
          const side = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS);
          if (side) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { side } }, description: `Update ${name || 'guests'} side to ${side}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' guests\''} side to ${side}.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'vendors') {
      // Contract update - match by contract value when vendor context is present
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(pending|signed|booked|completed|done)\b/.test(q) && (hasAny(q, entityNouns) || /\b(vendor|supplier|contractor|business|company)\b/.test(q) || extractVendorType(q) !== undefined) && !hasBudgetContext(q) && !/\b(budget|expense|cost|spending)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'contract', 'to', 'as'], ['pending', 'signed', 'booked', 'completed', 'done']);
          const contract = normalizeSynonyms(q.match(/\b(pending|signed|booked|completed|done)\b/i)?.[0] || '', CONTRACT_SYNONYMS);
          if (contract) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { contract } }, description: `Update ${name || 'vendors'} contract to ${contract}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' vendors\''} contract to ${contract}.` };
          return null;
        },
      });
      // Category update - only when not budget context
      patterns.push({
        match: q => hasAny(q, updateVerbs) && extractVendorType(q) !== undefined && /\b(category|type|to)\b/.test(q) && !hasBudgetContext(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'category', 'type', 'to', 'as'], Object.keys(CATEGORY_SYNONYMS));
          const category = extractVendorType(q);
          if (category) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { category } }, description: `Update ${name || 'vendors'} category to ${category}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' vendors\''} category to ${category}.` };
          return null;
        },
      });
      // Contact update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(contact|phone|number|mobile)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'contact', 'phone', 'number', 'mobile', 'to', 'as'], []);
          const contact = q.match(/\b(\d{10})\b/)?.[0];
          if (contact) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { contact } }, description: `Update ${name || 'vendor'} contact to ${contact}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' vendor\''} contact to ${contact}.` };
          return null;
        },
      });
      // Quote update - only when not budget context
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(quote|price|cost|amount|budget)\b/.test(q) && /\d/.test(q) && !hasBudgetContext(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'quote', 'price', 'cost', 'amount', 'budget', 'to'], []);
          const quote = extractNumber(q);
          if (quote) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { quote } }, description: `Update ${name || 'vendor'} quote to ₹${quote.toLocaleString('en-IN')}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' vendor\''} quote to ₹${quote.toLocaleString('en-IN')}.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'budget') {
      // Amount update - works when budget entity noun or budget keywords present
      patterns.push({
        match: q => hasAny(q, updateVerbs) && (hasAny(q, entityNouns) || hasBudgetContext(q) || extractVendorType(q) !== undefined) && /\b(amount|cost|price|budget|estimate|estimated)\b/.test(q) && /\d/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'amount', 'cost', 'price', 'budget', 'estimate', 'estimated', 'to'], []);
          const amount = extractNumber(q);
          if (amount) return { tool: toolName, args: { filter: name ? { item_contains: name } : {}, updates: { estimated: amount } }, description: `Update ${name || 'budget item'} amount to ₹${amount.toLocaleString('en-IN')}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' budget item\''} amount to ₹${amount.toLocaleString('en-IN')}.` };
          return null;
        },
      });
      // Category update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && hasAny(q, entityNouns) && extractVendorType(q) !== undefined,
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'category', 'to', 'as'], Object.keys(CATEGORY_SYNONYMS));
          const category = extractVendorType(q);
          if (category) return { tool: toolName, args: { filter: name ? { item_contains: name } : {}, updates: { category } }, description: `Update ${name || 'budget item'} category to ${category}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' budget item\''} category to ${category}.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'tasks') {
      // Priority update - match by priority value only when task context is present
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(low|medium|high|urgent|critical|important)\b/.test(q) && (hasAny(q, entityNouns) || /\b(task|todo|to-do)\b/.test(q) || hasPersonName(q)),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'priority', 'to'], ['low', 'medium', 'high', 'urgent', 'critical', 'important']);
          const priority = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical|important)\b/i)?.[0] || '', PRIORITY_SYNONYMS);
          if (priority) return { tool: toolName, args: { filter: name ? { task_contains: name } : {}, updates: { priority } }, description: `Update ${name || 'tasks'} priority to ${priority}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' tasks\''} priority to ${priority}.` };
          return null;
        },
      });
      // Deadline update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && hasAny(q, entityNouns) && /\b(deadline|due|date|by)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'deadline', 'due', 'date', 'by', 'to'], []);
          const deadline = extractDate(q);
          if (deadline) return { tool: toolName, args: { filter: name ? { task_contains: name } : {}, updates: { deadline } }, description: `Update ${name || 'task'} deadline to ${deadline}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' task\''} deadline to ${deadline}.` };
          return null;
        },
      });
      // Mark done
      patterns.push({
        match: q => hasAny(q, [...updateVerbs, 'complete', 'finish']) && hasAny(q, entityNouns) && /\b(done|complete|finished|completed)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, 'complete', 'finish', ...entityNouns], ['done', 'complete', 'finished', 'completed']);
          return { tool: toolName, args: { filter: name ? { task_contains: name } : {}, updates: { completed: true } }, description: `Mark ${name || 'task'} as done`, response: `I'll mark${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' task\''} as done.` };
        },
      });
    }
    
    if (entityKey === 'rooms') {
      // Status update - match by status value only when room context is present
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(reserved|checked in|checked out|cancelled|no show)\b/.test(q) && (hasAny(q, entityNouns) || /\b(room|allocation|hotel)\b/.test(q)),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'status', 'to'], ['reserved', 'checked in', 'checked out', 'cancelled', 'no show']);
          const status = normalizeSynonyms(q.match(/\b(reserved|checked in|checked out|cancelled|no show)\b/i)?.[0] || '', ROOM_STATUS_SYNONYMS);
          if (status) return { tool: toolName, args: { filter: name ? { guestName_contains: name } : {}, updates: { status } }, description: `Update ${name || 'rooms'} status to ${status}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' rooms\''} status to ${status}.` };
          return null;
        },
      });
      // Room type update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && /\b(standard|deluxe|suite|premium|vip|ac|non-ac|non ac)\b/.test(q) && (hasAny(q, entityNouns) || /\b(room|allocation)\b/.test(q)),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'type', 'to', 'as'], Object.keys(ROOM_TYPE_SYNONYMS));
          const roomType = normalizeSynonyms(q.match(/\b(standard|deluxe|suite|premium|vip|ac|non-ac|non ac)\b/i)?.[0] || '', ROOM_TYPE_SYNONYMS);
          if (roomType) return { tool: toolName, args: { filter: name ? { guestName_contains: name } : {}, updates: { roomType } }, description: `Update ${name || 'room'} type to ${roomType}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' room\''} type to ${roomType}.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'events') {
      // Date update
      patterns.push({
        match: q => hasAny(q, [...updateVerbs, 'reschedule']) && hasAny(q, entityNouns) && /\b(date|on|day|reschedule)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, 'reschedule', ...entityNouns, 'date', 'on', 'day', 'to'], []);
          const date = extractDate(q);
          if (date) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { date } }, description: `Update ${name || 'event'} date to ${date}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' event\''} date to ${date}.` };
          return null;
        },
      });
      // Reschedule without entity noun (reschedule + event name + to + date)
      patterns.push({
        match: q => /\b(reschedule|postpone|move|shift)\b/.test(q) && /\b(to|on|date)\b/.test(q),
        parse: q => {
          const name = extractName(q, ['reschedule', 'postpone', 'move', 'shift', 'to', 'on', 'date'], []);
          const date = extractDate(q);
          if (date || name) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: date ? { date } : {} }, description: `Reschedule event`, response: `I'll reschedule the event${date ? ' to ' + date : ''}.` };
          return null;
        },
      });
      // Time update
      patterns.push({
        match: q => hasAny(q, updateVerbs) && hasAny(q, entityNouns) && /\b(time|at)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...updateVerbs, ...entityNouns, 'time', 'at', 'to'], []);
          const time = extractTime(q);
          if (time) return { tool: toolName, args: { filter: name ? { name_contains: name } : {}, updates: { time } }, description: `Update ${name || 'event'} time to ${time}`, response: `I'll update${name ? ' ' + name + '\'' + (name.endsWith('s') ? '' : 's') : ' event\''} time to ${time}.` };
          return null;
        },
      });
    }
  }
  return patterns;
}

// ── CREATE patterns ───────────────────────────────────────────────

function generateCreatePatterns(): PatternDef[] {
  const patterns: PatternDef[] = [];
  const createVerbs = ACTION_SYNONYMS.create;
  
  const entityOrder = ['tasks', 'events', 'rooms', 'budget', 'guests', 'vendors'];
  const entries = entityOrder.map(key => [key, TARGET_SYNONYMS[key]] as [string, string[]]);
  
  for (const [entityKey, entityNouns] of entries) {
    const toolName = entityKey === 'budget' ? 'create_budget_item' : entityKey === 'tasks' ? 'create_task' : `create_${entityKey}`;
    
    if (entityKey === 'guests') {
      // Create with side - works even without explicit guest noun (side context is enough)
      patterns.push({
        match: q => hasAny(q, createVerbs) && /\b(bride|groom|bride side|groom side)\b/.test(q) && !hasBudgetContext(q),
        parse: q => {
          const name = extractName(q, createVerbs, [...entityNouns, ...Object.keys(SIDE_SYNONYMS), 'bride side', 'groom side', 'as', 'side', 'on']);
          const side = normalizeSynonyms(q.match(/\b(bride|groom|bride side|groom side|bride's|groom's)\b/i)?.[0] || '', SIDE_SYNONYMS) || 'Bride';
          const dietary = normalizeSynonyms(q.match(/\b(veg|vegetarian|non-veg|jain|vegan)\b/i)?.[0] || '', DIETARY_SYNONYMS) || 'Veg';
          const relation = extractRelation(q) || '';
          if (name) return { tool: toolName, args: { guests: [{ guestName: name, side, dietary, relation, rsvp: 'Pending' }] }, description: `Add ${name} as ${side} side guest`, response: `I'll add ${name} as a ${side} side guest (${dietary}${relation ? ', ' + relation : ''}).` };
          return null;
        },
      });
      // Create with relation (as cousin, as brother, etc.)
      patterns.push({
        match: q => hasAny(q, createVerbs) && extractRelation(q) !== undefined,
        parse: q => {
          const name = extractName(q, createVerbs, [...entityNouns, 'as', ...Object.keys(RELATION_SYNONYMS)]);
          const relation = extractRelation(q) || '';
          if (name && relation) return { tool: toolName, args: { guests: [{ guestName: name, side: 'Bride', dietary: 'Veg', relation, rsvp: 'Pending' }] }, description: `Add ${name} as ${relation}`, response: `I'll add ${name} as a ${relation}. You can edit their details after.` };
          return null;
        },
      });
      // Create simple
      patterns.push({
        match: q => hasAny(q, createVerbs) && hasAny(q, entityNouns),
        parse: q => {
          const name = extractName(q, createVerbs, entityNouns);
          if (name) return { tool: toolName, args: { guests: [{ guestName: name, side: 'Bride', dietary: 'Veg', rsvp: 'Pending' }] }, description: `Add ${name} as guest`, response: `I'll add ${name} as a guest. You can edit their details after.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'vendors') {
      patterns.push({
        match: q => hasAny(q, [...createVerbs, 'book', 'hire']) && (hasAny(q, entityNouns) || extractVendorType(q) !== undefined) && !hasBudgetContext(q) && !/\b(event|function|ceremony|ritual|day|programme|program)\b/.test(q),
        parse: q => {
          const name = extractName(q, [...createVerbs, 'book', 'hire'], [...entityNouns, 'as', 'for']);
          const category = extractVendorType(q) || 'Other';
          const contact = q.match(/\b(\d{10})\b/)?.[0];
          const quote = extractNumber(q.match(/(?:quote|price|cost|budget|rs|inr|₹)\s*(\d[\d,]*)/i)?.[0] || '');
          if (name) return { tool: toolName, args: { name, category, contact, quote }, description: `Add vendor "${name}" (${category})`, response: `I'll add vendor "${name}" in ${category}.${contact ? ' Contact: ' + contact + '.' : ''}${quote ? ' Quote: ₹' + quote.toLocaleString('en-IN') + '.' : ''}` };
          return null;
        },
      });
    }
    
    if (entityKey === 'budget') {
      patterns.push({
        match: q => hasAny(q, createVerbs) && hasAny(q, entityNouns) && /\d/.test(q),
        parse: q => {
          const name = extractName(q, createVerbs, [...entityNouns, 'of', 'for']);
          const category = extractVendorType(q) || 'Misc';
          const estimated = extractNumber(q);
          if (name) return { tool: toolName, args: { item: name, category, estimated: estimated || 0 }, description: `Add budget item "${name}" (₹${(estimated || 0).toLocaleString('en-IN')})`, response: `I'll add "${name}" to your ${category} budget${estimated ? ' at ₹' + estimated.toLocaleString('en-IN') : ''}.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'tasks') {
      patterns.push({
        match: q => hasAny(q, createVerbs) && hasAny(q, entityNouns),
        parse: q => {
          const taskText = extractName(q, createVerbs, [...entityNouns, 'of', 'for']);
          const deadline = extractDate(q);
          const priority = normalizeSynonyms(q.match(/\b(low|medium|high|urgent|critical|important|asap)\b/i)?.[0] || '', PRIORITY_SYNONYMS) || 'Medium';
          if (taskText) return { tool: toolName, args: { task: taskText, deadline, priority }, description: `Add task "${taskText}"`, response: `I'll add the task "${taskText}"${deadline ? ' due ' + deadline : ''} with ${priority} priority.` };
          return null;
        },
      });
    }
    
    if (entityKey === 'rooms') {
      patterns.push({
        match: q => hasAny(q, [...createVerbs, 'allocate', 'assign', 'book', 'reserve', 'give', 'allot']) && (/\b(rooms?|allocation|hotel|accommodation|stay|lodging|hotel room|room booking)\b/i.test(q) || /\b(suite|deluxe|standard|premium|vip)\b/i.test(q)),
        parse: q => {
          const name = extractName(q, [...createVerbs, 'allocate', 'assign', 'book', 'reserve', 'give', 'allot', ...entityNouns, 'to', 'for'], []);
          const hotel = q.match(/(?:at|in|hotel|resort|inn)\s+([a-z][a-z\s]+?)(?:\s+(?:room|for|with|$))/i)?.[1]?.trim();
          const roomType = normalizeSynonyms(q.match(/\b(standard|deluxe|suite|premium|vip|ac|non-ac|non ac)\b/i)?.[0] || '', ROOM_TYPE_SYNONYMS) || 'Standard';
          const count = extractNumber(q);
          return { tool: 'allocate_rooms', args: { count: count || 1, hotel: hotel || 'TBD', roomType }, description: `Allocate ${count || 1} ${roomType} room(s)${hotel ? ' at ' + hotel : ''}`, response: `I'll allocate ${count || 1} ${roomType} room(s)${hotel ? ' at ' + hotel : ''}${name ? ' for ' + name : ''}.` };
        },
      });
    }
    
    if (entityKey === 'events') {
      patterns.push({
        match: q => hasAny(q, [...createVerbs, 'schedule', 'plan']) && hasAny(q, entityNouns),
        parse: q => {
          const name = extractName(q, [...createVerbs, 'schedule', 'plan'], ['the', 'a', 'an']);
          const date = extractDate(q);
          const time = extractTime(q);
          if (name) return { tool: '__event_create', args: { name, date, time }, description: `Create event "${name}"`, response: `I'll create the event "${name}"${date ? ' on ' + date : ''}${time ? ' at ' + time : ''}.` };
          return null;
        },
      });
    }
  }
  return patterns;
}

// ── KNOWLEDGE patterns ─────────────────────────────────────────────

function generateKnowledgePatterns(): PatternDef[] {
  return [
    {
      match: q => /\b(ritual|rituals|tradition|traditions|ceremony|ceremonies|customs|what.*happen|what.*include|what.*involve)\b/.test(q) && /\b(hindu|muslim|sikh|christian|jain|wedding)\b/.test(q),
      parse: q => {
        const religion = normalizeSynonyms(q.match(/\b(hindu|muslim|sikh|christian|jain)\b/i)?.[0] || '', { hindu: 'Hindu', muslim: 'Muslim', sikh: 'Sikh', christian: 'Christian', jain: 'Jain' });
        if (religion) return { tool: '__knowledge', args: { type: 'rituals', religion }, description: `${religion} wedding rituals`, response: '' };
        return null;
      },
    },
    {
      match: q => /\b(budget|allocation|percent|split|divide|breakdown|how much)\b/.test(q) && /\b(should|would|could|recommend|suggest|ideal|guide|advice|help|plan|advisor)\b/.test(q),
      parse: q => ({ tool: '__knowledge', args: { type: 'budget' }, description: 'Budget allocation advice', response: '' }),
    },
    {
      match: q => /\b(how much|price|cost|rate|charge|expensive|cheap|budget)\b/.test(q) && extractVendorType(q) !== undefined,
      parse: q => {
        const category = extractVendorType(q);
        if (category) return { tool: '__knowledge', args: { type: 'pricing', category }, description: `${category} pricing info`, response: '' };
        return null;
      },
    },
  ];
}

// ── QUERY patterns (LAST - only when no action verb) ───────────────

function generateQueryPatterns(): PatternDef[] {
  const patterns: PatternDef[] = [];
  
  for (const [entityKey, entityNouns] of Object.entries(TARGET_SYNONYMS)) {
    patterns.push({
      match: q => !hasActionVerb(q) && /\b(how many|count|total|number|number of)\b/.test(q) && hasAny(q, entityNouns),
      parse: q => ({ tool: '__query', args: { type: entityKey }, description: `Query ${entityKey}`, response: '' }),
    });
    patterns.push({
      match: q => !hasActionVerb(q) && /\b(show|list|display|give me|tell me|what are|what is)\b/.test(q) && hasAny(q, entityNouns),
      parse: q => ({ tool: '__query', args: { type: entityKey, filter: q }, description: `List ${entityKey}`, response: '' }),
    });
  }
  
  patterns.push({
    match: q => !hasActionVerb(q) && /\b(pending|remaining|left|todo|to-do|still)\b/.test(q),
    parse: q => ({ tool: '__query', args: { type: 'pending' }, description: 'Query pending items', response: '' }),
  });
  
  patterns.push({
    match: q => !hasActionVerb(q) && /\b(find|search|look|recommend|suggest|where)\b/.test(q) && extractVendorType(q) !== undefined && /\b(in|at|near|around)\b/.test(q),
    parse: q => {
      const city = q.match(/(?:in|at|near|around)\s+([a-z][a-z\s]+?)(?:\s|$)/i)?.[1]?.trim();
      const vendorType = extractVendorType(q);
      if (city && vendorType) return { tool: 'search_vendors', args: { query: `${vendorType.toLowerCase()} in ${city}` }, description: `Search ${vendorType} in ${city}`, response: `I'll search for ${vendorType.toLowerCase()} in ${city}.` };
      return null;
    },
  });
  
  return patterns;
}

// ── QUICK patterns ────────────────────────────────────────────────

function generateQuickPatterns(): PatternDef[] {
  return [
    { match: q => /^(yes|all\s*yes|mark\s*all|set\s*all|do\s*it|confirm|y|go|proceed|approve|accept)$/i.test(q), parse: q => ({ tool: '__quick', args: { action: 'confirm' }, description: 'Confirm', response: 'Confirmed!' }) },
    { match: q => /^(no|cancel|n|nah|nope|stop|abort|nevermind|never mind)$/i.test(q), parse: q => ({ tool: '__quick', args: { action: 'cancel' }, description: 'Cancel', response: 'Action cancelled.' }) },
    { match: q => /\b(help|what can you do|commands|options|menu|guide)\b/.test(q), parse: q => ({ tool: '__quick', args: { action: 'help' }, description: 'Show help', response: '' }) },
    { match: q => /\b(thank|thanks|thx|ty|appreciate|grateful)\b/.test(q), parse: q => ({ tool: '__quick', args: { action: 'thanks' }, description: 'Thanks', response: "You're welcome! Let me know if you need anything else for your wedding." }) },
  ];
}

// ─── Generate all patterns ────────────────────────────────────────

const ALL_PATTERNS: PatternDef[] = [
  ...generateQuickPatterns(),
  ...generateDeletePatterns(),
  ...generateUpdatePatterns(),
  ...generateCreatePatterns(),
  ...generateKnowledgePatterns(),
  ...generateQueryPatterns(),
];

// ─── Main parser ──────────────────────────────────────────────────

export function parseWithPatterns(q: string): ParsedCommand | null {
  const normalized = q.toLowerCase().trim();
  for (const pattern of ALL_PATTERNS) {
    if (pattern.match(normalized)) {
      const result = pattern.parse(normalized);
      if (result) return result;
    }
  }
  return null;
}

export function getPatternCategories(): string[] {
  return [
    'DELETE: guests (by name, dietary, side, RSVP, family), vendors (by name, contract, category), budget items, rooms, tasks, events',
    'CREATE: guests (with side/dietary/relation), vendors (with category/contact/quote), budget items, tasks, rooms, events',
    'UPDATE: guest RSVP/dietary/side, vendor contract/category/contact/quote, budget amount/category, task priority/deadline/status, room status/type, event date/time',
    'QUERIES: count, list, show, search vendors in city',
    'KNOWLEDGE: rituals, budget allocation, vendor pricing',
  ];
}
